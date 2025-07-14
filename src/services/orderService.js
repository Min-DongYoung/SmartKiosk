import api from './apiService';

export const orderService = {
  // 주문 생성
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response;
    } catch (error) {
      console.error('주문 생성 실패:', error);
      throw error;
    }
  },

  // 주문 조회 (주문번호)
  async getOrderByNumber(orderNumber) {
    return api.get(`/orders/${orderNumber}`);
  },

  // 주문 조회 (ID)
  async getOrderById(orderId) {
    return api.get(`/orders/id/${orderId}`);
  },

  // 주문 상태 업데이트
  async updateOrderStatus(orderId, status) {
    return api.patch(`/orders/${orderId}/status`, { status });
  },

  // 주문 취소
  async cancelOrder(orderId, reason) {
    return api.patch(`/orders/${orderId}/cancel`, { reason });
  },

  // 오늘의 주문 통계
  async getTodayStats() {
    return api.get('/orders/stats/today');
  }
};