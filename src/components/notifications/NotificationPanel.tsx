'use client';

import { useState } from 'react';
import { Notification, getUnreadNotifications, getAllActiveNotifications, getArchivedNotifications } from '@/data/notifications';
import NotificationItem from './NotificationItem';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onUpdateNotifications: (notifications: Notification[]) => void;
}

type TabType = 'unread' | 'all' | 'archive';

export default function NotificationPanel({ notifications, onClose, onUpdateNotifications }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('unread');

  const unreadNotifications = getUnreadNotifications(notifications);
  const allActiveNotifications = getAllActiveNotifications(notifications);
  const archivedNotifications = getArchivedNotifications(notifications);

  const getCurrentTabNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return unreadNotifications;
      case 'all':
        return allActiveNotifications;
      case 'archive':
        return archivedNotifications;
    }
  };

  const currentNotifications = getCurrentTabNotifications();
  const unreadCount = unreadNotifications.length;

  const handleToggleRead = (id: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: !n.read } : n
    );
    onUpdateNotifications(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n =>
      !n.archived ? { ...n, read: true } : n
    );
    onUpdateNotifications(updatedNotifications);
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'unread':
        return 'No unread notifications';
      case 'all':
        return 'No notifications';
      case 'archive':
        return 'No archived notifications';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start pt-16 animate-fadeIn" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-2xl animate-slideDown" style={{ maxHeight: '50vh' }}>
        {/* Header with close button */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('unread')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[44px]
              ${activeTab === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[44px]
              ${activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[44px]
              ${activeTab === 'archive'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            Archive
          </button>
        </div>

        {/* Notification list */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(50vh - 160px)' }}>
          {currentNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
              {getEmptyStateMessage()}
            </div>
          ) : (
            currentNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onToggleRead={handleToggleRead}
              />
            ))
          )}
        </div>

        {/* Footer with Mark all as read button */}
        {activeTab !== 'archive' && unreadCount > 0 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
