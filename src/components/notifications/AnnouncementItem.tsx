'use client';

import { Notification, formatNotificationTime } from '@/data/notifications';

interface AnnouncementItemProps {
  notification: Notification;
  onToggleRead: (id: string) => void;
}

// Announcement type configuration
const announcementStyles = {
  'general-announcement': {
    icon: '📢',
    borderColor: 'border-l-gray-400',
    bgColor: 'bg-gray-50',
    iconColor: 'text-gray-600',
    titleColor: 'text-gray-900',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
  },
  'new-feature': {
    icon: '⭐',
    borderColor: 'border-l-green-500',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
    buttonColor: 'bg-green-600 hover:bg-green-700',
  },
  'technical-issue': {
    icon: '⚠️',
    borderColor: 'border-l-red-500',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
    buttonColor: 'bg-red-600 hover:bg-red-700',
  },
  'company-announcement': {
    icon: '🏢',
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    buttonColor: 'bg-blue-600 hover:bg-blue-700',
  },
} as const;

export default function AnnouncementItem({ notification, onToggleRead }: AnnouncementItemProps) {
  const formattedTime = formatNotificationTime(notification.timestamp);

  // Get styling based on announcement type
  const style = announcementStyles[notification.type as keyof typeof announcementStyles] || announcementStyles['general-announcement'];

  return (
    <div
      className={`
        border-l-8 ${style.borderColor} ${style.bgColor}
        border-b border-gray-200 px-4 py-4 transition-all duration-200
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`text-3xl ${style.iconColor} flex-shrink-0`}>
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and timestamp */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className={`text-base font-bold ${style.titleColor}`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formattedTime}
            </span>
          </div>

          {/* Message */}
          <div className="text-sm text-gray-700">
            {notification.message}
          </div>
        </div>
      </div>
    </div>
  );
}
