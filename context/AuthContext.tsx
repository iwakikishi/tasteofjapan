import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  deviceToken?: string;
  points?: number;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const getUserProfile = async (id: string) => {
    const { data, error } = await supabase.from('user_profile').select('first_name,last_name,device_token,points').eq('user_id', id).single();
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (event === 'INITIAL_SESSION') {
        console.log('INITIAL_SESSION', session?.user.id);
        if (session?.user.id && !user) {
          console.log('Running getUserProfile');
          const userProfile = await getUserProfile(session.user.id);
          setUser({
            id: session.user.id,
            phone: session.user.phone ?? undefined,
            email: session.user.email ?? undefined,
            firstName: userProfile?.first_name ?? undefined,
            lastName: userProfile?.last_name ?? undefined,
            deviceToken: userProfile?.device_token ?? undefined,
            points: userProfile?.points ?? undefined,
          });
        }
      } else if (event === 'SIGNED_IN') {
        console.log('SIGNED_IN');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SESSION_CHANGED') {
        console.log('SESSION_CHANGED', session);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user, setUser, signOut }}>{children}</AuthContext.Provider>;
};
