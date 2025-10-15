const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

// Admin routes
router.post('/', discountController.createDiscount);
router.get('/', discountController.getAllDiscounts);
router.put('/:id', discountController.updateDiscount);
router.delete('/:id', discountController.deleteDiscount);

// Public route — fetch active discounts
router.get('/active/list', discountController.getActiveDiscounts);

module.exports = router;
