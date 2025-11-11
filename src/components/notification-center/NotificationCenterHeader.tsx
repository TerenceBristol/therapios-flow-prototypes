'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationBell from '@/components/notifications/NotificationBell';
import type { Notification } from '@/data/notifications';

interface NotificationCenterHeaderProps {
  notifications: Notification[];
  onUpdateNotifications: (notifications: Notification[]) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  onViewVO?: (notification: Notification) => void;
}

export default function NotificationCenterHeader({
  notifications,
  onUpdateNotifications,
  isPanelOpen,
  setIsPanelOpen,
  onViewVO
}: NotificationCenterHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo/Brand + Menu Items */}
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Flow</h1>

            {/* Menu Items */}
            <nav className="flex items-center gap-4">
              <Link
                href="/prototypes/notification-center/patient-view"
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.includes('/patient-view')
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                T Board
              </Link>
              <span className="px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
                VO Upload
              </span>
            </nav>
          </div>

          {/* Right side - User info and Notification Bell */}
          <div className="flex items-center gap-4">
            <NotificationBell
              notifications={notifications}
              onUpdateNotifications={onUpdateNotifications}
              isPanelOpen={isPanelOpen}
              setIsPanelOpen={setIsPanelOpen}
              onViewVO={onViewVO}
            />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                FW
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">Frauke Wolff</div>
                <div className="text-xs text-gray-500">Therapist</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
