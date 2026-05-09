const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect: auth } = require('../middleware/auth');
const router = require('express').Router();

// GET all inventory
router.get('/', auth, async (req, res) => {
  try {
    const inventory = await prisma.inventory.findMany({ orderBy: { name: 'asc' } });
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// POST add item
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, quantity, condition, location } = req.body;
    const item = await prisma.inventory.create({
      data: { name, category, quantity: parseInt(quantity), condition: condition || 'good', location }
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// PATCH change condition (splits quantity)
router.patch('/:id/condition', auth, async (req, res) => {
  try {
    const { quantity, newCondition } = req.body;
    const id = parseInt(req.params.id);
    const item = await prisma.inventory.findUnique({ where: { id } });

    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (quantity > item.quantity) return res.status(400).json({ error: 'Quantity exceeds stock' });

    // Reduce from current item
    await prisma.inventory.update({
      where: { id },
      data: { quantity: item.quantity - quantity }
    });

    // Check if same item with new condition already exists
    const existing = await prisma.inventory.findFirst({
      where: { name: item.name, category: item.category, location: item.location, condition: newCondition }
    });

    if (existing) {
      // Merge into existing
      await prisma.inventory.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity }
      });
    } else {
      // Create new row
      await prisma.inventory.create({
        data: { name: item.name, category: item.category, quantity, condition: newCondition, location: item.location }
      });
    }

    // Delete row if quantity reaches 0
    const updated = await prisma.inventory.findUnique({ where: { id } });
    if (updated && updated.quantity === 0) {
      await prisma.inventory.delete({ where: { id } });
    }

    const allInventory = await prisma.inventory.findMany({ orderBy: { name: 'asc' } });
    res.json(allInventory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update condition' });
  }
});

// PUT update item quantity
router.put('/:id', auth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const item = await prisma.inventory.update({
      where: { id: parseInt(req.params.id) },
      data: { quantity: parseInt(quantity) }
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

// DELETE item
router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.inventory.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;