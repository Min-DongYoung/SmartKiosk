const Utils = {
  formatDate: (date: string | Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatNumber: (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  formatPrice: (price: number) => {
    return Utils.formatNumber(price) + '원';
  },

  getCategoryName: (category: string) => {
    return category;
  },

  getOrderStatusName: (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': '대기중',
      'preparing': '준비중',
      'ready': '준비완료',
      'completed': '완료',
      'cancelled': '취소됨'
    };
    return statuses[status] || status;
  },

  getOrderStatusBadge: (status: string) => {
    const badges: { [key: string]: string } = {
      'pending': 'badge-warning',
      'preparing': 'badge-info',
      'ready': 'badge-success',
      'completed': 'badge-success',
      'cancelled': 'badge-danger'
    };
    return badges[status] || 'badge-secondary';
  }
};

export default Utils;
