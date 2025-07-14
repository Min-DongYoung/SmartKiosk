import { Router } from 'express';
import * as configController from '../controllers/configController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

// 설정 조회
router.get('/', configController.getConfig);
router.get('/operating-status', configController.getOperatingStatus);

// 설정 변경 (관리자)
router.put('/', authenticate, isAdmin, configController.updateConfig);
router.patch('/maintenance', authenticate, isAdmin, configController.toggleMaintenanceMode);

export default router;