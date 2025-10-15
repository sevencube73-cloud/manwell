const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

// Admin routes
router.post('/', couponController.createCoupon);
router.get('/', couponController.getAllCoupons);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

// Public route — validate coupon during checkout
router.post('/validate', couponController.validateCoupon);

module.exports = router;
