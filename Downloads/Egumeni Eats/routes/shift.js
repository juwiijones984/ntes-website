const express = require('express');
const mongoose = require('mongoose');
const Shift = require('../models/Shift');
const User = require('../models/User');
const { verifyJWT } = require('./auth');

const router = express.Router();

// Helper to check role
const checkRole = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions.' });
  }
  next();
};

// POST /api/shift/open - Open new shift (cashier/supervisor)
router.post('/open', verifyJWT, checkRole(['cashier', 'supervisor']), async (req, res) => {
  try {
    const { openingFloat, date } = req.body;
    if (!openingFloat || openingFloat < 0) {
      return res.status(400).json({ error: 'Valid opening float required.' });
    }

    // Check if current shift is open
    const currentShift = await Shift.findOne({ status: 'open' });
    if (currentShift) {
      return res.status(400).json({ error: 'An open shift already exists.' });
    }

    const cashier = await User.findById(req.user.userId);
    if (!cashier) {
      return res.status(404).json({ error: 'Cashier not found.' });
    }

    const shift = new Shift({
      cashierId: req.user.userId,
      cashierName: cashier.name,
      openingFloat: parseFloat(openingFloat),
      openingDate: date || new Date(),
      status: 'open'
    });
    await shift.save();

    res.status(201).json({ success: true, shift: shift.toObject() });
  } catch (error) {
    console.error('Open shift error:', error);
    res.status(500).json({ error: 'Failed to open shift.' });
  }
});

// GET /api/shift/current - Get current shift
router.get('/current', verifyJWT, async (req, res) => {
  try {
    const shift = await Shift.findOne({ status: 'open' }).populate('cashierId', 'name');
    if (!shift) {
      return res.json({ success: true, shift: null });
    }
    res.json({ success: true, shift: shift.toObject() });
  } catch (error) {
    console.error('Get current shift error:', error);
    res.status(500).json({ error: 'Failed to get current shift.' });
  }
});

// POST /api/shift/cash-up - Perform cash up (cashier/supervisor)
router.post('/cash-up', verifyJWT, checkRole(['cashier', 'supervisor']), async (req, res) => {
  try {
    const { shiftId, denominations, type } = req.body;
    if (!shiftId || !denominations || !type) {
      return res.status(400).json({ error: 'Shift ID, denominations, and type required.' });
    }

    const shift = await Shift.findById(shiftId).populate('cashierId', 'name');
    if (!shift || shift.status !== 'open') {
      return res.status(400).json({ error: 'Invalid shift.' });
    }

    // Calculate actual cash from denominations
    let actualCash = 0;
    for (const [denom, count] of Object.entries(denominations)) {
      actualCash += parseFloat(denom) * count;
    }

    const totalSales = 0; // TODO: Calculate from orders in shift
    const discrepancy = actualCash - (shift.openingFloat + totalSales);

    shift.closingFloat = actualCash;
    shift.actualCash = actualCash;
    shift.discrepancy = discrepancy;
    shift.denominations = denominations;
    shift.cashUpType = type;
    shift.status = 'pending_approval';
    shift.closedAt = new Date();
    await shift.save();

    // TODO: Record sales, voids, refunds in shift (integrate with orders)

    res.json({ success: true, cashUp: { actualCash, discrepancy, type } });
  } catch (error) {
    console.error('Cash up error:', error);
    res.status(500).json({ error: 'Failed to perform cash up.' });
  }
});

// POST /api/shift/approve/:shiftId - Approve shift (supervisor)
router.post('/approve/:shiftId', verifyJWT, checkRole(['supervisor']), async (req, res) => {
  try {
    const { notes } = req.body;
    const shiftId = req.params.shiftId;

    const shift = await Shift.findById(shiftId);
    if (!shift || shift.status !== 'pending_approval') {
      return res.status(400).json({ error: 'Invalid shift for approval.' });
    }

    const supervisor = await User.findById(req.user.userId);
    if (!supervisor) {
      return res.status(404).json({ error: 'Supervisor not found.' });
    }

    shift.status = 'approved';
    shift.approvedBy = req.user.userId;
    shift.approvedName = supervisor.name;
    shift.approvalNotes = notes;
    shift.approvedAt = new Date();
    await shift.save();

    res.json({ success: true, message: 'Shift approved successfully.' });
  } catch (error) {
    console.error('Approve shift error:', error);
    res.status(500).json({ error: 'Failed to approve shift.' });
  }
});

// GET /api/shift/pending-approval - Get shifts requiring approval (supervisor)
router.get('/pending-approval', verifyJWT, checkRole(['supervisor']), async (req, res) => {
  try {
    const shifts = await Shift.find({ status: 'pending_approval' })
      .populate('cashierId', 'name')
      .populate('approvedBy', 'name')
      .sort({ closedAt: -1 });
    res.json({ success: true, shifts: shifts.map(s => s.toObject()) });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ error: 'Failed to get pending approvals.' });
  }
});

// GET /api/shift/:date - Get shifts by date (supervisor/admin)
router.get('/:date', verifyJWT, checkRole(['supervisor', 'admin']), async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const shifts = await Shift.find({
      openingDate: { $gte: startDate, $lt: endDate }
    }).populate('cashierId', 'name').populate('approvedBy', 'name').sort({ openingDate: -1 });
    res.json({ success: true, shifts: shifts.map(s => s.toObject()) });
  } catch (error) {
    console.error('Get shifts by date error:', error);
    res.status(500).json({ error: 'Failed to fetch shifts.' });
  }
});

module.exports = router;
