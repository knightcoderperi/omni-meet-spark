
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'admin' | 'moderator' | 'participant';
  phone_verified: boolean;
  email_verified: boolean;
  last_login: string | null;
  timezone: string;
}

interface SecurityStatus {
  locked: boolean;
  attempts: number;
  lockout_until?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  securityStatus: SecurityStatus | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSecurityStatus: (email: string) => Promise<SecurityStatus>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
          // Reset security status on successful login
          if (event === 'SIGNED_IN') {
            await resetFailedAttempts(session.user.email!);
            setSecurityStatus(null);
          }
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSecurityStatus = async (email: string): Promise<SecurityStatus> => {
    try {
      const { data, error } = await supabase.rpc('handle_failed_login', {
        user_email: email
      });

      if (error) throw error;
      
      // Properly cast the JSON response to SecurityStatus
      const status = data as unknown as SecurityStatus;
      
      // Validate that we have the expected structure
      if (typeof status === 'object' && status !== null && 
          'locked' in status && 'attempts' in status) {
        setSecurityStatus(status);
        return status;
      } else {
        // Fallback if the response doesn't match expected structure
        const fallbackStatus: SecurityStatus = { locked: false, attempts: 0 };
        setSecurityStatus(fallbackStatus);
        return fallbackStatus;
      }
    } catch (error) {
      console.error('Error checking security status:', error);
      const fallbackStatus: SecurityStatus = { locked: false, attempts: 0 };
      setSecurityStatus(fallbackStatus);
      return fallbackStatus;
    }
  };

  const resetFailedAttempts = async (email: string) => {
    try {
      await supabase.rpc('reset_failed_attempts', {
        user_email: email
      });
    } catch (error) {
      console.error('Error resetting failed attempts:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    // Check if account is locked before attempting login
    const status = await checkSecurityStatus(email);
    if (status.locked) {
      const lockoutTime = status.lockout_until ? new Date(status.lockout_until) : null;
      const timeLeft = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / 1000 / 60) : 0;
      throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${timeLeft} minutes.`);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Track failed login attempt
      await checkSecurityStatus(email);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: redirectUrl
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSecurityStatus(null);
  };

  const value = {
    user,
    profile,
    loading,
    securityStatus,
    signIn,
    signUp,
    signOut,
    checkSecurityStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
