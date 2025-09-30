const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  cashierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cashierName: {
    type: String,
    required: true
  },
  openingFloat: {
    type: Number,
    required: true,
    min: 0
  },
  openingDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'approved', 'pending_approval'],
    default: 'open',
    required: true
  },
  closingFloat: {
    type: Number,
    min: 0
  },
  actualCash: {
    type: Number,
    min: 0
  },
  discrepancy: {
    type: Number
  },
  denominations: {
    type: Object // e.g., { '10': 5, '20': 3 }
  },
  cashUpType: {
    type: String,
    enum: ['balanced', 'short', 'over']
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalVoids: {
    type: Number,
    default: 0
  },
  totalRefunds: {
    type: Number,
    default: 0
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedName: {
    type: String
  },
  approvalNotes: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for current shifts
shiftSchema.index({ status: 1, openingDate: -1 });

module.exports = mongoose.model('Shift', shiftSchema);
