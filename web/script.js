// 전역 변수
const API_BASE_URL = window.location.origin + '/api';

// 유틸리티 함수들
const Utils = {
  // 날짜 포맷팅
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // 숫자 포맷팅 (천단위 콤마)
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // 가격 포맷팅
  formatPrice: (price) => {
    return Utils.formatNumber(price) + '원';
  },

  // 카테고리 한글 변환 (이미 한글이므로 그대로 반환)
  getCategoryName: (category) => {
    return category;
  },

  // 주문 상태 한글 변환
  getOrderStatusName: (status) => {
    const statuses = {
      'pending': '대기중',
      'preparing': '준비중',
      'ready': '준비완료',
      'completed': '완료',
      'cancelled': '취소됨'
    };
    return statuses[status] || status;
  },

  // 주문 상태 배지 클래스
  getOrderStatusBadge: (status) => {
    const badges = {
      'pending': 'badge-warning',
      'preparing': 'badge-info',
      'ready': 'badge-success',
      'completed': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  }
};

// API 호출 함수들
const API = {
  // GET 요청
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '요청 실패');
      }
      return data;
    } catch (error) {
      console.error('API GET 오류:', error);
      throw error;
    }
  },

  // POST 요청
  post: async (endpoint, data) => {
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
    } catch (error) {
      console.error('API POST 오류:', error);
      throw error;
    }
  },

  // PUT 요청
  put: async (endpoint, data) => {
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
    } catch (error) {
      console.error('API PUT 오류:', error);
      throw error;
    }
  },

  // DELETE 요청
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '요청 실패');
      }
      return data;
    } catch (error) {
      console.error('API DELETE 오류:', error);
      throw error;
    }
  },

  // PATCH 요청
  patch: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
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
    } catch (error) {
      console.error('API PATCH 오류:', error);
      throw error;
    }
  }
};

// 알림 시스템
const Notification = {
  show: (message, type = 'success') => {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    // 새 알림 생성
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    // 페이지 상단에 추가
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);

    // 3초 후 자동 제거
    setTimeout(() => {
      alert.remove();
    }, 3000);
  },

  success: (message) => Notification.show(message, 'success'),
  error: (message) => Notification.show(message, 'error'),
  warning: (message) => Notification.show(message, 'warning')
};

// 모달 시스템
const Modal = {
  show: (title, content, buttons = []) => {
    // 기존 모달 제거
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
      existingModal.remove();
    }

    // 모달 생성
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // 닫기 버튼
    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => Modal.hide();

    // 제목
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.marginBottom = '1rem';

    // 내용
    const contentElement = document.createElement('div');
    contentElement.innerHTML = content;
    contentElement.style.marginBottom = '2rem';

    // 버튼들
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'd-flex justify-content-between';

    buttons.forEach(button => {
      const btn = document.createElement('button');
      btn.className = `btn ${button.class || 'btn-primary'}`;
      btn.textContent = button.text;
      btn.onclick = button.onClick;
      buttonContainer.appendChild(btn);
    });

    // 모달 조립
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(titleElement);
    modalContent.appendChild(contentElement);
    modalContent.appendChild(buttonContainer);
    modal.appendChild(modalContent);

    // 페이지에 추가
    document.body.appendChild(modal);

    // 외부 클릭 시 닫기
    modal.onclick = (e) => {
      if (e.target === modal) {
        Modal.hide();
      }
    };

    return modal;
  },

  hide: () => {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.remove();
    }
  },

  confirm: (title, message, onConfirm) => {
    return Modal.show(title, message, [
      {
        text: '취소',
        class: 'btn-secondary',
        onClick: () => Modal.hide()
      },
      {
        text: '확인',
        class: 'btn-danger',
        onClick: () => {
          onConfirm();
          Modal.hide();
        }
      }
    ]);
  }
};

// 로딩 시스템
const Loading = {
  show: (target = 'body') => {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
    
    // 기존 로딩 제거
    const existingLoading = targetElement.querySelector('.loading');
    if (existingLoading) {
      existingLoading.remove();
    }

    // 로딩 스피너 생성
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';

    targetElement.appendChild(loading);
  },

  hide: (target = 'body') => {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
    const loading = targetElement.querySelector('.loading');
    if (loading) {
      loading.remove();
    }
  }
};

// 네비게이션 활성화
const Navigation = {
  setActive: (pageName) => {
    // 모든 네비게이션 링크에서 active 클래스 제거
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
    });

    // 현재 페이지 링크에 active 클래스 추가
    const currentLink = document.querySelector(`a[href="${pageName}"]`);
    if (currentLink) {
      currentLink.classList.add('active');
    }
  }
};

// 테이블 렌더링 도우미
const Table = {
  render: (container, data, columns, actions = []) => {
    if (!data || data.length === 0) {
      container.innerHTML = '<p class="text-center">데이터가 없습니다.</p>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'table';

    // 헤더 생성
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.header;
      headerRow.appendChild(th);
    });

    if (actions.length > 0) {
      const th = document.createElement('th');
      th.textContent = '작업';
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // 바디 생성
    const tbody = document.createElement('tbody');
    
    data.forEach(row => {
      const tr = document.createElement('tr');
      
      columns.forEach(column => {
        const td = document.createElement('td');
        if (column.render) {
          td.innerHTML = column.render(row[column.key], row);
        } else {
          td.textContent = row[column.key];
        }
        tr.appendChild(td);
      });

      if (actions.length > 0) {
        const td = document.createElement('td');
        td.className = 'd-flex gap-1';
        
        actions.forEach(action => {
          const btn = document.createElement('button');
          btn.className = `btn btn-sm ${action.class || 'btn-primary'}`;
          btn.textContent = action.text;
          btn.onclick = () => action.onClick(row);
          td.appendChild(btn);
        });
        
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.innerHTML = '';
    container.appendChild(table);
  }
};

// 페이지 로드 시 공통 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 현재 페이지 기반으로 네비게이션 활성화
  const currentPage = window.location.pathname.split('/').pop();
  Navigation.setActive(currentPage);

  // ESC 키로 모달 닫기
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      Modal.hide();
    }
  });
});

// 전역 함수로 내보내기
window.Utils = Utils;
window.API = API;
window.Notification = Notification;
window.Modal = Modal;
window.Loading = Loading;
window.Navigation = Navigation;
window.Table = Table; 