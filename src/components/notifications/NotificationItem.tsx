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

  // Determine styling based on tier and read status
  let style;
  if (notification.read) {
    // All read notifications: uniform gray
    style = {
      borderWidth: 'border-l-2',
      borderColor: 'border-l-gray-300',
      bgColor: 'bg-gray-50',
      titleColor: 'text-gray-700',
      buttonColor: 'bg-gray-500 hover:bg-gray-600',
    };
  } else if (notification.tier === 2) {
    // Unread Tier 2: Blue (Action Required)
    style = {
      borderWidth: 'border-l-4',
      borderColor: 'border-l-blue-500',
      bgColor: 'bg-blue-50',
      titleColor: 'text-blue-900',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
    };
  } else {
    // Unread Tier 3: Gray (Informational)
    style = {
      borderWidth: 'border-l-2',
      borderColor: 'border-l-gray-400',
      bgColor: 'bg-gray-50',
      titleColor: 'text-gray-900',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
    };
  }

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
        ${style.borderWidth} ${style.borderColor} ${style.bgColor}
        border-b border-gray-200 px-4 py-4 cursor-pointer transition-all duration-200
        hover:opacity-90 active:opacity-80
      `}
      onClick={handleClick}
    >
      {/* Content */}
      <div className="w-full">
          {/* Title and timestamp */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h4 className={`text-sm font-bold ${style.titleColor}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formattedTime}
            </span>
          </div>

          {/* Patient and VO info */}
          <div className="text-xs text-gray-600 mb-2">
            <span>{notification.patientName}</span>
            <span className="mx-1.5">•</span>
            <span>VO {notification.voNumber}</span>
          </div>

          {/* Message */}
          <div className="text-sm text-gray-700 mb-3">
            {isExpanded ? notification.message : truncatedMessage}
          </div>

          {/* Action buttons (only shown when expanded) */}
          {isExpanded && (
            <div className="flex gap-2">
              <button
                onClick={handleViewVO}
                className={`px-4 py-2.5 ${style.buttonColor} text-white rounded-md text-sm font-medium transition-colors min-h-[48px]`}
              >
                View VO
              </button>
              {!notification.read && (
                <button
                  onClick={handleToggleRead}
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors min-h-[48px]"
                >
                  Mark as Read
                </button>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
