// src/utils/menuHelper.js
import { menuItems, calculatePrice } from '../data/menuData';

export const getMenuPrice = (menuName, size = 'medium', extras = []) => {
  const menuItem = menuItems[menuName];
  
  if (!menuItem) {
    console.warn(`메뉴를 찾을 수 없습니다: ${menuName}`);
    return 0;
  }
  
  return calculatePrice(menuItem, size, extras);
};

// 메뉴 이름으로 메뉴 아이템 가져오기
export const getMenuItemByName = (menuName) => {
  return menuItems[menuName] || null;
};

// 카테고리별 메뉴 필터링
export const getMenusByCategory = (category) => {
  return Object.values(menuItems).filter(item => item.category === category);
};

// 메뉴 옵션 유효성 검사
export const validateMenuOption = (menuItem, optionType, optionValue) => {
  if (!menuItem.options || !menuItem.options[optionType]) {
    return false;
  }
  return menuItem.options[optionType].includes(optionValue);
};