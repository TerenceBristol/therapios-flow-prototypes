'use client';

interface NotificationBannerProps {
  unreadCount: number;
  onView: () => void;
  onDismiss: () => void;
}

export default function NotificationBanner({ unreadCount, onView, onDismiss }: NotificationBannerProps) {
  return (
    <div className="bg-orange-50 border-orange-600 border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - message */}
          <div className="flex items-center gap-3 flex-1">
            <span className="text-lg">ℹ️</span>
            <span className="text-orange-800 font-medium text-sm">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Right side - actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors min-h-[44px]"
            >
              View
            </button>
            <button
              onClick={onDismiss}
              className="text-orange-800 hover:opacity-70 transition-opacity p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
