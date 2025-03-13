import React from 'react';
import { Bell, AlertTriangle, Droplet, Info } from 'lucide-react';
import { Notification } from '../types';
import { motion } from 'framer-motion';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'alert':
        return <AlertTriangle className="text-red-600" />;
      case 'blood_request':
        return <Droplet className="text-red-600" />;
      case 'donation_reminder':
        return <Droplet className="text-blue-600" />;
      default:
        return <Info className="text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg mb-3 ${
        notification.read ? 'bg-white' : 'bg-red-50'
      } border ${notification.read ? 'border-gray-200' : 'border-red-200'}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3 mt-1">{getIcon()}</div>
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
          <p className="text-gray-700 mt-1">{notification.message}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {formatDate(notification.created_at)}
            </span>
            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;