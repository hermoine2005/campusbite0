const mongoose = require('mongoose');
const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
const schema = new mongoose.Schema({
  orderNo: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ food: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }, name: String, price: Number, qty: Number }], // snapshot
  total: { type: Number, required: true },
  pickupTime: { type: Date, required: true },
  payment: { type: String, default: 'Cash at Pickup' },
  status: { type: String, enum: STATUSES, default: 'Pending' },
  requestKey: { type: String, unique: true, sparse: true } // blocks duplicate checkout
}, { timestamps: true });
module.exports = mongoose.model('Order', schema);
module.exports.STATUSES = STATUSES;
