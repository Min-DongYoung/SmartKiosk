import React, { useState, useEffect, useCallback } from 'react';
import { API } from '../services/apiService';
import Utils from '../lib/utils';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { useLoading } from '../components/Loading';
import { useNotification } from '../components/Notification';

interface OrderItem {
  name: string;
  quantity: number;
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

interface Menu {
  _id: string;
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

interface Ad {
  _id: string;
  title: string;
  description: string;
  image: string;
  position: string;
  priority: number;
  isActive: boolean;
}

const Dashboard: React.FC = () => {
  const [totalMenus, setTotalMenus] = useState<number>(0);
  const [availableMenus, setAvailableMenus] = useState<number>(0);
  const [todayOrders, setTodayOrders] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [soldOutMenus, setSoldOutMenus] = useState<Menu[]>([]);
  const [activeAds, setActiveAds] = useState<Ad[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('-');

  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  const loadDashboardData = useCallback(async () => {
    showLoading();
    try {
      // 메뉴 통계
      const menusData = await API.get('/menus');
      setTotalMenus(menusData.data.length);
      setAvailableMenus(menusData.data.filter((menu: Menu) => menu.isAvailable).length);

      // 오늘 주문 통계
      const today = new Date().toISOString().split('T')[0];
      const ordersData = await API.get(`/orders?date=${today}`);
      setTodayOrders(ordersData.data.length);
      setTodayRevenue(ordersData.data.reduce((sum: number, order: Order) => sum + (order.totalPrice || 0), 0) || 0);

      // 최근 주문
      const recentOrdersData = await API.get('/orders?limit=5');
      setRecentOrders(recentOrdersData.data);

      // 품절 메뉴
      const soldOutMenusData = await API.get('/menus?available=false');
      setSoldOutMenus(soldOutMenusData.data);

      // 활성 광고
      const activeAdsData = await API.get('/advertisements?active=true');
      setActiveAds(activeAdsData.data);

      setLastUpdate(Utils.formatDate(new Date()));
    } catch (error: any) {
      console.error('대시보드 데이터 로드 실패:', error);
      showNotification('대시보드 데이터를 불러오는데 실패했습니다.', 'error');
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading, showNotification, setTotalMenus, setAvailableMenus, setTodayOrders, setTodayRevenue, setRecentOrders, setSoldOutMenus, setActiveAds, setLastUpdate]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // 5초 간격으로 새로고침
    return () => clearInterval(interval);
  }, [loadDashboardData]);

  const toggleMenuAvailability = useCallback(async (menuId: string, isAvailable: boolean) => {
    showLoading();
    try {
      await API.put(`/menus/${menuId}`, { isAvailable });
      showNotification(`메뉴가 ${isAvailable ? '판매 재개' : '품절 처리'}되었습니다.`, 'success');
      loadDashboardData();
    } catch (error) {
      console.error('메뉴 상태 변경 실패:', error);
      showNotification('메뉴 상태를 변경하는데 실패했습니다.', 'error');
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading, showNotification, loadDashboardData]);

  const toggleAdStatus = useCallback(async (adId: string, isActive: boolean) => {
    showLoading();
    try {
      await API.put(`/advertisements/${adId}`, { isActive });
      showNotification(`광고가 ${isActive ? '활성화' : '비활성화'}되었습니다.`, 'success');
      loadDashboardData();
    } catch (error) {
      console.error('광고 상태 변경 실패:', error);
      showNotification('광고 상태를 변경하는데 실패했습니다.', 'error');
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading, showNotification, loadDashboardData]);

  const recentOrderColumns = [
    { key: 'orderId', header: '주문번호', render: (value: string) => `#${value}` },
    {
      key: 'items',
      header: '메뉴',
      render: (items: OrderItem[]) => {
        const firstItem = items[0];
        const count = items.length;
        return count > 1 ? `${firstItem.name} 외 ${count - 1}개` : firstItem.name;
      },
    },
    { key: 'totalPrice', header: '총 금액', render: (value: number) => Utils.formatPrice(value) },
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
  ];

  const soldOutMenuColumns = [
    { key: 'image', header: '이미지', render: (value: string) => value ? <img src={value} alt="메뉴" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} /> : <span>이미지 없음</span> },
    { key: 'name', header: '메뉴명' },
    { key: 'category', header: '카테고리', render: (value: string) => Utils.getCategoryName(value) },
    { key: 'price', header: '가격', render: (value: number) => Utils.formatPrice(value) },
  ];

  const soldOutMenuActions = [
    {
      text: '판매 재개',
      class: 'btn-success',
      onClick: (menu: Menu) => toggleMenuAvailability(menu.id, true),
    },
  ];

  const activeAdColumns = [
    { key: 'image', header: '이미지', render: (value: string) => value ? <img src={value} alt="광고" style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '5px' }} /> : <span>이미지 없음</span> },
    { key: 'title', header: '제목' },
    { key: 'description', header: '설명' },
    { key: 'position', header: '위치', render: (value: string) => value === 'main' ? '메인 화면' : '상세 화면' },
    { key: 'priority', header: '우선순위' },
  ];

  const activeAdActions = [
    {
      text: '비활성화',
      class: 'btn-warning',
      onClick: (ad: Ad) => toggleAdStatus(ad._id, false),
    },
  ];

  return (
    <div>
      <h1>관리자 대시보드</h1>

      <div className="grid grid-4">
        <StatCard number={totalMenus} label="전체 메뉴" />
        <StatCard number={availableMenus} label="판매 중인 메뉴" />
        <StatCard number={todayOrders} label="오늘 주문 수" />
        <StatCard number={Utils.formatPrice(todayRevenue)} label="오늘 매출" />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">빠른 메뉴</h2>
          </div>
          <div className="grid grid-2">
            <button className="btn btn-success" onClick={() => showNotification('메뉴 관리 페이지로 이동', 'success')}>📝 메뉴 관리</button>
            <button className="btn btn-info" onClick={() => showNotification('주문 내역 페이지로 이동', 'success')}>📋 주문 내역</button>
            <button className="btn btn-warning" onClick={() => showNotification('광고 관리 페이지로 이동', 'success')}>📢 광고 관리</button>
            <button className="btn btn-secondary" onClick={loadDashboardData}>🔄 데이터 새로고침</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">시스템 상태</h2>
          </div>
          <div className="system-status">
            <div className="status-item">
              <span className="status-label">서버 상태:</span>
              <span className="badge badge-success">정상</span>
            </div>
            <div className="status-item">
              <span className="status-label">데이터베이스:</span>
              <span className="badge badge-success">연결됨</span>
            </div>
            <div className="status-item">
              <span className="status-label">마지막 업데이트:</span>
              <span id="lastUpdate">{lastUpdate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">최근 주문</h2>
          <button className="btn btn-sm" onClick={() => showNotification('주문 내역 페이지로 이동', 'success')}>전체 보기</button>
        </div>
        <DataTable data={recentOrders} columns={recentOrderColumns} />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">품절 메뉴</h2>
          <button className="btn btn-sm" onClick={() => showNotification('메뉴 관리 페이지로 이동', 'success')}>관리하기</button>
        </div>
        <DataTable data={soldOutMenus} columns={soldOutMenuColumns} actions={soldOutMenuActions} />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">활성 광고</h2>
          <button className="btn btn-sm" onClick={() => showNotification('광고 관리 페이지로 이동', 'success')}>관리하기</button>
        </div>
        <DataTable data={activeAds} columns={activeAdColumns} actions={activeAdActions} />
      </div>
    </div>
  );
};

export default Dashboard;