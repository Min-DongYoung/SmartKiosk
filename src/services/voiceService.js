import api from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const voiceService = {
  // 음성 명령 처리
  async processVoiceCommand(voiceData) {
    try {
      // 세션 ID 가져오기 또는 생성
      let sessionId = await AsyncStorage.getItem('voice_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('voice_session_id', sessionId);
      }

      const response = await api.post('/voice/process', {
        ...voiceData,
        sessionId
      });

      return response;
    } catch (error) {
      console.error('음성 처리 실패:', error);
      throw error;
    }
  },

  // 세션 로그 조회
  async getSessionLogs(sessionId) {
    return api.get(`/voice/session/${sessionId}`);
  },

  // 현재 세션 ID 가져오기
  async getCurrentSessionId() {
    return AsyncStorage.getItem('voice_session_id');
  },

  // 세션 초기화
  async clearSession() {
    await AsyncStorage.removeItem('voice_session_id');
  }
};