import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { menuService } from '../services/menuService';
import NetInfo from '@react-native-community/netinfo';

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 네트워크 상태 모니터링
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // 메뉴 데이터 로드
  const loadMenus = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await menuService.getAllMenus(forceRefresh);
      
      if (response.success && response.data) {
        // 배열을 객체로 변환 (기존 코드 호환성)
        const menuObject = {};
        response.data.forEach(menu => {
          menuObject[menu.name] = {
            id: menu._id,
            name: menu.name,
            price: menu.price,
            description: menu.description,
            category: menu.category,
            imageUrl: menu.imageUrl, // image -> imageUrl 변경
            temperatureOptions: menu.temperatureOptions, // options -> temperatureOptions 변경
            sizeOptions: menu.sizeOptions, // options -> sizeOptions 변경
            extras: menu.extras,
            tags: menu.tags,
            nutritionInfo: menu.nutritionInfo,
            adminPriority: menu.adminPriority,
            popularity: menu.popularity,
            isAvailable: menu.isAvailable,
          };
        });
        
        setMenus(menuObject);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('메뉴 로드 실패:', err);
      setError(err.error || '메뉴를 불러올 수 없습니다');
      
      // 오프라인 모드 안내
      if (!isOnline) {
        setError('오프라인 상태입니다. 캐시된 메뉴를 표시합니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline]);

  // 초기 로드
  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // 메뉴 검색
  const searchMenus = useCallback(async (query, filters) => {
    try {
      const response = await menuService.searchMenus(query, filters);
      return response.data;
    } catch (err) {
      console.error('메뉴 검색 실패:', err);
      // 오프라인 시 로컬 검색
      if (!isOnline) {
        const results = Object.values(menus).filter(menu => 
          menu.name.toLowerCase().includes(query.toLowerCase()) ||
          menu.description.toLowerCase().includes(query.toLowerCase())
        );
        return results;
      }
      throw err;
    }
  }, [menus, isOnline]);

  // 메뉴 찾기 (이름으로)
  const findMenuItem = useCallback((keyword) => {
    const menuNames = Object.keys(menus);
    const foundName = menuNames.find(name => 
      keyword.includes(name.toLowerCase()) || 
      keyword.includes(name.replace(/\s/g, '').toLowerCase())
    );
    return foundName ? menus[foundName] : null;
  }, [menus]);

  // 카테고리별 메뉴 가져오기
  const getMenusByCategory = useCallback((category) => {
    return Object.values(menus).filter(menu => menu.category === category);
  }, [menus]);

  // 메뉴 가격 계산
  const calculatePrice = useCallback((menuItem, size = 'medium', extras = []) => {
    if (!menuItem) return 0;
    
    let basePrice = menuItem.price;
    
    // 사이즈별 가격 조정
    switch (size) {
      case 'small':
        basePrice -= 500;
        break;
      case 'large':
        basePrice += 500;
        break;
      default:
        break;
    }
    
    // 추가 옵션 가격
    let extraPrice = 0;
    if (Array.isArray(extras) && menuItem.extras) {
      extras.forEach(extraName => {
        const extra = menuItem.extras.find(e => e.name === extraName);
        if (extra) {
          extraPrice += extra.price;
        }
      });
    }
    
    return basePrice + extraPrice;
  }, []);

  // 메뉴 새로고침
  const refreshMenus = useCallback(async () => {
    await loadMenus(true);
  }, [loadMenus]);

  const value = {
    menus,
    loading,
    error,
    isOnline,
    lastUpdated,
    loadMenus,
    searchMenus,
    findMenuItem,
    getMenusByCategory,
    calculatePrice,
    refreshMenus
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};