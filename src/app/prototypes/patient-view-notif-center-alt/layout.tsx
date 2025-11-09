'use client';

import { useState, useEffect } from 'react';
import NotificationCenterHeader from '@/components/notification-center/NotificationCenterHeader';
import NotificationBanner from '@/components/notifications/NotificationBanner';
import { sampleNotifications, getUnreadCount } from '@/data/notifications';
import type { Notification } from '@/data/notifications';
import { NotificationProvider, useNotificationContext } from '@/contexts/NotificationContext';

function NotificationCenterLayoutContent({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { requestViewVO } = useNotificationContext();

  const unreadCount = getUnreadCount(notifications);

  // Reset banner dismissed state when unread count increases from 0
  useEffect(() => {
    if (unreadCount > 0) {
      setIsBannerDismissed(false);
    }
  }, [unreadCount]);

  const handleViewNotifications = () => {
    setIsPanelOpen(true);
  };

  const handleDismissBanner = () => {
    setIsBannerDismissed(true);
  };

  const handleUpdateNotifications = (updatedNotifications: Notification[]) => {
    setNotifications(updatedNotifications);
  };

  const handleViewVO = (notification: Notification) => {
    // Close the panel
    setIsPanelOpen(false);

    // Request navigation to the VO
    requestViewVO({
      patientId: notification.patientId,
      voNumber: notification.voNumber,
      targetTab: notification.targetTab,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationCenterHeader
        notifications={notifications}
        onUpdateNotifications={handleUpdateNotifications}
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
        onViewVO={handleViewVO}
      />

      {/* Notification Alert Banner */}
      {unreadCount > 0 && !isBannerDismissed && (
        <NotificationBanner
          unreadCount={unreadCount}
          onView={handleViewNotifications}
          onDismiss={handleDismissBanner}
        />
      )}

      {/* Page Content */}
      {children}
    </div>
  );
}

export default function NotificationCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <NotificationCenterLayoutContent>{children}</NotificationCenterLayoutContent>
    </NotificationProvider>
  );
}
