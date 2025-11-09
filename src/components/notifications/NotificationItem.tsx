'use client';

import { useState } from 'react';
import { Notification, formatNotificationTime, truncateText } from '@/data/notifications';

interface NotificationItemProps {
  notification: Notification;
  onToggleRead: (id: string) => void;
  onViewVO?: (notification: Notification) => void;
}

export default function NotificationItem({ notification, onToggleRead, onViewVO }: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedTime = formatNotificationTime(notification.timestamp);
  const truncatedMessage = truncateText(notification.message, 60);

  const handleClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking button
    onToggleRead(notification.id);
    setIsExpanded(false); // Collapse after marking
  };

  const handleViewVO = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewVO) {
      onViewVO(notification);
      // Mark as read when viewing
      if (!notification.read) {
        onToggleRead(notification.id);
      }
    }
  };

  return (
    <div
      className={`
        border-b border-gray-200 px-3 py-4 cursor-pointer transition-all duration-200
        ${notification.read ? 'bg-white' : 'bg-blue-50'}
        hover:bg-gray-50 active:bg-gray-100
      `}
      onClick={handleClick}
    >
      <div className="flex items-start">
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className={`text-sm mb-1 transition-all duration-200 ${notification.read ? 'font-normal' : 'font-semibold'}`}>
            <span className="text-gray-900">{notification.patientName}</span>
            <span className="text-gray-500 mx-1.5">•</span>
            <span className="text-gray-700">VO {notification.voNumber}</span>
            <span className="text-gray-500 mx-1.5">•</span>
            <span className="text-gray-500">{formattedTime}</span>
          </div>

          {/* Message */}
          <div className={`text-sm transition-all duration-200 ${notification.read ? 'text-gray-600' : 'text-gray-700'}`}>
            {isExpanded ? notification.message : truncatedMessage}
          </div>

          {/* Action buttons (only shown when expanded) - shown inline below message */}
          {isExpanded && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleViewVO}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                View VO
              </button>
              <button
                onClick={handleToggleRead}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors min-h-[44px]"
              >
                Mark as Read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
