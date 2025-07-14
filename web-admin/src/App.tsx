import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import './index.css'; // Tailwind CSS 및 기타 스타일

function App() {
  return (
    <Router>
      <header className="header">
        <div className="header-container">
          <div className="logo">🏪 스마트 키오스크 관리자</div>
          <nav className="nav-links">
            <Link to="/">대시보드</Link>
            <Link to="/menus">메뉴 관리</Link>
            {/* <Link to="/orders">주문 내역</Link> */}
            {/* <Link to="/advertisements">광고 관리</Link> */}
          </nav>
        </div>
      </header>
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menus" element={<MenuManagement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;