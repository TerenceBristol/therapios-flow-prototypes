'use client';

import { useState, useEffect } from 'react';
import NotificationCenterHeader from '@/components/notification-center/NotificationCenterHeader';
import NotificationBanner from '@/components/notifications/NotificationBanner';
import { sampleNotifications, getUnreadCount, getHighestUrgency } from '@/data/notifications';
import type { Notification } from '@/data/notifications';

export default function NotificationCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const unreadCount = getUnreadCount(notifications);
  const highestUrgency = getHighestUrgency(notifications);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationCenterHeader
        notifications={notifications}
        onUpdateNotifications={handleUpdateNotifications}
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
      />

      {/* Notification Alert Banner */}
      {unreadCount > 0 && !isBannerDismissed && (
        <NotificationBanner
          unreadCount={unreadCount}
          urgency={highestUrgency}
          onView={handleViewNotifications}
          onDismiss={handleDismissBanner}
        />
      )}

      {/* Page Content */}
      {children}
    </div>
  );
}
