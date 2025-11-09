export interface Notification {
  id: string;
  category: 'announcement' | 'vo-notification';
  type: 'general-announcement' | 'new-feature' | 'technical-issue' | 'company-announcement' |
        'new-vo-assigned' | 'vo-shared' | 'shared-therapist-removed' | 'patient-transferred' |
        'vo-completed' | 'vo-expired' | 'vo-terminated' | 'vo-expiring-soon';
  urgency: 'high' | 'medium' | 'info';
  tier: 1 | 2 | 3; // Visual hierarchy: 1=Announcements, 2=Action Required, 3=Informational
  title: string; // Scenario name or announcement type
  patientName?: string; // Optional for announcements
  patientId?: string; // Optional for announcements
  voNumber?: string; // Optional for announcements
  voId?: string;
  targetTab?: 'my-vos' | 'shared-vos'; // Optional for announcements
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
}

// Helper to create dates relative to now
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const sampleNotifications: Notification[] = [
  // Unread Announcements (Tier 1)
  {
    id: 'ann-1',
    category: 'announcement',
    type: 'technical-issue',
    urgency: 'high',
    tier: 1,
    title: 'Technical Issue',
    message: 'We are currently experiencing intermittent server issues that may affect document uploads. Our technical team is actively working on a resolution. Expected fix time: 2 hours.',
    timestamp: hoursAgo(1),
    read: false,
    archived: false,
  },
  {
    id: 'ann-2',
    category: 'announcement',
    type: 'new-feature',
    urgency: 'info',
    tier: 1,
    title: 'New Feature',
    message: 'Introducing automated VO expiration alerts! You will now receive notifications 7 days before a VO expires with zero treatments. Check the notification center to stay on top of your workflow.',
    timestamp: hoursAgo(3),
    read: false,
    archived: false,
  },

  // Unread VO notifications - Tier 2 (Action Required)
  {
    id: '1',
    category: 'vo-notification',
    type: 'new-vo-assigned',
    urgency: 'info',
    tier: 2,
    title: 'New VO Assigned',
    patientName: 'Heldemarie Appasani-Konapatski',
    patientId: 'patient-3',
    voNumber: '2303-22',
    voId: '2303-22',
    targetTab: 'my-vos',
    message: 'New VO 2303-22 for Heldemarie Appasani-Konapatski has been assigned to you. Heilmittel: KG-ZNS. Valid from 15.01.2025 to 14.03.2025.',
    timestamp: hoursAgo(2),
    read: false,
    archived: false,
  },
  // Tier 3 (Informational)
  {
    id: '2',
    category: 'vo-notification',
    type: 'vo-shared',
    urgency: 'info',
    tier: 3,
    title: 'VO Shared',
    patientName: 'Klaus Becker',
    patientId: 'patient-4',
    voNumber: '2412-08',
    voId: '2412-08',
    targetTab: 'shared-vos',
    message: 'VO 2412-08 for Klaus Becker has been shared with you by M. Schmidt. Heilmittel: BO-E-H.',
    timestamp: hoursAgo(4),
    read: false,
    archived: false,
  },
  {
    id: '3',
    category: 'vo-notification',
    type: 'shared-therapist-removed',
    urgency: 'info',
    tier: 3,
    title: 'Shared Therapist Removed',
    patientName: 'Maria Hoffmann',
    patientId: 'patient-5',
    voNumber: '2801-15',
    targetTab: 'my-vos',
    message: 'You have been removed from VO 2801-15 for Maria Hoffmann. Removed on 05.01.2025.',
    timestamp: hoursAgo(6),
    read: false,
    archived: false,
  },
  {
    id: '4',
    category: 'vo-notification',
    type: 'patient-transferred',
    urgency: 'info',
    tier: 2,
    title: 'Patient Transferred',
    patientName: 'Stefan Wagner',
    patientId: 'patient-10',
    voNumber: '3050-01',
    voId: '3050-01',
    targetTab: 'my-vos',
    message: 'Patient Stefan Wagner and 1 VO(s) have been transferred to you from T. Mueller.',
    timestamp: hoursAgo(8),
    read: false,
    archived: false,
  },
  {
    id: '5',
    category: 'vo-notification',
    type: 'vo-completed',
    urgency: 'info',
    tier: 3,
    title: 'VO Completed',
    patientName: 'Anna Weber',
    patientId: 'patient-7',
    voNumber: '2732-08',
    voId: '2732-08',
    targetTab: 'my-vos',
    message: 'VO 2732-08 for Anna Weber has been completed. Total treatments: 18. Completed on 08.01.2025.',
    timestamp: hoursAgo(10),
    read: false,
    archived: false,
  },
  {
    id: '6',
    category: 'vo-notification',
    type: 'vo-expired',
    urgency: 'high',
    tier: 2,
    title: 'VO Expired',
    patientName: 'Peter Schmidt',
    patientId: 'patient-6',
    voNumber: '2625-12',
    voId: '2625-12',
    targetTab: 'my-vos',
    message: 'VO 2625-12 for Peter Schmidt has expired. Reason: Validity period ended. Treatments completed: 0.',
    timestamp: hoursAgo(12),
    read: false,
    archived: false,
  },
  {
    id: '7',
    category: 'vo-notification',
    type: 'vo-terminated',
    urgency: 'medium',
    tier: 3,
    title: 'VO Terminated',
    patientName: 'Lisa Schneider',
    patientId: 'patient-9',
    voNumber: '2945-02',
    voId: '2945-02',
    targetTab: 'my-vos',
    message: 'VO 2945-02 for Lisa Schneider has been terminated by S. Zeibig. Treatments completed: 4. Terminated on 07.01.2025.',
    timestamp: hoursAgo(14),
    read: false,
    archived: false,
  },
  {
    id: '8',
    category: 'vo-notification',
    type: 'vo-expiring-soon',
    urgency: 'medium',
    tier: 2,
    title: 'VO Expiring Soon',
    patientName: 'Anna Weber',
    patientId: 'patient-7',
    voNumber: '2732-09',
    voId: '2732-09',
    targetTab: 'my-vos',
    message: 'VO 2732-09 for Anna Weber will expire in 7 days. No treatments have been documented yet. Heilmittel: BO-E-H.',
    timestamp: hoursAgo(16),
    read: false,
    archived: false,
  },

  // Read notifications (recent)
  {
    id: 'ann-3',
    category: 'announcement',
    type: 'general-announcement',
    urgency: 'info',
    tier: 1,
    title: 'General Announcement',
    message: 'System maintenance scheduled for Sunday, January 19th from 2:00 AM to 4:00 AM. The system will be unavailable during this time. Please plan accordingly.',
    timestamp: daysAgo(1),
    read: true,
    archived: false,
  },
  {
    id: '9',
    category: 'vo-notification',
    type: 'new-vo-assigned',
    urgency: 'info',
    tier: 2,
    title: 'New VO Assigned',
    patientName: 'Ingeborg Achtenberg',
    patientId: 'patient-2',
    voNumber: '2201-14',
    voId: '2201-14',
    targetTab: 'my-vos',
    message: 'New VO 2201-14 for Ingeborg Achtenberg has been assigned to you. Heilmittel: KG-H. Valid from 20.10.2025 to 19.12.2025.',
    timestamp: daysAgo(1),
    read: true,
    archived: false,
  },
  {
    id: '10',
    category: 'vo-notification',
    type: 'vo-completed',
    urgency: 'info',
    tier: 3,
    title: 'VO Completed',
    patientName: 'Franz Abitz',
    patientId: 'patient-1',
    voNumber: '2155-08',
    voId: '2155-08',
    targetTab: 'my-vos',
    message: 'VO 2155-08 for Franz Abitz has been completed. Total treatments: 10. Completed on 25.12.2024.',
    timestamp: daysAgo(2),
    read: true,
    archived: false,
  },
  {
    id: '11',
    category: 'vo-notification',
    type: 'vo-expiring-soon',
    urgency: 'medium',
    tier: 2,
    title: 'VO Expiring Soon',
    patientName: 'Franz Abitz',
    patientId: 'patient-1',
    voNumber: '2155-11',
    voId: '2155-11',
    targetTab: 'my-vos',
    message: 'VO 2155-11 for Franz Abitz will expire in 5 days. 3 treatments documented out of 10 prescribed.',
    timestamp: daysAgo(3),
    read: true,
    archived: false,
  },

  // Archived notifications
  {
    id: '12',
    category: 'vo-notification',
    type: 'vo-completed',
    urgency: 'info',
    tier: 3,
    title: 'VO Completed',
    patientName: 'Hans Zimmermann',
    patientId: 'patient-11',
    voNumber: '3155-05',
    voId: '3155-05',
    targetTab: 'my-vos',
    message: 'VO 3155-05 for Hans Zimmermann has been completed. Total treatments: 10. Completed on 15.12.2024.',
    timestamp: daysAgo(35),
    read: true,
    archived: true,
  },
  {
    id: '13',
    category: 'vo-notification',
    type: 'new-vo-assigned',
    urgency: 'info',
    tier: 2,
    title: 'New VO Assigned',
    patientName: 'Klaus Weber',
    patientId: 'patient-12',
    voNumber: '3260-05',
    voId: '3260-05',
    targetTab: 'my-vos',
    message: 'New VO 3260-05 for Klaus Weber has been assigned to you. Heilmittel: KG. Valid from 12.08.2025 to 11.10.2025.',
    timestamp: daysAgo(40),
    read: true,
    archived: true,
  },
];

// Helper functions for filtering
export const getUnreadNotifications = (notifications: Notification[]) =>
  notifications.filter(n => !n.read && !n.archived);

export const getReadNotifications = (notifications: Notification[]) =>
  notifications.filter(n => n.read && !n.archived);

export const getAllActiveNotifications = (notifications: Notification[]) =>
  notifications.filter(n => !n.archived);

export const getArchivedNotifications = (notifications: Notification[]) =>
  notifications.filter(n => n.archived);

export const getUnreadCount = (notifications: Notification[]) =>
  getUnreadNotifications(notifications).length;

export const getHighestUrgency = (notifications: Notification[]): Notification['urgency'] => {
  const unreadNotifications = getUnreadNotifications(notifications);

  if (unreadNotifications.length === 0) {
    return 'info'; // Default if no unread
  }

  // Priority: high > medium > info
  if (unreadNotifications.some(n => n.urgency === 'high')) {
    return 'high';
  }
  if (unreadNotifications.some(n => n.urgency === 'medium')) {
    return 'medium';
  }
  return 'info';
};

export const getUrgencyColor = (urgency: Notification['urgency']): string => {
  switch (urgency) {
    case 'high':
      return '#EF4444'; // Red
    case 'medium':
      return '#F59E0B'; // Yellow/Amber
    case 'info':
      return '#3B82F6'; // Blue
  }
};

export const formatNotificationTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  // Format time in 12-hour format
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;

  // Format date
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();

  if (diffHours < 24 && date.getDate() === now.getDate()) {
    // Today
    return `Today, ${timeStr}`;
  } else if (diffDays === 1) {
    // Yesterday
    return `Yesterday, ${timeStr}`;
  } else {
    // Older
    return `${month} ${day}, ${timeStr}`;
  }
};

export const truncateText = (text: string, maxLength: number = 60): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Category-based filtering
export const getUnreadByCategory = (notifications: Notification[], category: 'announcement' | 'vo-notification') =>
  getUnreadNotifications(notifications).filter(n => n.category === category);

export const getUnreadAnnouncementCount = (notifications: Notification[]) =>
  getUnreadByCategory(notifications, 'announcement').length;

export const getUnreadVONotificationCount = (notifications: Notification[]) =>
  getUnreadByCategory(notifications, 'vo-notification').length;

export const getAnnouncementsByReadStatus = (notifications: Notification[], read: boolean) =>
  notifications.filter(n => n.category === 'announcement' && n.read === read && !n.archived);

export const getVONotificationsByReadStatus = (notifications: Notification[], read: boolean) =>
  notifications.filter(n => n.category === 'vo-notification' && n.read === read && !n.archived);
