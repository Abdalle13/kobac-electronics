import express from 'express';
import { getProducts, getBestSellers, getRecentReviews, getProductFilters, getProductById, createProduct, toggleProductStatus, updateProduct, deleteProduct, createProductReview, deleteProductReview } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.get('/filters', getProductFilters);
router.get('/best-sellers', getBestSellers);
router.get('/reviews/recent', getRecentReviews);
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
router.route('/:id/status').put(protect, admin, toggleProductStatus);
router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId').delete(protect, admin, deleteProductReview);

export default router;
