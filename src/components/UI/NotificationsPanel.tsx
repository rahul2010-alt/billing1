import React from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../../utils/context/AppContext';

const NotificationsPanel: React.FC = () => {
  const { notifications, removeNotification } = useAppContext();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div 
          key={index}
          className="bg-white border-l-4 border-teal-500 p-4 shadow-lg rounded-md max-w-sm animate-slideIn"
        >
          <div className="flex items-start">
            <div className="flex-grow">
              <p className="text-sm text-gray-700">{notification}</p>
            </div>
            <button 
              className="ml-4 text-gray-400 hover:text-gray-500"
              onClick={() => removeNotification(index)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsPanel;