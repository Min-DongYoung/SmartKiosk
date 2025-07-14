import { GEMINI_API_KEY as ENV_GEMINI_KEY, API_BASE_URL as ENV_API_URL } from '@env';

export const GEMINI_API_KEY = ENV_GEMINI_KEY;
export const API_BASE_URL = ENV_API_URL || 'http://172.16.166.215:3000/api';

// 개발/프로덕션 환경 구분
export const IS_PRODUCTION = !__DEV__;

// API 타임아웃 설정
export const API_TIMEOUT = 10000; // 10초

// 캐시 설정
export const CACHE_CONFIG = {
  MENU_CACHE_DURATION: 5 * 60 * 1000, // 5분
  ORDER_CACHE_DURATION: 1 * 60 * 1000, // 1분
};