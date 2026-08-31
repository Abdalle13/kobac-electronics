import express from 'express';
import {
  authUser,
  registerUser,
  getUsers,
  getUserProfile,
  updateUserProfile,
  toggleUserStatus,
  updateUserRole,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';

const router = express.Router();

router.route('/').get(protect, admin, getUsers);
router.route('/register').post(registerUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.get('/wishlist', protect, getWishlist);
router.route('/wishlist/:productId')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);
router.route('/:id/status').put(protect, admin, toggleUserStatus);
router.route('/:id/role').put(protect, admin, updateUserRole);

export default router;
