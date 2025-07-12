import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

interface SignUpMetadata {
  fullName?: string;
  username?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: string;
  acceptMarketing?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: SignUpMetadata) => Promise<void>;
  register: (email: string, password: string, metadata?: SignUpMetadata) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ provider: string; url: string } | undefined>;
  signInWithApple: () => Promise<{ provider: string; url: string } | undefined>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, metadata?: SignUpMetadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName,
          username: metadata?.username,
          phone: metadata?.phone,
          gender: metadata?.gender,
          date_of_birth: metadata?.dateOfBirth,
          accept_marketing: metadata?.acceptMarketing,
        },
      },
    });
    if (error) throw error;

    // Create profile after signup
    if (data.user && metadata) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: metadata.username,
          full_name: metadata.fullName,
          phone: metadata.phone,
          gender: metadata.gender,
          date_of_birth: metadata.dateOfBirth ? new Date(metadata.dateOfBirth).toISOString() : null,
          preferences: {
            accept_marketing: metadata.acceptMarketing,
          },
        });
      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'advantage://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error('Google ile giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  const signInWithApple = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'advantage://auth/callback',
        },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw new Error('Apple ile giriş yapılamadı. Lütfen tekrar deneyin.');
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    register: signUp, // Alias for signUp
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithApple,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};