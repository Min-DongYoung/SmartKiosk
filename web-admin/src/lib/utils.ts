export const API_BASE_URL = '/api';

// 유틸리티 함수들
export const Utils = {
  // 날짜 포맷팅
  formatDate: (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // 숫자 포맷팅 (천단위 콤마)
  formatNumber: (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // 가격 포맷팅
  formatPrice: (price: number | null | undefined) => {
    const validPrice = (typeof price === 'number' && !isNaN(price)) ? price : 0;
    return Utils.formatNumber(validPrice) + '원';
  },

  // 카테고리 한글 변환
  getCategoryName: (category: string) => {
    const categories: { [key: string]: string } = {
      'coffee': '커피',
      'tea': '차',
      'dessert': '디저트',
      'beverage': '음료',
      'food': '음식',
      'frappe': '프라페',
      'non-coffee': '논커피', // 추가
      'latte': '라떼', // 추가
      'ade': '에이드', // 추가
      'smoothe': '스무디', // 추가
    };
    return categories[category] || category;
  },

  // 주문 상태 한글 변환
  getOrderStatusName: (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': '대기중',
      'confirmed': '확인됨',
      'preparing': '준비중',
      'ready': '준비완료',
      'completed': '완료',
      'cancelled': '취소됨'
    };
    return statuses[status] || status;
  },

  // 주문 상태 배지 클래스
  getOrderStatusBadge: (status: string) => {
    const badges: { [key: string]: string } = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'preparing': 'badge-info',
      'ready': 'badge-success',
      'completed': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  }
};

// API 호출 함수들
export const API = {
  // GET 요청
  get: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '요청 실패');
      }
      return data;
    } catch (error: any) {
      console.error('API GET 오류:', error);
      throw error;
    }
  },

  // POST 요청
  post: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || '요청 실패');
      }
      return responseData;
    } catch (error: any) {
      console.error('API POST 오류:', error);
      throw error;
    }
  },

  // PUT 요청
  put: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || '요청 실패');
      }
      return responseData;
    } catch (error: any) {
      console.error('API PUT 오류:', error);
      throw error;
    }
  },

  // PATCH 요청 (추가)
  patch: async (endpoint: string, data?: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || '요청 실패');
      }
      return responseData;
    } catch (error: any) {
      console.error('API PATCH 오류:', error);
      throw error;
    }
  },

  // DELETE 요청
  delete: async (endpoint: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '요청 실패');
      }
      return data;
    } catch (error: any) {
      console.error('API DELETE 오류:', error);
      throw error;
    }
  }
};

// 알림 시스템 (React 컴포넌트에서는 React Toast 라이브러리 사용 권장)
export const Notification = {
  show: (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    console.log(`[Notification - ${type.toUpperCase()}]: ${message}`);
    // 실제 앱에서는 React Toastify 등 라이브러리 사용
    alert(message); // 임시
  },
  success: (message: string) => Notification.show(message, 'success'),
  error: (message: string) => Notification.show(message, 'error'),
  warning: (message: string) => Notification.show(message, 'warning')
};

// 모달 시스템 (React 컴포넌트에서는 React Modal 라이브러리 사용 권장)
export const Modal = {
  confirm: (title: string, message: string, onConfirm: () => void) => {
    console.log(`[Modal - Confirm]: ${title} - ${message}`);
    if (window.confirm(`${title}\n${message}`)) {
      onConfirm();
    }
  },
};

// 로딩 시스템 (React 컴포넌트에서는 상태 관리로 대체)
export const Loading = {
  show: (target?: string) => {
    console.log(`[Loading] Show: ${target || 'body'}`);
    // 실제 앱에서는 로딩 스피너 컴포넌트 렌더링
  },
  hide: (target?: string) => {
    console.log(`[Loading] Hide: ${target || 'body'}`);
    // 실제 앱에서는 로딩 스피너 컴포넌트 숨김
  }
};