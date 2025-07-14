import { Router } from 'express';
import * as menuController from '../controllers/menuController.js';
import { validateMenu } from '../middleware/validation.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = Router();

// 공개 라우트
router.get('/', menuController.getAllMenus);
router.get('/category/:category', menuController.getMenusByCategory);
router.get('/search', menuController.searchMenus);
router.get('/:id', menuController.getMenuById);

// 관리자 라우트
router.post('/', authenticate, isAdmin, validateMenu, menuController.createMenu);
router.put('/:id', authenticate, isAdmin, validateMenu, menuController.updateMenu);
router.delete('/:id', authenticate, isAdmin, menuController.deleteMenu);
router.patch('/:id/availability', authenticate, isAdmin, menuController.toggleAvailability);

export default router;