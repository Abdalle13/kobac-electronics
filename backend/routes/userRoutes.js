import express from 'express';
import {
  authUser,
  registerUser,
  getUsers,
  getUserProfile,
  updateUserProfile,
  toggleUserStatus,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getUsers);
router.route('/:id/status').put(protect, admin, toggleUserStatus);
router.route('/register').post(registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
