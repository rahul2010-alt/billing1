import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './components/Dashboard/Dashboard';
import BillingPage from './components/Billing/BillingPage';
import InventoryPage from './components/Inventory/InventoryPage';
import CustomersPage from './components/Customers/CustomersPage';
import SuppliersPage from './components/Suppliers/SuppliersPage';
import GstReportPage from './components/GstReports/GstReportPage';
import ReportsPage from './components/Reports/ReportsPage';
import PurchasePage from './components/Purchases/PurchasePage';
import BackupPage from './components/Backup/BackupPage';
import SettingsPage from './components/Settings/SettingsPage';
import UsersPage from './components/Users/UsersPage';
import LoginPage from './components/Auth/LoginPage';
import { checkSupabaseConnection } from './utils/supabase';
import { AppProvider, useAppContext } from './utils/context/AppContext';

function AppContent() {
  const { isAuthenticated } = useAppContext();
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        const connected = await checkSupabaseConnection();
        setIsConnected(connected);
      } catch (error) {
        console.error('Connection check failed:', error);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking database connection...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Database Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the database. This could be due to:
          </p>
          <ul className="text-sm text-gray-600 mb-4 list-disc list-inside">
            <li>Missing or incorrect Supabase configuration</li>
            <li>Network connectivity issues</li>
            <li>Supabase project not accessible</li>
          </ul>
          <p className="text-sm text-gray-500 mb-4">
            Please check your environment variables and ensure your Supabase project is properly configured.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/gst-reports" element={<GstReportPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/purchases" element={<PurchasePage />} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;