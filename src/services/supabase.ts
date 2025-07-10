import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Custom storage implementation using SecureStore for sensitive data
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (key.includes('auth-token')) {
      // Use secure store for auth tokens
      return await SecureStore.getItemAsync(key);
    }
    // Use AsyncStorage for non-sensitive data
    return await AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (key.includes('auth-token')) {
      // Use secure store for auth tokens
      await SecureStore.setItemAsync(key, value);
    } else {
      // Use AsyncStorage for non-sensitive data
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (key.includes('auth-token')) {
      // Use secure store for auth tokens
      await SecureStore.deleteItemAsync(key);
    } else {
      // Use AsyncStorage for non-sensitive data
      await AsyncStorage.removeItem(key);
    }
  },
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types (to be generated from Supabase)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location: unknown | null;
          preferences: Record<string, any>;
          referral_code: string;
          referred_by: string | null;
          is_influencer: boolean;
          influencer_data: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location?: unknown | null;
          preferences?: Record<string, any>;
          referral_code?: string;
          referred_by?: string | null;
          is_influencer?: boolean;
          influencer_data?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          phone?: string | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          location?: unknown | null;
          preferences?: Record<string, any>;
          referral_code?: string;
          referred_by?: string | null;
          is_influencer?: boolean;
          influencer_data?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other tables as needed
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}; 