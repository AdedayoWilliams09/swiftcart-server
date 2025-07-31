import express from 'express';
import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  getProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/update-password', protect, updatePassword);
router.get('/profile', protect, getProfile);

export default router;