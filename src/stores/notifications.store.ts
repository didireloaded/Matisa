/**
 * Global notification store using Zustand
 * Handles toast notifications across the app
 */

import { create } from 'zustand';
import { Toast } from '@/types';

interface NotificationState {
  notifications: Toast[];
  add: (notification: Omit<Toast, 'id'>) => string;
  remove: (id: string) => void;
  clear: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useNotifications = create<NotificationState>((set) => ({
  notifications: [],

  add: (notification) => {
    const id = generateId();
    const duration = notification.duration ?? 5000;

    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clear: () => set({ notifications: [] }),
}));

/**
 * Helper functions for common notification types
 */
export const notify = {
  success: (message: string, title = 'Success') =>
    useNotifications.getState().add({
      type: 'success',
      title,
      message,
      duration: 5000,
    }),

  error: (message: string, title = 'Error', duration = 7000) =>
    useNotifications.getState().add({
      type: 'error',
      title,
      message,
      duration,
    }),

  info: (message: string, title = 'Info') =>
    useNotifications.getState().add({
      type: 'info',
      title,
      message,
      duration: 5000,
    }),

  warning: (message: string, title = 'Warning') =>
    useNotifications.getState().add({
      type: 'warning',
      title,
      message,
      duration: 6000,
    }),
};
