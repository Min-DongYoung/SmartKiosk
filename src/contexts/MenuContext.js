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
  const [quickMenus, setQuickMenus] = useState([]);
  const QUICK_MENU_LIMIT = 5; // Quick 메뉴 최대 개수

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
      
      if (response && response.success && response.data) {
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

  // menus 상태가 변경될 때마다 quickMenus 업데이트
  useEffect(() => {
    if (Object.keys(menus).length > 0) {
      const allAvailableMenus = Object.values(menus).filter(menu => menu.isAvailable);

      // Helper to calculate simplicity score and sort
      const getSortedMenusForCategory = (category) => {
        return allAvailableMenus
          .filter(menu => menu.category === category)
          .map(menu => {
            let simplicityScore = 0;
            if (!menu.sizeOptions?.length && !menu.temperatureOptions?.length && !menu.extras?.length) {
              simplicityScore = 0;
            } else {
              simplicityScore = (menu.sizeOptions?.length || 0) + (menu.temperatureOptions?.length || 0) + (menu.extras?.length || 0);
            }
            return { ...menu, simplicityScore };
          })
          .sort((a, b) => {
            // adminPriority가 낮은 순서 (null은 가장 낮은 우선순위)
            if (a.adminPriority !== b.adminPriority) {
              const apA = a.adminPriority === null || a.adminPriority === undefined ? Infinity : a.adminPriority;
              const apB = b.adminPriority === null || b.adminPriority === undefined ? Infinity : b.adminPriority;
              return apA - apB;
            }
            // 간편성 점수가 낮은 순서
            if (a.simplicityScore !== b.simplicityScore) return a.simplicityScore - b.simplicityScore;
            // 이름 오름차순
            return a.name.localeCompare(b.name);
          });
      };

      let selectedQuickMenus = [];

      // 커피 2개
      const coffeeMenus = getSortedMenusForCategory('커피');
      selectedQuickMenus.push(...coffeeMenus.slice(0, 2));

      // 라떼 1개
      const latteMenus = getSortedMenusForCategory('라떼');
      selectedQuickMenus.push(...latteMenus.slice(0, 1));

      // 에이드 1개
      const aidMenus = getSortedMenusForCategory('에이드');
      selectedQuickMenus.push(...aidMenus.slice(0, 1));

      // 디저트 1개
      const dessertMenus = getSortedMenusForCategory('디저트');
      selectedQuickMenus.push(...dessertMenus.slice(0, 1));

      // Ensure uniqueness (though slice should prevent duplicates from same category)
      const uniqueQuickMenus = Array.from(new Map(selectedQuickMenus.map(item => [item.id, item])).values());

      // Final sort for display (optional, but good for consistent UI)
      uniqueQuickMenus.sort((a, b) => {
        // Sort by adminPriority first
        if (a.adminPriority !== b.adminPriority) {
          const apA = a.adminPriority === null || a.adminPriority === undefined ? Infinity : a.adminPriority;
          const apB = b.adminPriority === null || b.adminPriority === undefined ? Infinity : b.adminPriority;
          return apA - apB;
        }
        // Then by simplicityScore
        if (a.simplicityScore !== b.simplicityScore) return a.simplicityScore - b.simplicityScore;
        // Finally by name
        return a.name.localeCompare(b.name);
      });

      setQuickMenus(uniqueQuickMenus);
    }
  }, [menus]);

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
      name.toLowerCase() === keyword.toLowerCase() || 
      name.replace(/\s/g, '').toLowerCase() === keyword.replace(/\s/g, '').toLowerCase()
    );
    const foundItem = foundName ? menus[foundName] : null;
    console.log(`findMenuItem: Keyword='${keyword}', Found Item ID=${foundItem ? foundItem.id : 'N/A'}, Name=${foundItem ? foundItem.name : 'N/A'}`);
    return foundItem;
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
    refreshMenus,
    quickMenus,
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