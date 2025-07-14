import mongoose from 'mongoose';
import Menu from '../src/models/Menu.js'; // 경로 수정
import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

// __dirname, __filename 대체
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// KioskConfig 모델도 필요하다면 import
// import KioskConfig from '../src/models/KioskConfig.js';

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartkiosk', {
      dbName: 'smartkiosk'
    });
    console.log('MongoDB 연결 성공');

    // 기존 데이터 삭제
    await Menu.deleteMany({});
    console.log('기존 메뉴 데이터 삭제 완료');

    /** 공통 편의 변수 */
    const img = f => f;

    /** 메뉴 시드 */
    const menuData = [
      /* ───────── Coffee ───────── */
     {
      name: '아메리카노 (Iced)',
      category: '커피',
      price: 3500,
      imageUrl: img('americanoice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: 1,   // 👑 최우선 노출
      popularity: 300,
    },
    {
      name: '아메리카노 (Hot)',
      category: '커피',
      price: 3500,
      imageUrl: img('americanohot.jpg'),
      temperatureOptions: ['hot'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: 2,
      popularity: 280,
    },
    {
      name: '카페 라떼 (Iced)',
      category: '커피',
      price: 4500,
      imageUrl: img('caffelatteice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: 3,
      popularity: 220,
    },
    {
      name: '카페 라떼 (Hot)',
      category: '커피',
      price: 4200,
      imageUrl: img('caffelattehot.jpg'),
      temperatureOptions: ['hot'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: 4,
      popularity: 200,
    },
    {
      name: '카페 모카 (Iced)',
      category: '커피',
      price: 5000,
      imageUrl: img('caffemochaice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 150,
    },
    {
      name: '카페 모카 (Hot)',
      category: '커피',
      price: 4700,
      imageUrl: img('caffemochahot.jpg'),
      temperatureOptions: ['hot'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 120,
    },
    {
      name: '카라멜 마키아토 (Iced)',
      category: '커피',
      price: 5100,
      imageUrl: img('caramelmacchiatoice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 100,
    },
    {
      name: '카라멜 마키아토 (Hot)',
      category: '커피',
      price: 4800,
      imageUrl: img('caramelmacchiatohot.jpg'),
      temperatureOptions: ['hot'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 80,
    },
    /* ───────── 스무디 & 에이드 ───────── */
    {
      name: '레몬 에이드',
      category: '에이드',
      price: 5000,
      imageUrl: img('lemonadeice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: 5,
      popularity: 180,
    },
    {
      name: '블루베리 스무디',
      category: '스무디',
      price: 5200,
      imageUrl: img('blueberrysmoothieice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 140,
    },
    {
      name: '오렌지 스무디',
      category: '스무디',
      price: 5400,
      imageUrl: img('orangesmoothieice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 130,
    },
    {
      name: '키위 스무디',
      category: '스무디',
      price: 5500,
      imageUrl: img('kiwismoothieice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 110,
    },
    /* ───────── 티 ───────── */
    {
      name: '밀크티',
      category: '티',
      price: 4300,
      imageUrl: img('milkteaice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: 6,
      popularity: 160,
    },
    {
      name: '아이스티',
      category: '티',
      price: 3500,
      imageUrl: img('icetea.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 90,
    },
    {
      name: '체리티',
      category: '티',
      price: 3800,
      imageUrl: img('cherryteaice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 85,
    },
    {
      name: '루이보스 티 (Iced)',
      category: '티',
      price: 3800,
      imageUrl: img('rooibosteaice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 70,
    },
    {
      name: '루이보스 티 (Hot)',
      category: '티',
      price: 3600,
      imageUrl: img('rooibosteahot.jpg'),
      temperatureOptions: ['hot'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 60,
    },
    {
      name: '페퍼민트 티 (Iced)',
      category: '티',
      price: 3900,
      imageUrl: img('peppermintteaice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 55,
    },
    {
      name: '페퍼민트 티 (Hot)',
      category: '티',
      price: 3700,
      imageUrl: img('peppermintteahot.jpg'),
      temperatureOptions: ['hot'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 45,
    },
    /* ───────── 라떼 (말차) ───────── */
    {
      name: '말차 라떼 (Iced)',
      category: '라떼',
      price: 4900,
      imageUrl: img('matchalatteice.jpg'),
      temperatureOptions: ['iced'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 95,
    },
    {
      name: '말차 라떼 (Hot)',
      category: '라떼',
      price: 4600,
      imageUrl: img('matchalattehot.jpg'),
      temperatureOptions: ['hot'],
      sizeOptions: ['small', 'medium', 'large'],
      adminPriority: null,
      popularity: 80,
    },
    /* ───────── 디저트 ───────── */
    {
      name: '소금빵',
      category: '디저트',
      price: 2900,
      imageUrl: img('saltbread.jpg'),
      sizeOptions: ['piece'],
      adminPriority: 7,
      popularity: 140,
    },
    {
      name: '크루아상',
      category: '디저트',
      price: 3200,
      imageUrl: img('croissant.jpg'),
      sizeOptions: ['piece'],
      adminPriority: null,
      popularity: 130,
    },
    {
      name: '치즈케이크',
      category: '디저트',
      price: 4800,
      imageUrl: img('cheesecake.jpg'),
      sizeOptions: ['piece'],
      adminPriority: null,
      popularity: 125,
    },
    {
      name: '뺑 오 쇼콜라',
      category: '디저트',
      price: 3500,
      imageUrl: img('painauchocolat.jpg'),
      sizeOptions: ['piece'],
      adminPriority: null,
      popularity: 76,
    },
    {
      name: '판나코타',
      category: '디저트',
      price: 4000,
      imageUrl: img('pannacotta.jpg'),
      sizeOptions: ['cup'],
      adminPriority: null,
      popularity: 10,
    },
    {
      name: '푸딩',
      category: '디저트',
      price: 3500,
      imageUrl: img('pudding.jpg'),
      sizeOptions: ['cup'],
      adminPriority: null,
      popularity: 20,
    },
    {
      name: '소금빵',
      category: '디저트',
      price: 2900,
      imageUrl: img('saltbread.jpg'),
      sizeOptions: ['piece'],
      adminPriority: null,
      popularity: 130,
    },
  ];

    const menus = await Menu.insertMany(menuData);
    console.log(`${menus.length}개의 메뉴 추가 완료`);

    console.log('데이터베이스 초기화 완료!');
    process.exit(0);
  } catch (error) {
    console.error('데이터베이스 초기화 실패:', error);
    process.exit(1);
  } finally {
    mongoose.disconnect(); // 연결 종료
  }
}

seedDatabase();