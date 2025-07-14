import api from './apiService';

export const configService = {
  // 키오스크 설정 조회
  async getConfig() {
    return api.get('/config');
  },

  // 운영 상태 확인
  async getOperatingStatus() {
    return api.get('/config/operating-status');
  },

  // 설정 업데이트 (관리자)
  async updateConfig(config) {
    return api.put('/config', config);
  }
};