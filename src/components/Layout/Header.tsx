import React, { useState } from 'react';
import { Calendar, Bell, User, LogOut, Settings, Lock } from 'lucide-react';
import { useAppContext } from '../../utils/context/AppContext';
import { useAuth } from '../../utils/hooks/useAuth';
import MonthSelector from '../UI/MonthSelector';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';

const Header: React.FC = () => {
  const { user, notifications } = useAppContext();
  const { signOut, changePassword } = useAuth();
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setShowChangePassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-semibold text-teal-700">M R Medical & General Store</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => setShowMonthSelector(!showMonthSelector)}
            >
              <Calendar className="h-5 w-5 text-gray-600" />
            </button>
            {showMonthSelector && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-20">
                <MonthSelector onClose={() => setShowMonthSelector(false)} />
              </div>
            )}
          </div>
          
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500">
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
            </button>
            
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowChangePassword(true);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Change Password
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showChangePassword}
        onClose={() => {
          setShowChangePassword(false);
          setPasswordError(null);
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }}
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm text-red-700">{passwordError}</p>
            </div>
          )}

          <Input
            type="password"
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            required
          />

          <Input
            type="password"
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            required
          />

          <Input
            type="password"
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            required
          />

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowChangePassword(false);
                setPasswordError(null);
                setPasswordForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Change Password
            </Button>
          </div>
        </form>
      </Modal>
    </header>
  );
};

export default Header;