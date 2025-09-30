const express = require('express');
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const { verifyJWT } = require('./auth'); // Assuming shared verifyJWT

const router = express.Router();

// GET /api/inventory - Get all inventory items (protected)
router.get('/', verifyJWT, async (req, res) => {
  try {
    const { category, search, active } = req.query;
    let query = {};

    if (category) query.category = category;
    if (active !== undefined) query.isActive = active === 'true';
    if (search) query.name = { $regex: search, $options: 'i' };

    const items = await Inventory.find(query).sort({ name: 1 });
    res.json({ success: true, items: items.map(i => i.toObject()) });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory.' });
  }
});

// GET /api/inventory/:id - Get inventory item by ID (protected)
router.get('/:id', verifyJWT, async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    res.json({ success: true, item: item.toObject() });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item.' });
  }
});

// POST /api/inventory - Create new inventory item (protected, stores/admin)
router.post('/', verifyJWT, async (req, res) => {
  try {
    // Role check
    if (!['stores', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json({ success: true, item: item.toObject() });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(400).json({ error: 'Failed to create item.' });
  }
});

// PUT /api/inventory/:id - Update inventory item (protected, stores/admin)
router.put('/:id', verifyJWT, async (req, res) => {
  try {
    if (!['stores', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    res.json({ success: true, item: item.toObject() });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(400).json({ error: 'Failed to update item.' });
  }
});

// POST /api/inventory/:id/decrement - Decrement stock (protected, for orders/kitchen)
router.post('/:id/decrement', verifyJWT, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity required.' });
    }

    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.quantity < quantity) {
      return res.status(400).json({ error: 'Insufficient stock.' });
    }

    item.quantity -= quantity;
    item.updatedAt = new Date();
    await item.save();

    res.json({ success: true, item: item.toObject() });
  } catch (error) {
    console.error('Decrement stock error:', error);
    res.status(500).json({ error: 'Failed to decrement stock.' });
  }
});

// POST /api/inventory/:id/increment - Increment stock (protected, stores)
router.post('/:id/increment', verifyJWT, async (req, res) => {
  try {
    if (!['stores', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity required.' });
    }

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity } },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    res.json({ success: true, item: item.toObject() });
  } catch (error) {
    console.error('Increment stock error:', error);
    res.status(500).json({ error: 'Failed to increment stock.' });
  }
});

// GET /api/inventory/low-stock - Get low stock items (protected)
router.get('/low-stock', verifyJWT, async (req, res) => {
  try {
    const items = await Inventory.find({
      quantity: { $lte: '$lowStockThreshold' },
      isActive: true
    }).sort({ quantity: 1 });
    res.json({ success: true, items: items.map(i => i.toObject()) });
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock items.' });
  }
});

// POST /api/inventory/receipt - Receive stock (protected, stores)
router.post('/receipt', verifyJWT, async (req, res) => {
  try {
    if (!['stores', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const { items, totalCost, receivedBy } = req.body;
    const receiptNumber = `REC-${Date.now()}`;

    // Process each item: increment stock
    for (const itemData of items) {
      const item = await Inventory.findById(itemData.inventoryId);
      if (item) {
        item.quantity += itemData.quantity;
        if (itemData.unitCost) item.unitCost = itemData.unitCost; // Average or set
        await item.save();
      }
    }

    // TODO: Save receipt record (need Receipt model)

    res.status(201).json({ success: true, receiptNumber, totalCost });
  } catch (error) {
    console.error('Receive stock error:', error);
    res.status(500).json({ error: 'Failed to receive stock.' });
  }
});

// POST /api/inventory/issue - Create stock issue (protected)
router.post('/issue', verifyJWT, async (req, res) => {
  try {
    // Role check for kitchen/stores
    if (!['kitchen', 'stores', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const { items, purpose } = req.body;
    const issueId = new mongoose.Types.ObjectId();

    // TODO: Save issue record (need Issue model), check availability

    // For now, decrement if possible
    const failedItems = [];
    for (const itemData of items) {
      const item = await Inventory.findById(itemData.inventoryId);
      if (item && item.quantity >= itemData.quantity) {
        item.quantity -= itemData.quantity;
        await item.save();
      } else {
        failedItems.push(itemData.name);
      }
    }

    if (failedItems.length > 0) {
      return res.status(400).json({ error: `Failed items: ${failedItems.join(', ')}` });
    }

    res.status(201).json({ success: true, issueId: issueId.toString() });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create stock issue.' });
  }
});

// GET /api/inventory/recipe/:menuItemId - Get recipe (stub, no model yet)
router.get('/recipe/:menuItemId', verifyJWT, async (req, res) => {
  try {
    // TODO: Implement Recipe model and KV-like storage
    // For now, return mock or null
    res.json({ success: true, recipe: null }); // Placeholder
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe.' });
  }
});

// POST /api/inventory/recipe - Set recipe (stub)
router.post('/recipe', verifyJWT, async (req, res) => {
  try {
    if (!['admin', 'stores'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }

    const { menuItemId, ingredients } = req.body;
    // TODO: Save to Recipe collection
    res.status(201).json({ success: true, message: 'Recipe saved.' });
  } catch (error) {
    console.error('Set recipe error:', error);
    res.status(500).json({ error: 'Failed to save recipe.' });
  }
});

// Additional stubs for count, issues, etc.
// POST /api/inventory/count - Create stock count
router.post('/count', verifyJWT, async (req, res) => {
  try {
    // TODO: Implement StockCount model
    res.status(201).json({ success: true, message: 'Stock count created.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create stock count.' });
  }
});

// PUT /api/inventory/count/:id/approve - Approve stock count
router.put('/count/:id/approve', verifyJWT, async (req, res) => {
  try {
    // TODO: Adjust inventory based on count
    res.json({ success: true, message: 'Stock count approved.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve stock count.' });
  }
});

// GET /api/inventory/issues/pending - Get pending issues
router.get('/issues/pending', verifyJWT, async (req, res) => {
  try {
    // TODO: Query Issue model
    res.json({ success: true, issues: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending issues.' });
  }
});

module.exports = router;
