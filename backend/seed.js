// Seed the local JSON database with initial menu items
const { MenuItem } = require('./db');

const menuData = [
  // Hot Beverages
  { name: 'Tea', category: 'Hot Beverages', price: 30, emoji: '🍵', available: true },
  { name: 'Lemon Tea', category: 'Hot Beverages', price: 35, emoji: '🍋', available: true },
  { name: 'Green Tea', category: 'Hot Beverages', price: 40, emoji: '🍃', available: true },
  { name: 'Hot Coffee', category: 'Hot Beverages', price: 50, emoji: '☕', available: true },
  { name: 'Black Coffee', category: 'Hot Beverages', price: 45, emoji: '☕', available: true },

  // Coffee
  { name: 'Americano', category: 'Coffee', price: 120, emoji: '☕', available: true },
  { name: 'Cappuccino', category: 'Coffee', price: 140, emoji: '☕', available: true },
  { name: 'Cafe Latte', category: 'Coffee', price: 150, emoji: '☕', available: true },
  { name: 'Cold Coffee', category: 'Coffee', price: 120, emoji: '🧊', available: true },
  { name: 'Hazelnut Coffee', category: 'Coffee', price: 160, emoji: '☕', available: true },

  // Cold Beverages
  { name: 'Oreo Shake', category: 'Cold Beverages', price: 150, emoji: '🍦', available: true },
  { name: 'KitKat Shake', category: 'Cold Beverages', price: 160, emoji: '🍫', available: true },
  { name: 'Chocolate Shake', category: 'Cold Beverages', price: 140, emoji: '🍫', available: true },
  { name: 'Mango Shake', category: 'Cold Beverages', price: 130, emoji: '🥭', available: true },

  // Bites & Delights
  { name: 'Bun Maska', category: 'Bites & Delights', price: 40, emoji: '🥐', available: true },
  { name: 'French Fries', category: 'Bites & Delights', price: 80, emoji: '🍟', available: true },
  { name: 'Peri Peri Fries', category: 'Bites & Delights', price: 90, emoji: '🌶️', available: true },
  { name: 'Vegetable Maggi', category: 'Bites & Delights', price: 60, emoji: '🍜', available: true },
  { name: 'Paneer Maggi', category: 'Bites & Delights', price: 80, emoji: '🍜', available: true },
  { name: 'Red Sauce Pasta', category: 'Bites & Delights', price: 130, emoji: '🍝', available: true },
  { name: 'White Sauce Pasta', category: 'Bites & Delights', price: 130, emoji: '🍝', available: true },
  { name: 'Corn Sandwich', category: 'Bites & Delights', price: 90, emoji: '🥪', available: true },
  { name: 'Veg Sandwich', category: 'Bites & Delights', price: 80, emoji: '🥪', available: true },
  { name: 'Paneer Sandwich', category: 'Bites & Delights', price: 100, emoji: '🥪', available: true },
  { name: 'Veg Nuggets', category: 'Bites & Delights', price: 100, emoji: '🍗', available: true },
  { name: 'Cheesy Shots', category: 'Bites & Delights', price: 110, emoji: '🧀', available: true },
  { name: 'Popcorn', category: 'Bites & Delights', price: 60, emoji: '🍿', available: true },
];

try {
  MenuItem.deleteMany();
  const inserted = MenuItem.insertMany(menuData);
  console.log(`✅ Seeded ${inserted.length} menu items to data/menu.json`);
} catch (err) {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
}
