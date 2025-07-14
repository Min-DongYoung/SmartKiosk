// API 엔드포인트
export const API_ENDPOINTS = {
    MENUS: '/menus',
    ORDERS: '/orders',
    ADVERTISEMENTS: '/advertisements',
    // 필요한 다른 엔드포인트 추가
};

// 메뉴 옵션 (menus.html에서 동적으로 사용)
export const MENU_OPTIONS = {
    size: [
        { value: 'small', label: '스몰' },
        { value: 'medium', label: '미디엄' },
        { value: 'large', label: '라지' },
    ],
    temperature: [
        { value: 'hot', label: 'HOT' },
        { value: 'ice', label: 'ICE' },
    ],
    extras: [
        { value: 'extra-shot', label: '샷 추가' },
        { value: 'decaf', label: '디카페인' },
        { value: 'soy-milk', label: '두유' },
    ],
};
