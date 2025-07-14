import { Router } from 'express';
import * as voiceController from '../controllers/voiceController.js';
import { validateVoiceInput } from '../middleware/validation.js';

const router = Router();

// 음성 처리
router.post('/process', validateVoiceInput, voiceController.processVoiceCommand);
router.get('/session/:sessionId', voiceController.getSessionLogs);

// 음성 로그 조회 (관리자용)
router.get('/logs', voiceController.getVoiceLogs);
router.get('/stats', voiceController.getVoiceStats);

export default router;