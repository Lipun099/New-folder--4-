const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection(collection) {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeCollection(collection, data) {
  fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── MenuItem Collection ──────────────────────────────────────────────────────

const MenuItem = {
  find(filter = {}) {
    let items = readCollection('menu');
    if (filter.available !== undefined) {
      items = items.filter(i => i.available === filter.available);
    }
    // Sort by category then name
    return [...items].sort((a, b) =>
      a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    );
  },

  findById(id) {
    return readCollection('menu').find(i => i._id === id) || null;
  },

  create(data) {
    const items = readCollection('menu');
    const item = { _id: generateId(), ...data, createdAt: new Date().toISOString() };
    items.push(item);
    writeCollection('menu', items);
    return item;
  },

  findByIdAndUpdate(id, update) {
    const items = readCollection('menu');
    const idx = items.findIndex(i => i._id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...update };
    writeCollection('menu', items);
    return items[idx];
  },

  findByIdAndDelete(id) {
    const items = readCollection('menu');
    const idx = items.findIndex(i => i._id === id);
    if (idx === -1) return null;
    const [deleted] = items.splice(idx, 1);
    writeCollection('menu', items);
    return deleted;
  },

  deleteMany() {
    writeCollection('menu', []);
  },

  insertMany(arr) {
    const items = arr.map(d => ({
      _id: generateId(),
      ...d,
      createdAt: new Date().toISOString(),
    }));
    writeCollection('menu', items);
    return items;
  },
};

// ─── Order Collection ─────────────────────────────────────────────────────────

function getNextToken() {
  const orders = readCollection('orders');
  if (orders.length === 0) return 1;
  return Math.max(...orders.map(o => o.tokenNumber || 0)) + 1;
}

const Order = {
  find(filter = {}) {
    let orders = readCollection('orders');

    if (filter.status) orders = orders.filter(o => o.status === filter.status);
    if (filter.status && filter.status.$in) {
      orders = orders.filter(o => filter.status.$in.includes(o.status));
    }
    if (filter.createdAt) {
      const { $gte, $lte, $lt } = filter.createdAt;
      orders = orders.filter(o => {
        const d = new Date(o.createdAt);
        if ($gte && d < new Date($gte)) return false;
        if ($lte && d > new Date($lte)) return false;
        if ($lt && d >= new Date($lt)) return false;
        return true;
      });
    }

    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  findById(id) {
    return readCollection('orders').find(o => o._id === id) || null;
  },

  findOne(filter = {}) {
    const orders = readCollection('orders');
    if (filter.tokenNumber !== undefined) {
      return orders.find(o => o.tokenNumber === filter.tokenNumber) || null;
    }
    return null;
  },

  create(data) {
    const orders = readCollection('orders');
    const order = {
      _id: generateId(),
      tokenNumber: getNextToken(),
      status: 'pending',
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.push(order);
    writeCollection('orders', orders);
    return order;
  },

  findByIdAndUpdate(id, update) {
    const orders = readCollection('orders');
    const idx = orders.findIndex(o => o._id === id);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], ...update, updatedAt: new Date().toISOString() };
    writeCollection('orders', orders);
    return orders[idx];
  },

  countDocuments(filter = {}) {
    return Order.find(filter).length;
  },

  aggregate() {
    // Only used for totalRevenue sum
    const orders = readCollection('orders');
    const total = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return [{ _id: null, total }];
  },
};

module.exports = { MenuItem, Order };
