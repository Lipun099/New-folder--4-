const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    tokenNumber: { type: Number, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    tableNumber: { type: String, required: true, trim: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'completed'],
      default: 'pending',
    },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate token number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastOrder = await mongoose.model('Order').findOne().sort({ tokenNumber: -1 });
    this.tokenNumber = lastOrder ? lastOrder.tokenNumber + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
