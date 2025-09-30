const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const { verifyJWT } = require('./auth'); // Import verifyJWT from auth routes or duplicate if needed

const router = express.Router();

// Helper to generate order number (daily count)
async function generateOrderNumber() {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const count = await Order.countDocuments({
    createdAt: {
      $gte: new Date(today),
      $lt: new Date(today + 'T23:59:59.999Z')
    }
  });
  const orderCount = count + 1;
  return `${today}-${orderCount.toString().padStart(4, '0')}`;
}

// POST /api/orders - Create new order (protected)
router.post('/', verifyJWT, async (req, res) => {
  try {
    const { customerInfo, items, subtotal, tax, total, orderType, paymentMethod, paymentStatus, specialInstructions, tableNumber } = req.body;
    const cashierId = req.user.userId;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required.' });
    }

    // Get cashier
    const cashier = await User.findById(cashierId);
    if (!cashier) {
      return res.status(404).json({ error: 'Cashier not found.' });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order items with IDs
    const orderItems = items.map(item => ({
      ...item,
      id: new mongoose.Types.ObjectId().toString(), // Simple ID for now
      status: 'pending'
    }));

    // Create order
    const order = new Order({
      userId: cashierId, // For now, use cashier as userId; adjust for customer later
      orderNumber,
      customerInfo,
      items: orderItems,
      subtotal,
      tax,
      total,
      orderType,
      paymentMethod,
      paymentStatus,
      status: 'pending',
      specialInstructions,
      tableNumber
    });

    await order.save();

    // TODO: Integrate inventory check and deduction (from inventory_service)
    // For now, assume available; add errors array if needed

    // TODO: Record shift sale if applicable (from shift_service)

    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        ...order.toObject() // Exclude sensitive fields if any
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// GET /api/orders/:id - Get order by ID (protected)
router.get('/:id', verifyJWT, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name role');
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ success: true, order: order.toObject() });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// PUT /api/orders/:id/status - Update order status (protected)
router.put('/:id/status', verifyJWT, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updatedBy = req.user.userId;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        updatedAt: new Date(),
        // Add timestamps based on status as in original
        ...(status === 'preparing' && { kitchenStartedAt: new Date(), kitchenStartedBy: updatedBy }),
        ...(status === 'ready' && { readyAt: new Date(), readyBy: updatedBy }),
        ...(status === 'delivered' && { deliveredAt: new Date(), deliveredBy: updatedBy }),
        ...(status === 'void' && { voidedAt: new Date(), voidedBy: updatedBy, voidReason: notes })
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name');

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // TODO: Update indexes or KV if needed; restore stock for void if applicable

    res.json({ success: true, order: order.toObject() });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// GET /api/orders/status/:status - Get orders by status (protected)
router.get('/status/:status', verifyJWT, async (req, res) => {
  try {
    const orders = await Order.find({ status: req.params.status })
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders: orders.map(o => o.toObject()) });
  } catch (error) {
    console.error('Get orders by status error:', error);
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// GET /api/orders/kitchen - Kitchen orders (pending, preparing, ready) (protected)
router.get('/kitchen', verifyJWT, async (req, res) => {
  try {
    const statuses = ['pending', 'preparing', 'ready'];
    const orders = await Order.find({ status: { $in: statuses } })
      .populate('userId', 'name role')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders: orders.map(o => o.toObject()) });
  } catch (error) {
    console.error('Get kitchen orders error:', error);
    res.status(500).json({ error: 'Failed to fetch kitchen orders.' });
  }
});

// DELETE /api/orders/:id/void - Void order (protected, admin/supervisor)
router.delete('/:id/void', verifyJWT, async (req, res) => {
  try {
    const { reason, restoreStock = true } = req.body;
    const voidedBy = req.user.userId;

    // Check role (assume req.user.role from JWT)
    if (!['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order || ['void', 'completed'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot void this order.' });
    }

    // TODO: Restore stock if restoreStock && payment completed (integrate inventory)

    // Update to void
    order.status = 'void';
    order.voidedAt = new Date();
    order.voidedBy = voidedBy;
    order.voidReason = reason;
    await order.save();

    // TODO: Record void in shift if cash

    res.json({ success: true, message: 'Order voided successfully.' });
  } catch (error) {
    console.error('Void order error:', error);
    res.status(500).json({ error: 'Failed to void order.' });
  }
});

// POST /api/orders/:id/refund - Process refund (protected)
router.post('/:id/refund', verifyJWT, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const refundedBy = req.user.userId;

    const order = await Order.findById(req.params.id);
    if (!order || order.paymentStatus !== 'completed') {
      return res.status(400).json({ error: 'Cannot refund this order.' });
    }

    if (amount > order.total) {
      return res.status(400).json({ error: 'Refund amount exceeds order total.' });
    }

    // Update payment status if full refund
    if (amount >= order.total) {
      order.paymentStatus = 'refunded';
    }
    order.updatedAt = new Date();
    await order.save();

    // TODO: Record refund in shift if cash

    res.json({ success: true, message: `Refund of ${amount} processed.` });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Failed to process refund.' });
  }
});

// PUT /api/orders/:id/items/:itemId/status - Update item status (protected)
router.put('/:id/items/:itemId/status', verifyJWT, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const item = order.items.id(req.params.itemId); // Mongoose array find
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    item.status = status;
    order.updatedAt = new Date();

    // Check if all items ready
    const allReady = order.items.every(i => i.status === 'ready');
    if (allReady && order.status === 'preparing') {
      order.status = 'ready';
      order.readyAt = new Date();
      order.readyBy = req.user.userId;
    }

    await order.save();
    res.json({ success: true, order: order.toObject() });
  } catch (error) {
    console.error('Update item status error:', error);
    res.status(500).json({ error: 'Failed to update item status.' });
  }
});

// GET /api/orders/daily-summary/:date - Daily sales summary (protected, admin)
router.get('/daily-summary/:date', verifyJWT, async (req, res) => {
  try {
    if (!['admin', 'supervisor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const startDate = new Date(req.params.date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lt: endDate },
      status: { $ne: 'void' }
    }).populate('userId', 'name');

    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    const ordersByType = orders.reduce((acc, o) => {
      acc[o.orderType] = (acc[o.orderType] || 0) + 1;
      return acc;
    }, {});

    const ordersByPayment = orders.reduce((acc, o) => {
      acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + 1;
      return acc;
    }, {});

    // Top selling items
    const itemSales = new Map();
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales.has(item.name)) {
          itemSales.set(item.name, { quantity: 0, revenue: 0 });
        }
        const data = itemSales.get(item.name);
        data.quantity += item.quantity;
        data.revenue += item.total;
      });
    });

    const topSellingItems = Array.from(itemSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      totalOrders,
      totalSales,
      averageOrderValue,
      ordersByType,
      ordersByPayment,
      topSellingItems
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ error: 'Failed to fetch daily summary.' });
  }
});

module.exports = router;
