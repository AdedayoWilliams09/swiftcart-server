import express from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('admin'), createCategory);
router.get('/', getCategories);
router.put('/:id', protect, authorizeRoles('admin'), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

export default router;