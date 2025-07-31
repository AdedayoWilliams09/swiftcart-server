import express from 'express';
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import upload from '../config/multer.js';
import { addProductReview } from '../controllers/productController.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorizeRoles('admin'),
  upload.array('images', 5), // up to 5 images
  createProduct
);

router.post('/:id/reviews', protect, addProductReview);

router.get('/', getProducts);
router.get('/:id', getProduct);

router.put(
  '/:id',
  protect,
  authorizeRoles('admin'),
  upload.array('images', 5),
  updateProduct
);

router.delete('/:id', protect, authorizeRoles('admin'), deleteProduct);

export default router;