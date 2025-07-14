import React, { useState, useEffect } from 'react';
import { API } from '../services/apiService';
import Utils from '../lib/utils';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { useLoading } from '../components/Loading';
import { useNotification } from '../components/Notification';
import { useModal } from '../components/Modal';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  options?: string[];
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const Orders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [orderIdSearch, setOrderIdSearch] = useState<string>('');
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');

  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();
  const { confirm, showModal, hideModal } = useModal();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allOrders, statusFilter, dateRangeFilter, startDate, endDate, orderIdSearch, menuSearch, priceRangeFilter, sortBy, sortOrder]);

  const loadOrders = async () => {
    showLoading();
    try {
      const response = await API.get('/orders?limit=100');
      setAllOrders(response.data);
    } catch (error) {
      console.error('주문 로드 실패:', error);
      showNotification('주문 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      hideLoading();
    }
  };

  const updateStatistics = (orders: Order[]) => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const completed = orders.filter(order => order.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const averageOrderValue = total > 0 ? Math.round(totalRevenue / total) : 0;

    return {
      totalOrdersCount: total,
      pendingOrdersCount: pending,
      completedOrdersCount: completed,
      totalRevenue: Utils.formatPrice(totalRevenue),
      averageOrderValue: Utils.formatPrice(averageOrderValue),
    };
  };

  const applyFilters = () => {
    let tempFilteredOrders = allOrders.filter(order => {
      // Status Filter
      if (statusFilter && order.status !== statusFilter) return false;

      // Date Range Filter
      let dateFrom: Date | null = null;
      let dateTo: Date | null = null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRangeFilter === 'today') {
        dateFrom = new Date(today);
        dateTo = new Date(today);
        dateTo.setHours(23, 59, 59, 999);
      } else if (dateRangeFilter === 'yesterday') {
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 1);
        dateTo = new Date(today);
        dateTo.setDate(today.getDate() - 1);
        dateTo.setHours(23, 59, 59, 999);
      } else if (dateRangeFilter === 'week') {
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 7);
        dateTo = new Date();
      } else if (dateRangeFilter === 'month') {
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 30);
        dateTo = new Date();
      } else if (dateRangeFilter === 'custom') {
        if (startDate) {
          dateFrom = new Date(startDate);
          dateFrom.setHours(0, 0, 0, 0);
        }
        if (endDate) {
          dateTo = new Date(endDate);
          dateTo.setHours(23, 59, 59, 999);
        }
      }

      const orderDate = new Date(order.createdAt);
      if (dateFrom && orderDate < dateFrom) return false;
      if (dateTo && orderDate > dateTo) return false;

      // Order ID Search
      if (orderIdSearch && !order.orderId.toLowerCase().includes(orderIdSearch.toLowerCase())) return false;

      // Menu Search
      if (menuSearch) {
        const hasMatchingItem = order.items.some(item =>
          item.name.toLowerCase().includes(menuSearch.toLowerCase())
        );
        if (!hasMatchingItem) return false;
      }

      // Price Range Filter
      if (priceRangeFilter) {
        const [min, max] = priceRangeFilter.split('-').map(Number);
        if (order.totalPrice < min || order.totalPrice > max) return false;
      }

      return true;
    });

    tempFilteredOrders.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Order];
      let bValue: any = b[sortBy as keyof Order];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(tempFilteredOrders);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const resetFilters = () => {
    setStatusFilter('');
    setDateRangeFilter('');
    setStartDate('');
    setEndDate('');
    setOrderIdSearch('');
    setMenuSearch('');
    setPriceRangeFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const showOrderDetail = (order: Order) => {
    showModal(
      '주문 상세 정보',
      <div className="order-detail-content">
        <div className="order-detail-header">
          <h3>주문 #{order.orderId}</h3>
          <span className={`badge ${Utils.getOrderStatusBadge(order.status)}`}>
            {Utils.getOrderStatusName(order.status)}
          </span>
        </div>

        <div className="order-info-grid">
          <div className="order-info-section">
            <h4>주문 정보</h4>
            <div className="info-item">
              <span className="info-label">주문시간:</span>
              <span className="info-value">{Utils.formatDate(order.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">최근 업데이트:</span>
              <span className="info-value">{Utils.formatDate(order.updatedAt)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">총 금액:</span>
              <span className="info-value"><strong>{Utils.formatPrice(order.totalPrice)}</strong></span>
            </div>
          </div>
        </div>

        <div className="order-items-section">
          <h4>주문 내역</h4>
          <div className="order-items-list">
            {order.items.map((item, index) => (
              <div className="order-item" key={index}>
                <div className="item-info">
                  <strong>{item.name}</strong>
                  <div className="item-details">
                    <span>수량: {item.quantity}개</span>
                    <span>단가: {Utils.formatPrice(item.price)}</span>
                    <span>소계: {Utils.formatPrice(item.price * item.quantity)}</span>
                  </div>
                  {item.options && item.options.length > 0 ? (
                    <div className="item-options">옵션: {item.options.join(', ')}</div>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const showStatusChangeModal = (order: Order) => {
    const statusOptions = [
      { value: 'pending', label: '대기중' },
      { value: 'preparing', label: '준비중' },
      { value: 'ready', label: '준비완료' },
      { value: 'completed', label: '완료' },
      { value: 'cancelled', label: '취소됨' },
    ];

    showModal(
      '주문 상태 변경',
      <div className="status-change-form">
        <p><strong>주문 #{order.orderId}</strong>의 상태를 변경합니다.</p>
        <div className="form-group">
          <label className="form-label">새로운 상태:</label>
          <select className="form-select" id="newStatus" defaultValue={order.status}>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>,
      [
        { text: '취소', class: 'btn-secondary', onClick: hideModal },
        {
          text: '상태 변경',
          class: 'btn-primary',
          onClick: async () => {
            const newStatus = (document.getElementById('newStatus') as HTMLSelectElement).value;
            await updateOrderStatus(order._id, newStatus);
          },
        },
      ]
    );
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    showLoading();
    try {
      await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      showNotification('주문 상태가 성공적으로 변경되었습니다.', 'success');
      hideModal();
      loadOrders();
    } catch (error) {
      console.error('주문 상태 변경 실패:', error);
      showNotification('주문 상태 변경에 실패했습니다.', 'error');
    } finally {
      hideLoading();
    }
  };

  const orderColumns = [
    { key: 'orderId', header: '주문번호', render: (value: string) => <strong>#{value}</strong> },
    {
      key: 'items',
      header: '주문 내역',
      render: (items: OrderItem[]) => {
        const firstItem = items[0];
        const count = items.length;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        return count > 1
          ? `${firstItem.name} 외 ${count - 1}개 (총 ${totalQuantity}개)`
          : `${firstItem.name} (${firstItem.quantity}개)`;
      },
    },
    { key: 'totalPrice', header: '총 금액', render: (value: number) => <strong>{Utils.formatPrice(value)}</strong> },
    {
      key: 'status',
      header: '상태',
      render: (value: string) => (
        <span className={`badge ${Utils.getOrderStatusBadge(value)}`}>
          {Utils.getOrderStatusName(value)}
        </span>
      ),
    },
    { key: 'createdAt', header: '주문시간', render: (value: string) => Utils.formatDate(value) },
    { key: 'updatedAt', header: '최근 업데이트', render: (value: string) => Utils.formatDate(value) },
  ];

  const orderActions = [
    {
      text: '상세보기',
      class: 'btn-primary',
      onClick: (order: Order) => showOrderDetail(order),
    },
    {
      text: '상태변경',
      class: 'btn-warning',
      onClick: (order: Order) => showStatusChangeModal(order),
    },
  ];

  const statistics = updateStatistics(filteredOrders);

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">주문 내역</h1>
        <button className="btn btn-secondary" onClick={loadOrders}>
          🔄 새로고침
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">필터 및 검색</h2>
          <button className="btn btn-sm btn-secondary" onClick={resetFilters}>
            🔄 필터 초기화
          </button>
        </div>
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">주문 상태</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">전체 상태</option>
              <option value="pending">대기중</option>
              <option value="preparing">준비중</option>
              <option value="ready">준비완료</option>
              <option value="completed">완료</option>
              <option value="cancelled">취소됨</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">날짜 범위</label>
            <select className="form-select" value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}>
              <option value="">전체 기간</option>
              <option value="today">오늘</option>
              <option value="yesterday">어제</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
              <option value="custom">사용자 정의</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">시작 날짜</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={dateRangeFilter !== 'custom'} />
          </div>
          <div className="form-group">
            <label className="form-label">종료 날짜</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={dateRangeFilter !== 'custom'} />
          </div>
        </div>
        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">주문번호 검색</label>
            <input type="text" className="form-control" placeholder="주문번호를 입력하세요" value={orderIdSearch} onChange={(e) => setOrderIdSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">메뉴명 검색</label>
            <input type="text" className="form-control" placeholder="메뉴명을 입력하세요" value={menuSearch} onChange={(e) => setMenuSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">금액 범위</label>
            <select className="form-select" value={priceRangeFilter} onChange={(e) => setPriceRangeFilter(e.target.value)}>
              <option value="">전체 금액</option>
              <option value="0-10000">0 - 10,000원</option>
              <option value="10000-20000">10,000 - 20,000원</option>
              <option value="20000-50000">20,000 - 50,000원</option>
              <option value="50000-999999">50,000원 이상</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-5">
        <StatCard number={statistics.totalOrdersCount} label="전체 주문" />
        <StatCard number={statistics.pendingOrdersCount} label="대기 중" />
        <StatCard number={statistics.completedOrdersCount} label="완료" />
        <StatCard number={statistics.totalRevenue} label="총 매출" />
        <StatCard number={statistics.averageOrderValue} label="평균 주문액" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">주문 목록</h2>
          <div className="d-flex gap-2">
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '200px' }}>
              <option value="createdAt">주문시간순</option>
              <option value="totalPrice">금액순</option>
              <option value="status">상태순</option>
              <option value="orderId">주문번호순</option>
            </select>
            <button className="btn btn-sm btn-secondary" onClick={toggleSortOrder}>
              <span id="sortOrderText">{sortOrder === 'asc' ? '⬆️' : '⬇️'}</span>
            </button>
          </div>
        </div>
        <DataTable data={filteredOrders} columns={orderColumns} actions={orderActions} />
      </div>
    </div>
  );
};

export default Orders;