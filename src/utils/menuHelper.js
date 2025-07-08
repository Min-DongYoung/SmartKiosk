import menuData from '../data/menuData';

export const getMenuPrice = (menuName, size) => {
  const menuItem = menuData.find(item => item.name === menuName);

  if (!menuItem) {
    return 0; // 메뉴를 찾을 수 없으면 0 반환
  }

  let price = menuItem.price;

  // 사이즈에 따른 가격 변동 (MenuDetailScreen의 로직과 동일하게)
  if (size === 'small') {
    price -= 500;
  } else if (size === 'large') {
    price += 500;
  }

  return price;
};
