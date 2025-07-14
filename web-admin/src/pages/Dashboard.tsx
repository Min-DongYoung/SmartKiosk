import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API, Utils } from '../lib/utils'; // 유틸리티 함수 임포트

// 임시 Card 컴포넌트 (Shadcn UI 설치 전까지 사용)
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`mb-2 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  isVoiceOrder: boolean;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

interface PopularMenu {
  _id: string;
  totalQuantity: number;
}

interface HourlyStat {
  hour: string;
  orders: number;
  revenue: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
    voiceOrderRatio: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [popularMenus, setPopularMenus] = useState<PopularMenu[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyStat[]>([]);
  const [voiceStats, setVoiceStats] = useState({ success: 0, failed: 0 });

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsRes = await API.get('/orders/stats/today');
      if (statsRes.success) {
        setStats({
          todayOrders: statsRes.data.totalOrders,
          todayRevenue: statsRes.data.totalRevenue,
          avgOrderValue: Math.round(statsRes.data.averageOrderValue),
          voiceOrderRatio: Math.round((statsRes.data.voiceOrders / statsRes.data.totalOrders) * 100) || 0
        });
      }

      const ordersRes = await API.get('/orders?limit=5');
      if (ordersRes.success) {
        setRecentOrders(ordersRes.data);
      }

      const popularRes = await API.get('/analytics/popular-menus?limit=5');
      if (popularRes.success) {
        setPopularMenus(popularRes.data);
      }

      const hourlyRes = await API.get('/analytics/hourly-stats');
      if (hourlyRes.success) {
        setHourlyData(hourlyRes.data.map((item: any) => ({
          hour: `${item._id}시`,
          orders: item.orderCount,
          revenue: item.revenue
        })));
      }

      const voiceRes = await API.get('/voice/stats?period=day');
      if (voiceRes.success) {
        setVoiceStats({
          success: voiceRes.data.successfulCommands,
          failed: voiceRes.data.totalCommands - voiceRes.data.successfulCommands
        });
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
    }
  };

  const handleNewOrder = (order: Order) => {
    setRecentOrders(prev => [order, ...prev.slice(0, 4)]);
    
    setStats(prev => ({
      ...prev,
      todayOrders: prev.todayOrders + 1,
      todayRevenue: prev.todayRevenue + order.totalAmount
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">실시간 대시보드</h1>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-600">오늘 주문</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}건</div>
            <div className="text-sm text-green-600 mt-1">
              실시간 업데이트 중
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-600">오늘 매출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Utils.formatPrice(stats.todayRevenue)}</div>
            <div className="text-sm text-gray-500 mt-1">
              평균 주문: {Utils.formatPrice(stats.avgOrderValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-600">음성 주문 비율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.voiceOrderRatio}%</div>
            <div className="text-sm text-blue-600 mt-1">
              혁신적인 주문 경험
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-600">음성 인식 성공률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {voiceStats.success > 0 
                ? Math.round((voiceStats.success / (voiceStats.success + voiceStats.failed)) * 100)
                : 0}%
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {voiceStats.success}건 성공 / {voiceStats.failed}건 실패
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 시간대별 주문 현황 */}
        <Card>
          <CardHeader>
            <CardTitle>시간대별 주문 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 인기 메뉴 TOP 5 */}
        <Card>
          <CardHeader>
            <CardTitle>인기 메뉴 TOP 5</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={popularMenus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalQuantity" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 최근 주문 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 주문 (실시간)</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentOrders.map((order, index) => (
              <div 
                key={order._id} 
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">
                    주문번호: {order.orderNumber}
                    {order.isVoiceOrder && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">
                        음성주문
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items.map(item => `${item.name} ${item.quantity}개`).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{Utils.formatPrice(order.totalAmount)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 실시간 알림 */}
      <div className="fixed bottom-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>실시간 모니터링 중</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;