import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Notification } from '../types';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchNotifications: async () => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const unreadCount = data.filter(notification => !notification.read).length;
      
      set({ 
        notifications: data as Notification[],
        unreadCount,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Update local state
      const updatedNotifications = get().notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(notification => !notification.read).length;
      
      set({ 
        notifications: updatedNotifications,
        unreadCount,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  markAllAsRead: async () => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (error) throw error;
      
      // Update local state
      const updatedNotifications = get().notifications.map(notification => 
        ({ ...notification, read: true })
      );
      
      set({ 
        notifications: updatedNotifications,
        unreadCount: 0,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  subscribeToNotifications: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          const { new: newRecord, eventType } = payload;
          
          if (eventType === 'INSERT') {
            set(state => {
              const newNotification = newRecord as Notification;
              return { 
                notifications: [newNotification, ...state.notifications],
                unreadCount: state.unreadCount + (newNotification.read ? 0 : 1)
              };
            });
          } else if (eventType === 'UPDATE') {
            set(state => {
              const updatedNotifications = state.notifications.map(notification => 
                notification.id === newRecord.id ? newRecord as Notification : notification
              );
              
              const unreadCount = updatedNotifications.filter(notification => !notification.read).length;
              
              return {
                notifications: updatedNotifications,
                unreadCount
              };
            });
          }
        }
      )
      .subscribe();
  },

  unsubscribeFromNotifications: () => {
    // Fix: Use removeAllChannels instead of trying to remove a specific channel
    supabase.removeAllChannels();
  }
}));