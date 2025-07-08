const menuData = [
  {
    id: '1',
    name: '아메리카노',
    price: 4500,
    category: '커피',
    image: 'https://via.placeholder.com/100',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'ice'],
    },
  },
  {
    id: '2',
    name: '카페라떼',
    price: 5000,
    category: '커피',
    image: 'https://via.placeholder.com/100',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'ice'],
    },
  },
  {
    id: '3',
    name: '초코라떼',
    price: 5500,
    category: '음료',
    image: 'https://via.placeholder.com/100',
    options: {
      size: ['small', 'medium', 'large'],
      temperature: ['hot', 'ice'],
    },
  },
  {
    id: '4',
    name: '크로와상',
    price: 3500,
    category: '베이커리',
    image: 'https://via.placeholder.com/100',
    options: {}, // 베이커리는 옵션이 없을 수 있습니다.
  },
];

export default menuData;
