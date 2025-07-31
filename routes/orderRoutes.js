import express from 'express';
import {
  placeOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { createPaystackTransaction, paystackWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/my', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);

// Payment
router.post('/pay/paystack', protect, createPaystackTransaction);
router.post('/paystack/webhook', paystackWebhook); // For Paystack to notify you

export default router;