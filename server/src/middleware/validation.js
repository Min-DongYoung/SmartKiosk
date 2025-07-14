import { body, validationResult } from 'express-validator';

// 유효성 검증 결과 확인 미들웨어
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }
  next();
};

// 메뉴 유효성 검증
export const validateMenu = [
  body('name')
    .notEmpty().withMessage('메뉴 이름은 필수입니다')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('메뉴 이름은 2-50자여야 합니다'),
  body('price')
    .notEmpty().withMessage('가격은 필수입니다')
    .isInt({ min: 0 }).withMessage('가격은 0 이상의 정수여야 합니다'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('설명은 200자 이내여야 합니다'),
  body('category')
    .notEmpty().withMessage('카테고리는 필수입니다')
    .isIn(['커피', '에이드', '스무디', '티', '라떼', '디저트']).withMessage('유효하지 않은 카테고리입니다'),
  body('imageUrl') // image -> imageUrl 변경
    .notEmpty().withMessage('이미지 URL은 필수입니다')
    .isURL().withMessage('유효한 URL이 아닙니다'),
  body('temperatureOptions')
    .optional()
    .isArray().withMessage('온도 옵션은 배열이어야 합니다'),
  body('sizeOptions')
    .optional()
    .isArray().withMessage('사이즈 옵션은 배열이어야 합니다'),
  body('adminPriority')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1, max: 10 }).withMessage('우선순위는 1-10 사이의 정수여야 합니다'),
  body('popularity')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 0 }).withMessage('인기도는 0 이상의 정수여야 합니다'),
  validate
];

// 주문 유효성 검증
export const validateOrder = [
  body('items')
    .isArray({ min: 1 }).withMessage('주문 항목이 최소 1개 이상 있어야 합니다')
    .custom((items) => {
      for (const item of items) {
        if (!item.menuId || !item.quantity || item.quantity < 1) {
          return false;
        }
      }
      return true;
    }).withMessage('주문 항목 형식이 올바르지 않습니다'),
  body('paymentMethod')
    .notEmpty().withMessage('결제 방법은 필수입니다')
    .isIn(['card', 'cash', 'mobile']).withMessage('유효하지 않은 결제 방법입니다'),
  validate
];

// 음성 입력 유효성 검증
export const validateVoiceInput = [
  body('voiceInput')
    .notEmpty().withMessage('음성 입력은 필수입니다')
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('음성 입력은 1-500자여야 합니다'),
  body('sessionId')
    .notEmpty().withMessage('세션 ID는 필수입니다'),
  validate
];