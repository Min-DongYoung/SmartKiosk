import { Router } from 'express';
import * as orderController from '../controllers/orderController.js';
import { validateOrder } from '../middleware/validation.js';

const router = Router();

// 주문 생성 및 조회
router.post('/', validateOrder, orderController.createOrder);
router.get('/:orderNumber', orderController.getOrderByNumber);
router.get('/id/:id', orderController.getOrderById);

// 주문 상태 업데이트
router.patch('/:id/status', orderController.updateOrderStatus);
router.patch('/:id/cancel', orderController.cancelOrder);

// 주문 목록 (관리자용)
router.get('/', orderController.getOrders);
router.get('/stats/today', orderController.getTodayStats);

export default router;