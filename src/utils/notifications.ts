// Notification utility functions for PWA

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  tag?: string;
  requireInteraction?: boolean;
  data?: any;
}

interface Reminder {
  id: number;
  title: string;
  description?: string;
  dateTime: string;
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, options: NotificationOptions = {}) => {
  if (Notification.permission === 'granted') {
    const defaultOptions: NotificationOptions = {
      icon: '/icons/android-chrome-192x192.png',
      badge: '/icons/android-chrome-192x192.png',
      vibrate: [200, 100, 200],
      tag: 'reminder-notification',
      requireInteraction: true,
      ...options
    };

    // Check if service worker is available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Use service worker to show notification
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, defaultOptions);
      });
    } else {
      // Fallback to regular notification
      new Notification(title, defaultOptions);
    }
  }
};

export const scheduleNotification = (reminder: Reminder) => {
  const now = new Date().getTime();
  const reminderTime = new Date(reminder.dateTime).getTime();
  const delay = reminderTime - now;

  if (delay > 0) {
    setTimeout(() => {
      showNotification(reminder.title, {
        body: reminder.description || 'Reminder notification',
        data: { reminderId: reminder.id }
      });
    }, delay);
  }
};

export const checkNotificationSupport = () => {
  return {
    supported: 'Notification' in window,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    serviceWorkerSupported: 'serviceWorker' in navigator
  };
};

