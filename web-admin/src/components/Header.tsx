import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">🏪 스마트 키오스크 관리자</div>
        <nav className="nav-links">
          <a
            href="#"
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            대시보드
          </a>
          <a
            href="#"
            className={activeTab === 'menus' ? 'active' : ''}
            onClick={() => setActiveTab('menus')}
          >
            메뉴 관리
          </a>
          <a
            href="#"
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            주문 내역
          </a>
          <a
            href="#"
            className={activeTab === 'statistics' ? 'active' : ''}
            onClick={() => setActiveTab('statistics')}
          >
            주문 통계
          </a>
          <a
            href="#"
            className={activeTab === 'advertisements' ? 'active' : ''}
            onClick={() => setActiveTab('advertisements')}
          >
            광고 관리
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
