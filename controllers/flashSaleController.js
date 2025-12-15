import FlashSale from '../models/FlashSale.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a flash sale
// @route   POST /api/admin/flash-sales
// @access  Private/Admin
export const createFlashSale = asyncHandler(async (req, res) => {
  const { title, description, banner, products, startTime, endTime, status, priority, perUserLimit } = req.body;

  const flashSale = new FlashSale({
    title,
    description,
    banner,
    products,
    startTime,
    endTime,
    status,
    priority,
    perUserLimit,
    createdBy: req.user._id,
  });

  const createdFlashSale = await flashSale.save();
  res.status(201).json(createdFlashSale);
});

// @desc    Get all flash sales
// @route   GET /api/admin/flash-sales
// @access  Private/Admin
export const getFlashSales = asyncHandler(async (req, res) => {
  const flashSales = await FlashSale.find({}).populate('products.productId', 'name');
  res.json(flashSales);
});

// @desc    Get flash sale by ID
// @route   GET /api/admin/flash-sales/:id
// @access  Private/Admin
export const getFlashSaleById = asyncHandler(async (req, res) => {
  const flashSale = await FlashSale.findById(req.params.id).populate('products.productId', 'name');

  if (flashSale) {
    res.json(flashSale);
  } else {
    res.status(404);
    throw new Error('Flash sale not found');
  }
});

// @desc    Update a flash sale
// @route   PUT /api/admin/flash-sales/:id
// @access  Private/Admin
export const updateFlashSale = asyncHandler(async (req, res) => {
  const { title, description, banner, products, startTime, endTime, status, priority, perUserLimit } = req.body;

  const flashSale = await FlashSale.findById(req.params.id);

  if (flashSale) {
    flashSale.title = title;
    flashSale.description = description;
    flashSale.banner = banner;
    flashSale.products = products;
    flashSale.startTime = startTime;
    flashSale.endTime = endTime;
    flashSale.status = status;
    flashSale.priority = priority;
    flashSale.perUserLimit = perUserLimit;

    const updatedFlashSale = await flashSale.save();
    res.json(updatedFlashSale);
  } else {
    res.status(404);
    throw new Error('Flash sale not found');
  }
});

// @desc    Get all active flash sales
// @route   GET /api/flash-sales/active
// @access  Public
export const getActiveFlashSales = asyncHandler(async (req, res) => {
  const now = new Date();
  const flashSales = await FlashSale.find({
    startTime: { $lte: now },
    endTime: { $gt: now },
    status: 'active',
  }).populate('products.productId', 'name images');
  res.json(flashSales);
});

// @desc    Delete a flash sale
// @route   DELETE /api/admin/flash-sales/:id
// @access  Private/Admin
export const deleteFlashSale = asyncHandler(async (req, res) => {
  const flashSale = await FlashSale.findById(req.params.id);

  if (flashSale) {
    await flashSale.remove();
    res.json({ message: 'Flash sale removed' });
  } else {
    res.status(404);
    throw new Error('Flash sale not found');
  }
});
