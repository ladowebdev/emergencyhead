import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  error: null,

  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      set({ 
        session: data.session,
        loading: false
      });
      
      await get().refreshUser();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signUp: async (email, password, userData) => {
    try {
      set({ loading: true, error: null });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: userData.full_name,
            phone: userData.phone,
            blood_type: userData.blood_type,
            is_donor: userData.is_donor || false,
          });

        if (profileError) throw profileError;
      }

      set({ 
        session: data.session,
        loading: false
      });
      
      await get().refreshUser();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateProfile: async (userData) => {
    try {
      const { user } = get();
      if (!user) throw new Error('User not authenticated');

      set({ loading: true, error: null });
      
      const { error } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id);

      if (error) throw error;
      
      await get().refreshUser();
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  refreshUser: async () => {
    try {
      set({ loading: true, error: null });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        set({ user: null, session: null, loading: false });
        return;
      }

      // Fix: Use auth.uid() in the filter instead of id column
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid 406 errors

      if (error && error.code !== 'PGRST116') {
        // Only throw if it's not the "no rows returned" error
        throw error;
      }

      set({ 
        user: userData as User,
        session,
        loading: false
      });
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      set({ error: error.message, loading: false });
    }
  }
}));