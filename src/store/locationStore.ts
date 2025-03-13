import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { UserLocation } from '../types';
import { useAuthStore } from './authStore';

interface LocationState {
  currentLocation: UserLocation | null;
  trackingEnabled: boolean;
  watchId: number | null;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  updateLocation: (location: UserLocation) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  currentLocation: null,
  trackingEnabled: false,
  watchId: null,
  error: null,

  startTracking: () => {
    if (!navigator.geolocation) {
      set({ error: 'Geolocation is not supported by your browser' });
      return;
    }

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          
          set({ currentLocation: newLocation, error: null });
          get().updateLocation(newLocation);
        },
        (error) => {
          set({ error: `Geolocation error: ${error.message}` });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000,
        }
      );

      set({ watchId, trackingEnabled: true });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  stopTracking: () => {
    const { watchId } = get();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      set({ watchId: null, trackingEnabled: false });
    }
  },

  updateLocation: async (location: UserLocation) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // Update user's location in the database
      const { error } = await supabase
        .from('user_locations')
        .upsert({
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp
        });

      if (error) throw error;
    } catch (error: any) {
      set({ error: `Failed to update location: ${error.message}` });
    }
  }
}));