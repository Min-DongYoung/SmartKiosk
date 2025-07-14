import api from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MENU_CACHE_KEY = 'cached_menus';
const CACHE_DURATION = 5 * 60 * 1000; // 5분

export const menuService = {
  // 전체 메뉴 조회 (캐싱 포함)
  async getAllMenus(forceRefresh = false) {
    try {
      // 캐시 확인
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(MENU_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
          }
        }
      }

      // API 호출
      const response = await api.get('/menu');
      
      // 캐시 저장
      await AsyncStorage.setItem(MENU_CACHE_KEY, JSON.stringify({
        data: response.data,
        timestamp: Date.now()
      }));

      return response.data;
    } catch (error) {
      // 오프라인 시 캐시 데이터 반환
      const cached = await AsyncStorage.getItem(MENU_CACHE_KEY);
      if (cached) {
        const { data } = JSON.parse(cached);
        return data;
      }
      throw error;
    }
  },

  // 카테고리별 메뉴 조회
  async getMenusByCategory(category) {
    return api.get(`/menu/category/${category}`);
  },

  // 메뉴 검색
  async searchMenus(query, filters = {}) {
    return api.get('/menu/search', { 
      params: { q: query, ...filters } 
    });
  },

  // 특정 메뉴 조회
  async getMenuById(id) {
    return api.get(`/menu/${id}`);
  },

  // 캐시 삭제
  async clearCache() {
    await AsyncStorage.removeItem(MENU_CACHE_KEY);
  }
};