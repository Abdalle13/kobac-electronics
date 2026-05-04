import express from 'express';
import { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders, getOrders, updateOrderToDelivered, updateOrderToPaidAdmin, cancelOrder, getOrderSummary } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/summary').get(protect, admin, getOrderSummary);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/payadmin').put(protect, admin, updateOrderToPaidAdmin);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, cancelOrder);

export default router;
