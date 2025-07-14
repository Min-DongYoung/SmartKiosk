import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router();

router.get('/popular-menus', analyticsController.getPopularMenus);
router.get('/hourly-stats', analyticsController.getHourlyStats);

export default router;