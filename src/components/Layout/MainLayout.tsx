import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAppContext } from '../../utils/context/AppContext';
import NotificationsPanel from '../UI/NotificationsPanel';

const MainLayout: React.FC = () => {
  const { sidebarCollapsed } = useAppContext();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
        <NotificationsPanel />
      </div>
    </div>
  );
};

export default MainLayout;