import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { EmergencyAlert, UserLocation, BloodRequest } from '../types';
import { useAuthStore } from './authStore';
import { useLocationStore } from './locationStore';

interface EmergencyState {
  activeAlert: EmergencyAlert | null;
  activeBloodRequest: BloodRequest | null;
  alerts: EmergencyAlert[];
  bloodRequests: BloodRequest[];
  loading: boolean;
  error: string | null;
  createAlert: (type: EmergencyAlert['type'], description?: string) => Promise<void>;
  updateAlertStatus: (alertId: string, status: EmergencyAlert['status']) => Promise<void>;
  createBloodRequest: (request: Partial<BloodRequest>) => Promise<void>;
  updateBloodRequest: (requestId: string, updates: Partial<BloodRequest>) => Promise<void>;
  fetchUserAlerts: () => Promise<void>;
  fetchNearbyBloodRequests: () => Promise<void>;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

export const useEmergencyStore = create<EmergencyState>((set, get) => ({
  activeAlert: null,
  activeBloodRequest: null,
  alerts: [],
  bloodRequests: [],
  loading: false,
  error: null,

  createAlert: async (type, description) => {
    const user = useAuthStore.getState().user;
    const location = useLocationStore.getState().currentLocation;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    if (!location) {
      set({ error: 'Location not available' });
      return;
    }

    try {
      set({ loading: true, error: null });
      
      const newAlert: Partial<EmergencyAlert> = {
        user_id: user.id,
        type,
        status: 'active',
        location,
        description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .insert(newAlert)
        .select()
        .single();
        
      if (error) throw error;
      
      set({ 
        activeAlert: data as EmergencyAlert,
        alerts: [data as EmergencyAlert, ...get().alerts],
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateAlertStatus: async (alertId, status) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('emergency_alerts')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', alertId);
        
      if (error) throw error;
      
      // Update local state
      const updatedAlerts = get().alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, status, updated_at: new Date().toISOString() } 
          : alert
      );
      
      const activeAlert = get().activeAlert;
      
      set({ 
        alerts: updatedAlerts,
        activeAlert: activeAlert?.id === alertId 
          ? { ...activeAlert, status, updated_at: new Date().toISOString() } 
          : activeAlert,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createBloodRequest: async (request) => {
    const user = useAuthStore.getState().user;
    const location = useLocationStore.getState().currentLocation;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }
    
    if (!location) {
      set({ error: 'Location not available' });
      return;
    }

    try {
      set({ loading: true, error: null });
      
      // Calculate expiration date (default 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const newRequest: Partial<BloodRequest> = {
        requester_id: user.id,
        blood_type: request.blood_type,
        units_needed: request.units_needed || 1,
        hospital_name: request.hospital_name,
        urgency: request.urgency || 'medium',
        status: 'active',
        location,
        description: request.description,
        created_at: new Date().toISOString(),
        expires_at: request.expires_at || expiresAt.toISOString()
      };
      
      const { data, error } = await supabase
        .from('blood_requests')
        .insert(newRequest)
        .select()
        .single();
        
      if (error) throw error;
      
      set({ 
        activeBloodRequest: data as BloodRequest,
        bloodRequests: [data as BloodRequest, ...get().bloodRequests],
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateBloodRequest: async (requestId, updates) => {
    try {
      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('blood_requests')
        .update(updates)
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Update local state
      const updatedRequests = get().bloodRequests.map(request => 
        request.id === requestId 
          ? { ...request, ...updates } 
          : request
      );
      
      const activeRequest = get().activeBloodRequest;
      
      set({ 
        bloodRequests: updatedRequests,
        activeBloodRequest: activeRequest?.id === requestId 
          ? { ...activeRequest, ...updates } 
          : activeRequest,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUserAlerts: async () => {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ error: 'User not authenticated' });
      return;
    }

    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Check if there's an active alert
      const activeAlert = data.find(alert => alert.status === 'active');
      
      set({ 
        alerts: data as EmergencyAlert[],
        activeAlert: activeAlert as EmergencyAlert || null,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchNearbyBloodRequests: async () => {
    const location = useLocationStore.getState().currentLocation;
    
    if (!location) {
      set({ error: 'Location not available' });
      return;
    }

    try {
      set({ loading: true, error: null });
      
      // Check if blood_requests table exists before querying
      const { error: tableCheckError } = await supabase
        .from('blood_requests')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      // If table doesn't exist, just return empty array
      if (tableCheckError && tableCheckError.code === '42P01') {
        set({ 
          bloodRequests: [],
          loading: false 
        });
        return;
      }
      
      // In a real app, we would use PostGIS or a similar spatial database
      // For now, we'll just fetch recent active requests
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      set({ 
        bloodRequests: data as BloodRequest[],
        loading: false 
      });
    } catch (error: any) {
      // Handle error gracefully
      console.error('Error fetching blood requests:', error);
      set({ 
        bloodRequests: [],
        loading: false,
        error: error.message
      });
    }
  },

  subscribeToUpdates: () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Subscribe to emergency alerts updates
    supabase
      .channel('emergency_alerts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'emergency_alerts',
          filter: `user_id=eq.${user.id}`
        }, 
        (payload) => {
          const { new: newRecord, eventType } = payload;
          
          if (eventType === 'INSERT') {
            set(state => ({ 
              alerts: [newRecord as EmergencyAlert, ...state.alerts] 
            }));
          } else if (eventType === 'UPDATE') {
            set(state => ({
              alerts: state.alerts.map(alert => 
                alert.id === newRecord.id ? newRecord as EmergencyAlert : alert
              ),
              activeAlert: state.activeAlert?.id === newRecord.id 
                ? newRecord as EmergencyAlert 
                : state.activeAlert
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to blood requests updates if table exists
    try {
      supabase
        .channel('blood_requests_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'blood_requests',
            filter: `status=eq.active`
          }, 
          (payload) => {
            const { new: newRecord, old: oldRecord, eventType } = payload;
            
            if (eventType === 'INSERT') {
              set(state => ({ 
                bloodRequests: [newRecord as BloodRequest, ...state.bloodRequests] 
              }));
            } else if (eventType === 'UPDATE') {
              set(state => ({
                bloodRequests: state.bloodRequests.map(request => 
                  request.id === newRecord.id ? newRecord as BloodRequest : request
                ),
                activeBloodRequest: state.activeBloodRequest?.id === newRecord.id 
                  ? newRecord as BloodRequest 
                  : state.activeBloodRequest
              }));
            } else if (eventType === 'DELETE') {
              set(state => ({
                bloodRequests: state.bloodRequests.filter(request => 
                  request.id !== oldRecord.id
                ),
                activeBloodRequest: state.activeBloodRequest?.id === oldRecord.id 
                  ? null 
                  : state.activeBloodRequest
              }));
            }
          }
        )
        .subscribe();
    } catch (error) {
      console.error('Error subscribing to blood requests:', error);
    }
  },

  unsubscribeFromUpdates: () => {
    // Fix: Use removeAllChannels instead of trying to remove specific channels
    supabase.removeAllChannels();
  }
}));