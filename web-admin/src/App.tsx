import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import Orders from './pages/Orders';
import Statistics from './pages/Statistics';
import Advertisements from './pages/Advertisements';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'menus', 'orders', 'statistics', 'advertisements'

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'menus':
        return <MenuManagement />;
      case 'orders':
        return <Orders />;
      case 'statistics':
        return <Statistics />;
      case 'advertisements':
        return <Advertisements />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="container">
        {renderContent()}
      </div>
    </>
  );
}

export default App;
