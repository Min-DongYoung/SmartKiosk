import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';

// __dirname, __filename 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경변수 설정
dotenv.config();

// Express 앱 생성
const app = express();
const server = createServer(app);

// WebSocket 설정 (실시간 기능용)
const io = new Server(server, {
  cors: {
    origin: [
      `http://${process.env.HOST}:${process.env.PORT}`,    // 관리자 웹
      `http://${process.env.HOST}:8081`,    // React Native Metro (Metro Bundler는 8081 고정)
      `http://${process.env.HOST}:19000`,   // Expo (Expo는 19000 고정)
      'http://localhost:3001', // 웹 관리자 페이지가 다른 포트에서 실행될 경우
    ],
    credentials: true
  }
});

// CORS 설정 수정 - 관리자 웹 추가
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      // 서버 자체의 출처 (클라이언트가 서버 포트로 직접 요청하는 경우)
      `http://localhost:${process.env.PORT}`, // http://localhost:3000
      `http://172.16.166.215:${process.env.PORT}`, // http://172.16.166.215:3000

      // 웹 관리자 페이지의 출처
      'http://localhost:3001', // 웹 관리자 (localhost)
      'http://172.16.166.215:3001', // 웹 관리자 (PC LAN IP)

      // React Native 앱의 출처 (Metro Bundler, Expo)
      'http://localhost:8081', // Metro Bundler (localhost)
      'http://localhost:19000', // Expo (localhost)
      `http://172.16.166.215:8081`, // Metro Bundler (PC LAN IP)
      `http://172.16.166.215:19000`, // Expo (PC LAN IP)
    ];
    
    // 개발 환경에서는 origin이 없는 경우도 허용
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true
}));

// 기존 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 정적 파일 제공
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || `mongodb://localhost:${process.env.MONGODB_PORT || 27017}/smartkiosk`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'smartkiosk',
})
.then(() => {
  console.log('MongoDB 연결 성공');
  console.log('Server MongoDB URI:', process.env.MONGODB_URI || `mongodb://localhost:${process.env.MONGODB_PORT || 27017}/smartkiosk`);
  console.log('Server MongoDB dbName:', 'smartkiosk');
})
.catch(err => console.error('MongoDB 연결 실패:', err));

// WebSocket을 req 객체에 추가
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API 라우트
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import voiceRoutes from './src/routes/voiceRoutes.js';
import configRoutes from './src/routes/configRoutes.js';
import analyticsRoutes from './src/routes/analyticsRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/config', configRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    connections: {
      database: mongoose.connection.readyState === 1,
      websocket: io.engine.clientsCount
    }
  });
});

// WebSocket 이벤트 처리
io.on('connection', (socket) => {
  console.log('새로운 클라이언트 연결:', socket.id);
  
  // 실시간 메뉴 업데이트 구독
  socket.on('subscribe:menu', () => {
    socket.join('menu-updates');
  });
  
  // 실시간 주문 업데이트 구독
  socket.on('subscribe:orders', () => {
    socket.join('order-updates');
  });
  
  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제:', socket.id);
  });
});

// 404 핸들러
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message
  });
});

// 서버 시작 (http.Server 사용)
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 실행중입니다`);
  console.log(`환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket 활성화됨`);
});

// 실시간 업데이트를 위한 이벤트 내보내기
export { io };