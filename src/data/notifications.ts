export interface Notification {
  id: string;
  type: 'new-vo-assigned' | 'vo-shared' | 'shared-therapist-removed' | 'patient-transferred' | 'vo-completed' | 'vo-expired' | 'vo-terminated' | 'vo-expiring-soon';
  urgency: 'high' | 'medium' | 'info';
  patientName: string;
  patientId: string;
  voNumber: string;
  voId?: string;
  targetTab: 'my-vos' | 'shared-vos';
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
}

// Helper to create dates relative to now
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const sampleNotifications: Notification[] = [
  // Unread notifications - 8 scenarios
  {
    id: '1',
    type: 'new-vo-assigned',
    urgency: 'info',
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
  {
    id: '2',
    type: 'vo-shared',
    urgency: 'info',
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
    type: 'shared-therapist-removed',
    urgency: 'info',
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
    type: 'patient-transferred',
    urgency: 'info',
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
    type: 'vo-completed',
    urgency: 'info',
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
    type: 'vo-expired',
    urgency: 'high',
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
    type: 'vo-terminated',
    urgency: 'medium',
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
    type: 'vo-expiring-soon',
    urgency: 'medium',
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
    id: '9',
    type: 'new-vo-assigned',
    urgency: 'info',
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
    type: 'vo-completed',
    urgency: 'info',
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
    type: 'vo-expiring-soon',
    urgency: 'medium',
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
    type: 'vo-completed',
    urgency: 'info',
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
    type: 'new-vo-assigned',
    urgency: 'info',
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
