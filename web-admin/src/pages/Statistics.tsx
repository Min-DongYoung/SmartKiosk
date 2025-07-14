import React, { useState, useEffect } from 'react';
import { API } from '../services/apiService';
import Utils from '../lib/utils';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { useLoading } from '../components/Loading';
import { useNotification } from '../components/Notification';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

interface BasicStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  statusBreakdown: { _id: string; count: number }[];
}

interface HourlyStat {
  hour: number;
  orderCount: number;
}

interface MenuStat {
  name: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  orderCount: number;
}

interface DailyStat {
  date: string;
  orderCount: number;
  revenue: number;
}

const Statistics: React.FC = () => {
  const [periodType, setPeriodType] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [statisticsData, setStatisticsData] = useState<{
    basic: BasicStats;
    hourly: HourlyStat[];
    menu: MenuStat[];
    daily: DailyStat[];
  } | null>(null);

  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();

  useEffect(() => {
    initializeDateInputs();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadStatistics();
    }
  }, [startDate, endDate, periodType]);

  const initializeDateInputs = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setStartDate(todayStr);
    setEndDate(todayStr);
  };

  const updateDateInputs = (type: 'today' | 'week' | 'month' | 'custom') => {
    setPeriodType(type);
    const today = new Date();
    let newStartDate = new Date(today);
    let newEndDate = new Date(today);

    if (type === 'custom') {
      // Do nothing, let user input dates
    } else if (type === 'today') {
      // Already set to today
    } else if (type === 'week') {
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
      newStartDate = new Date(today.setDate(diff));
      newEndDate = new Date();
    } else if (type === 'month') {
      newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
      newEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    setStartDate(newStartDate.toISOString().split('T')[0]);
    setEndDate(newEndDate.toISOString().split('T')[0]);
  };

  const loadStatistics = async () => {
    showLoading();
    try {
      const basicStats = await API.get(`/orders/stats/range?startDate=${startDate}&endDate=${endDate}`);
      const hourlyStats = await API.get(`/orders/stats/hourly?startDate=${startDate}&endDate=${endDate}`);
      const menuStats = await API.get(`/orders/stats/menu?startDate=${startDate}&endDate=${endDate}`);
      const dailyStats = await API.get(`/orders/stats/daily?startDate=${startDate}&endDate=${endDate}`);

      setStatisticsData({
        basic: basicStats.data || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, completionRate: 0, statusBreakdown: [] },
        hourly: hourlyStats.data || [],
        menu: menuStats.data || [],
        daily: dailyStats.data || []
      });
    } catch (error: any) {
      console.error('통계 로드 실패:', error);
      showNotification(`통계 데이터를 불러오는데 실패했습니다: ${error.message}`, 'error');
      setStatisticsData({
        basic: { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0, completionRate: 0, statusBreakdown: [] },
        hourly: [],
        menu: [],
        daily: []
      });
    } finally {
      hideLoading();
    }
  };

  const refreshStatistics = () => {
    loadStatistics();
    showNotification('통계가 새로고침되었습니다.', 'success');
  };

  const COLORS = ['#ffd43b', '#51cf66', '#40c057', '#667eea', '#ff6b6b'];

  const menuColumns = [
    { key: 'name', header: '메뉴명' },
    { key: 'totalQuantity', header: '총 주문 수량' },
    { key: 'totalRevenue', header: '총 매출', render: (value: number) => Utils.formatPrice(value) },
    { key: 'averagePrice', header: '평균 단가', render: (value: number) => Utils.formatPrice(value) },
    { key: 'orderCount', header: '주문 횟수' }
  ];

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">주문 통계</h1>
        <button className="btn btn-secondary" onClick={refreshStatistics}>
          🔄 새로고침
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">기간 선택</h2>
        </div>
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">기간 종류</label>
            <select className="form-select" value={periodType} onChange={(e) => updateDateInputs(e.target.value as 'today' | 'week' | 'month' | 'custom')}>
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="custom">사용자 정의</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">시작 날짜</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={periodType !== 'custom'} />
          </div>
          <div className="form-group">
            <label className="form-label">종료 날짜</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={periodType !== 'custom'} />
          </div>
          <div className="form-group">
            <label className="form-label">차트 종류</label>
            <select className="form-select" value={chartType} onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'pie')}>
              <option value="bar">막대형</option>
              <option value="line">선형</option>
              <option value="pie">원형</option>
            </select>
          </div>
        </div>
      </div>

      {statisticsData && (
        <div className="grid grid-4">
          <StatCard number={statisticsData.basic.totalOrders} label="총 주문 수" />
          <StatCard number={Utils.formatPrice(statisticsData.basic.totalRevenue)} label="총 매출" />
          <StatCard number={Utils.formatPrice(statisticsData.basic.averageOrderValue)} label="평균 주문액" />
          <StatCard number={`${statisticsData.basic.completionRate}%`} label="완료율" />
        </div>
      )}

      {statisticsData && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">일별 주문 수</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={statisticsData.daily}
                      dataKey="orderCount"
                      nameKey="date"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {statisticsData.daily.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}건`} />
                    <Legend />
                  </PieChart>
                ) : (
                  <LineChart data={statisticsData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}건`} />
                    <Legend />
                    <Line type="monotone" dataKey="orderCount" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">상태별 주문 분포</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statisticsData.basic.statusBreakdown.map(s => ({ name: Utils.getOrderStatusName(s._id), value: s.count }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    label
                  >
                    {statisticsData.basic.statusBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value}건`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {statisticsData && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">시간대별 주문 패턴</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={statisticsData.hourly.map(h => ({ name: `${h.hour}시`, value: h.orderCount }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {statisticsData.hourly.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}건`} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={statisticsData.hourly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}건`} />
                    <Legend />
                    <Bar dataKey="orderCount" fill="#82ca9d" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">인기 메뉴 TOP 10</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={statisticsData.menu.slice(0, 10).map(m => ({ name: m.name, value: m.totalQuantity }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {statisticsData.menu.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}개`} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={statisticsData.menu.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value: number) => `${value}개`} />
                    <Legend />
                    <Bar dataKey="totalQuantity" fill="#8884d8" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {statisticsData && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">매출 분석</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={statisticsData.daily.map(d => ({ name: d.date, value: d.revenue }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {statisticsData.daily.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => Utils.formatPrice(value)} />
                  <Legend />
                </PieChart>
              ) : (
                <LineChart data={statisticsData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value: number) => Utils.formatPrice(value)} />
                  <Tooltip formatter={(value: number) => Utils.formatPrice(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {statisticsData && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">상세 통계</h3>
          </div>
          <DataTable data={statisticsData.menu} columns={menuColumns} />
        </div>
      )}
    </div>
  );
};

export default Statistics;