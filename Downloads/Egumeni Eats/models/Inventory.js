const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['appetizer', 'main', 'dessert', 'drink', 'side']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    default: 'unit'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  }
}, {
  timestamps: true
});

// Index for fast queries
inventorySchema.index({ category: 1, isActive: 1 });
inventorySchema.index({ name: 'text' });

module.exports = mongoose.model('Inventory', inventorySchema);
