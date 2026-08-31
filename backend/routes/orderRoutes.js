import express from 'express';
import { addOrderItems, getOrderById, updateOrderToPaid, getMyOrders, getOrders, updateOrderToDelivered, updateOrderToPaidAdmin, cancelOrder, payInstallment, getRiderOrders, assignRider, updateDeliveryStatus, getOrderSummary } from '../controllers/orderController.js';
import { protect, admin, rider } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/summary').get(protect, admin, getOrderSummary);
router.route('/myorders').get(protect, getMyOrders);
router.route('/rider').get(protect, rider, getRiderOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/payadmin').put(protect, admin, updateOrderToPaidAdmin);
router.route('/:id/installments/:index/pay').put(protect, payInstallment);
router.route('/:id/assign').put(protect, admin, assignRider);
router.route('/:id/delivery').put(protect, updateDeliveryStatus);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/cancel').put(protect, cancelOrder);

export default router;
