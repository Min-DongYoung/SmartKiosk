import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    // 토큰이 필요한 경우 추가
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      console.error('Network Error:', error.request);
      return Promise.reject({ error: '네트워크 연결을 확인해주세요' });
    } else {
      // 요청 설정 중 에러
      console.error('Request Error:', error.message);
      return Promise.reject({ error: '요청 처리 중 오류가 발생했습니다' });
    }
  }
);

export default api;