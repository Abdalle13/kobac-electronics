import express from 'express';
import { getProducts, getProductById, createProduct, toggleProductStatus, updateProduct } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/:id').get(getProductById).put(protect, admin, updateProduct);
router.route('/:id/status').put(protect, admin, toggleProductStatus);

export default router;
