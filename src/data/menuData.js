export const menuItems = {
  '아메리카노': {
    id: '1',
    name: '아메리카노',
    price: 4000,
    description: '진한 에스프레소와 뜨거운 물의 조화',
    category: 'coffee',
    image: 'https://example.com/americano.jpg',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  '카페라떼': {
    id: '2',
    name: '카페라떼',
    price: 4500,
    description: '부드러운 우유와 에스프레소의 조화',
    category: 'coffee',
    image: 'https://example.com/cafelatte.jpg',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  '카푸치노': {
    id: '3',
    name: '카푸치노',
    price: 5000,
    description: '진한 에스프레소와 거품 우유',
    category: 'coffee',
    image: 'https://example.com/cappuccino.jpg',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  '에스프레소': {
    id: '4',
    name: '에스프레소',
    price: 3000,
    description: '진한 에스프레소 샷',
    category: 'coffee',
    image: 'https://example.com/espresso.jpg',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot'],
    },
  },
  '초코라떼': {
    id: '5',
    name: '초코라떼',
    price: 5000,
    description: '달콤한 초콜릿과 우유의 조화',
    category: 'non-coffee',
    image: 'https://example.com/chocolate.jpg',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  '그린티라떼': {
    id: '6',
    name: '그린티라떼',
    price: 5500,
    description: '부드러운 녹차와 우유',
    category: 'non-coffee',
    image: 'https://example.com/greentea.jpg',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  '밀크티': {
    id: '7',
    name: '밀크티',
    price: 4500,
    description: '홍차와 우유의 클래식한 조화',
    category: 'non-coffee',
    image: 'https://example.com/milktea.jpg',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'iced'],
    },
  },
  '치즈케이크': {
    id: '8',
    name: '치즈케이크',
    price: 6000,
    description: '부드럽고 진한 치즈케이크',
    category: 'dessert',
    image: 'https://example.com/cheesecake.jpg',
    options: {},
  },
  '초코케이크': {
    id: '9',
    name: '초코케이크',
    price: 5500,
    description: '진한 초콜릿 케이크',
    category: 'dessert',
    image: 'https://example.com/chocolatecake.jpg',
    options: {},
  },
  '크로플': {
    id: '10',
    name: '크로플',
    price: 4000,
    description: '바삭한 크로와상 와플',
    category: 'dessert',
    image: 'https://example.com/croffle.jpg',
    options: {},
  },
};

export const findMenuItem = (keyword) => {
  const keys = Object.keys(menuItems);
  const foundKey = keys.find(key => 
    keyword.includes(key.toLowerCase()) || keyword.includes(key.replace(/\s/g, '').toLowerCase())
  );
  return foundKey ? menuItems[foundKey] : null;
};

export const calculatePrice = (menuItem, size = 'medium', extras = []) => {
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
    case 'medium':
    default:
      // 기본 가격 그대로
      break;
  }
  
  // 추가 옵션 가격
  let extraPrice = 0;
  if (Array.isArray(extras)) {
    extras.forEach(extra => {
      switch (extra) {
        case '샷추가':
          extraPrice += 500;
          break;
        case '시럽추가':
          extraPrice += 300;
          break;
        case '휘핑추가':
          extraPrice += 500;
          break;
        default:
          break;
      }
    });
  }
  
  return basePrice + extraPrice;
};