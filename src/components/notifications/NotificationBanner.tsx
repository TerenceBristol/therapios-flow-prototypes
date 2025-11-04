'use client';

interface NotificationBannerProps {
  unreadCount: number;
  urgency: 'high' | 'medium' | 'info';
  onView: () => void;
  onDismiss: () => void;
}

export default function NotificationBanner({ unreadCount, urgency, onView, onDismiss }: NotificationBannerProps) {
  // Color schemes based on urgency
  const getColorScheme = () => {
    switch (urgency) {
      case 'high':
        return {
          bg: 'bg-red-50',
          border: 'border-red-600',
          text: 'text-red-700',
          icon: '⚠️',
          buttonBg: 'bg-red-600 hover:bg-red-700',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-600',
          text: 'text-yellow-800',
          icon: '⚠️',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-600',
          text: 'text-blue-800',
          icon: 'ℹ️',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
        };
    }
  };

  const colors = getColorScheme();

  return (
    <div className={`${colors.bg} ${colors.border} border-b`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - message */}
          <div className="flex items-center gap-3 flex-1">
            <span className="text-lg">{colors.icon}</span>
            <span className={`${colors.text} font-medium text-sm`}>
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Right side - actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className={`${colors.buttonBg} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]`}
            >
              View
            </button>
            <button
              onClick={onDismiss}
              className={`${colors.text} hover:opacity-70 transition-opacity p-2 min-h-[44px] min-w-[44px] flex items-center justify-center`}
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
