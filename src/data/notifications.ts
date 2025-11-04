export interface Notification {
  id: string;
  type: 'vo-expiring' | 'vo-expired' | 'vo-completed' | 'vo-assigned';
  urgency: 'high' | 'medium' | 'info';
  patientName: string;
  voNumber: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
}

// Helper to create dates relative to now
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const sampleNotifications: Notification[] = [
  // Unread notifications
  {
    id: '1',
    type: 'vo-expiring',
    urgency: 'medium',
    patientName: 'Maria Schmidt',
    voNumber: '4529-4',
    message: 'VO 4529-4 is expiring in 7 days due to 0 documented treatments, please document your first treatment to avoid expiry',
    timestamp: hoursAgo(2),
    read: false,
    archived: false,
  },
  {
    id: '2',
    type: 'vo-expired',
    urgency: 'high',
    patientName: 'Hans Müller',
    voNumber: '4748-2',
    message: 'VO 4748-2 has expired and VO status was set to Abgelaufen',
    timestamp: hoursAgo(5),
    read: false,
    archived: false,
  },
  {
    id: '3',
    type: 'vo-assigned',
    urgency: 'info',
    patientName: 'Anna Weber',
    voNumber: '4850-1',
    message: 'You have a new VO 4850-1 assigned to you for patient Anna Weber',
    timestamp: hoursAgo(8),
    read: false,
    archived: false,
  },

  // Read notifications (recent)
  {
    id: '4',
    type: 'vo-completed',
    urgency: 'info',
    patientName: 'Christel Brandt',
    voNumber: '4346-4',
    message: 'VO 4346-4 had all treatments completed and VO status was changed to Fertig Behandelt',
    timestamp: daysAgo(1),
    read: true,
    archived: false,
  },
  {
    id: '5',
    type: 'vo-assigned',
    urgency: 'info',
    patientName: 'Verena Baier',
    voNumber: '4325-3',
    message: 'You have a new VO 4325-3 assigned to you for patient Verena Baier',
    timestamp: daysAgo(2),
    read: true,
    archived: false,
  },
  {
    id: '6',
    type: 'vo-expiring',
    urgency: 'medium',
    patientName: 'Irmgard Bubert',
    voNumber: '4339-3',
    message: 'VO 4339-3 is expiring in 5 days due to 2 documented treatments out of 6 prescribed, please continue documentation',
    timestamp: daysAgo(3),
    read: true,
    archived: false,
  },

  // Archived notifications
  {
    id: '7',
    type: 'vo-completed',
    urgency: 'info',
    patientName: 'Ingrid Dretzko',
    voNumber: '4239-3',
    message: 'VO 4239-3 had all treatments completed and VO status was changed to Fertig Behandelt',
    timestamp: daysAgo(10),
    read: true,
    archived: true,
  },
  {
    id: '8',
    type: 'vo-assigned',
    urgency: 'info',
    patientName: 'Rosemarie Eberle',
    voNumber: '4145-2',
    message: 'You have a new VO 4145-2 assigned to you for patient Rosemarie Eberle',
    timestamp: daysAgo(12),
    read: true,
    archived: true,
  },
  {
    id: '9',
    type: 'vo-expired',
    urgency: 'high',
    patientName: 'Klaus Fischer',
    voNumber: '4050-5',
    message: 'VO 4050-5 has expired and VO status was set to Abgelaufen',
    timestamp: daysAgo(15),
    read: true,
    archived: true,
  },
  {
    id: '10',
    type: 'vo-expiring',
    urgency: 'medium',
    patientName: 'Petra Hoffmann',
    voNumber: '3985-1',
    message: 'VO 3985-1 is expiring in 7 days due to 0 documented treatments, please document your first treatment to avoid expiry',
    timestamp: daysAgo(18),
    read: true,
    archived: true,
  },
  {
    id: '11',
    type: 'vo-completed',
    urgency: 'info',
    patientName: 'Michael Becker',
    voNumber: '3890-4',
    message: 'VO 3890-4 had all treatments completed and VO status was changed to Fertig Behandelt',
    timestamp: daysAgo(20),
    read: true,
    archived: true,
  },
];

// Helper functions for filtering
export const getUnreadNotifications = (notifications: Notification[]) =>
  notifications.filter(n => !n.read && !n.archived);

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
