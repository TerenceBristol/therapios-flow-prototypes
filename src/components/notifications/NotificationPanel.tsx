'use client';

import { useState } from 'react';
import {
  Notification,
  getUnreadAnnouncementCount,
  getUnreadVONotificationCount,
  getAnnouncementsByReadStatus,
  getVONotificationsByReadStatus,
  getReadNotifications
} from '@/data/notifications';
import NotificationItem from './NotificationItem';
import AnnouncementItem from './AnnouncementItem';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onUpdateNotifications: (notifications: Notification[]) => void;
  onViewVO?: (notification: Notification) => void;
}

type TabType = 'announcements' | 'my-notifications' | 'read';

export default function NotificationPanel({ notifications, onClose, onUpdateNotifications, onViewVO }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('announcements');

  // Get counts for badge display
  const unreadAnnouncementCount = getUnreadAnnouncementCount(notifications);
  const unreadVONotificationCount = getUnreadVONotificationCount(notifications);

  // Get notifications by category and read status
  const unreadAnnouncements = getAnnouncementsByReadStatus(notifications, false);
  const unreadVONotifications = getVONotificationsByReadStatus(notifications, false);
  const readNotifications = getReadNotifications(notifications);

  const getCurrentTabNotifications = () => {
    switch (activeTab) {
      case 'announcements':
        return unreadAnnouncements;
      case 'my-notifications':
        return unreadVONotifications;
      case 'read':
        return readNotifications;
    }
  };

  const currentNotifications = getCurrentTabNotifications();

  const handleToggleRead = (id: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    onUpdateNotifications(updatedNotifications);
  };

  const handleMarkAllAsRead = () => {
    let updatedNotifications = notifications;

    if (activeTab === 'announcements') {
      // Mark all unread announcements as read
      updatedNotifications = notifications.map(n =>
        n.category === 'announcement' && !n.read ? { ...n, read: true } : n
      );
    } else if (activeTab === 'my-notifications') {
      // Mark all unread VO notifications as read
      updatedNotifications = notifications.map(n =>
        n.category === 'vo-notification' && !n.read ? { ...n, read: true } : n
      );
    }

    onUpdateNotifications(updatedNotifications);
  };

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case 'announcements':
        return "You're all caught up! 🎉";
      case 'my-notifications':
        return "You're all caught up! 🎉";
      case 'read':
        return 'No read notifications yet';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={onClose}
    >
      {/* Side Drawer - slides in from right */}
      <div
        className="ml-auto bg-white shadow-2xl h-full flex flex-col animate-slideInRight"
        style={{ width: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
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
            onClick={() => setActiveTab('announcements')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[48px]
              ${activeTab === 'announcements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            📢 Announcements {unreadAnnouncementCount > 0 && `(${unreadAnnouncementCount})`}
          </button>
          <button
            onClick={() => setActiveTab('my-notifications')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[48px]
              ${activeTab === 'my-notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            📋 My Notifications {unreadVONotificationCount > 0 && `(${unreadVONotificationCount})`}
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`
              flex-1 px-4 py-3 text-sm font-medium transition-colors min-h-[48px]
              ${activeTab === 'read'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            ✓ Read
          </button>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {currentNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
              {getEmptyStateMessage()}
            </div>
          ) : (
            currentNotifications.map(notification => {
              // Use AnnouncementItem for announcements, NotificationItem for VO notifications
              if (notification.category === 'announcement') {
                return (
                  <AnnouncementItem
                    key={notification.id}
                    notification={notification}
                    onToggleRead={handleToggleRead}
                  />
                );
              } else {
                return (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onToggleRead={handleToggleRead}
                    onViewVO={onViewVO}
                  />
                );
              }
            })
          )}
        </div>

        {/* Footer with Mark all as read button */}
        {activeTab !== 'read' && (
          (activeTab === 'announcements' && unreadAnnouncementCount > 0) ||
          (activeTab === 'my-notifications' && unreadVONotificationCount > 0)
        ) && (
          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={handleMarkAllAsRead}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors min-h-[48px]"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
