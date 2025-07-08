export const menuItems = {
  '아메리카노': {
    id: '1',
    name: '아메리카노',
    price: 4000, // 기본 가격
    description: '진한 에스프레소와 뜨거운 물의 조화',
    category: 'coffee',
    image: 'https://example.com/americano.jpg', // 예시 이미지 URL
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  '카페라떼': {
    id: '2',
    name: '카페라떼',
    price: 4500, // 기본 가격
    description: '부드러운 우유와 에스프레소의 조화',
    category: 'coffee',
    image: 'https://example.com/cafelatte.jpg', // 예시 이미지 URL
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  // 여기에 다른 메뉴들을 추가할 수 있습니다.
  // 예시:
  '딸기 케이크': {
    id: '3',
    name: '딸기 케이크',
    price: 6000,
    description: '달콤한 딸기와 부드러운 생크림 케이크',
    category: 'dessert',
    image: 'https://example.com/strawberry_cake.jpg',
    options: {}, // 옵션이 없는 경우 빈 객체
  },
};

export const findMenuItem = (keyword) => {
  const keys = Object.keys(menuItems);
  const foundKey = keys.find(key => 
    keyword.includes(key.toLowerCase()) || keyword.includes(key.replace(/\s/g, '').toLowerCase())
  );
  return foundKey ? menuItems[foundKey] : null;
};