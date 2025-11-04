'use client';

import { useState } from 'react';
import { Notification, getUrgencyColor, formatNotificationTime, truncateText } from '@/data/notifications';

interface NotificationItemProps {
  notification: Notification;
  onToggleRead: (id: string) => void;
}

export default function NotificationItem({ notification, onToggleRead }: NotificationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const urgencyColor = getUrgencyColor(notification.urgency);
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

  return (
    <div
      className={`
        border-b border-gray-200 px-3 py-4 cursor-pointer transition-all duration-200
        ${notification.read ? 'bg-white' : 'bg-blue-50'}
        hover:bg-gray-50 active:bg-gray-100
      `}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Color indicator dot */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 transition-transform duration-200"
          style={{
            backgroundColor: urgencyColor,
            transform: isExpanded ? 'scale(1.2)' : 'scale(1)'
          }}
        />

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

          {/* Mark as Read/Unread button (only shown when expanded) */}
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: isExpanded ? '60px' : '0px',
              opacity: isExpanded ? 1 : 0,
              marginTop: isExpanded ? '12px' : '0px'
            }}
          >
            <button
              onClick={handleToggleRead}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[44px]"
            >
              {notification.read ? 'Mark as Unread' : 'Mark as Read'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
