import express from 'express';
import {
  getDashboardStats,
  getAllOrders,
  getAllUsers,
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  getAllReviews,
  updateReviewStatus,
  deleteReview,
} from '../controllers/adminController.js';

import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', protect, authorizeRoles('admin'), getDashboardStats);

// Orders
router.get('/orders', protect, authorizeRoles('admin'), getAllOrders);

// Users
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

// Coupons
router.post('/coupons', protect, authorizeRoles('admin'), createCoupon);
router.get('/coupons', protect, authorizeRoles('admin'), getCoupons);
router.put('/coupons/:id', protect, authorizeRoles('admin'), updateCoupon);
router.delete('/coupons/:id', protect, authorizeRoles('admin'), deleteCoupon);

// Banners
router.post('/banners', protect, authorizeRoles('admin'), createBanner);
router.get('/banners', protect, authorizeRoles('admin'), getBanners);
router.put('/banners/:id', protect, authorizeRoles('admin'), updateBanner);
router.delete('/banners/:id', protect, authorizeRoles('admin'), deleteBanner);

// Reviews
router.get('/reviews', protect, authorizeRoles('admin'), getAllReviews);
router.put('/reviews/:productId/:reviewId', protect, authorizeRoles('admin'), updateReviewStatus);
router.delete('/reviews/:productId/:reviewId', protect, authorizeRoles('admin'), deleteReview);

export default router;
