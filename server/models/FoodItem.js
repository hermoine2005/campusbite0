const mongoose = require('mongoose');
module.exports = mongoose.model('FoodItem', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, enum: ['Snacks', 'Meals', 'Fast Food', 'Beverages', 'Desserts'] },
  price: { type: Number, required: true, min: 1 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  prepTime: { type: Number, default: 10 },
  emoji: { type: String, default: '🍽️' },
  imageUrl: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true }));
