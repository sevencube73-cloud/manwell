const express = require('express');
const router = express.Router();
const Deal = require('../models/Deal');
// Placeholder admin middleware
const requireAdmin = (req, res, next) => { /* TODO: implement admin check */ next(); };

// Create a deal (admin only)
router.post('/deals', requireAdmin, async (req, res) => {
  try {
    const deal = new Deal(req.body);
    await deal.save();
    res.status(201).json(deal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// List all active deals
router.get('/deals', async (req, res) => {
  try {
    const deals = await Deal.find({ active: true });
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single deal
router.get('/deals/:id', async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a deal (admin only)
router.put('/deals/:id', requireAdmin, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a deal (admin only)
router.delete('/deals/:id', requireAdmin, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ error: 'Deal not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /deals/active - only currently active deals
router.get('/deals/active', async (req, res) => {
  try {
    const deals = await Deal.find({ active: true });
    const activeDeals = deals.filter(d => d.isActive());
    res.json(activeDeals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
