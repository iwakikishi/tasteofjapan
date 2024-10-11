import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  shopifyCustomerId: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  deviceToken?: string;
  points?: number;
  isAdmin?: boolean;
  hasTickets?: boolean;
  ticketDates?: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signOut: () => Promise<void>;
}

interface Ticket {
  id: string;
  valid_date: string;
}

interface ValidDates {
  valid_dates: string[];
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
    router.push('/(tabs)/(tab1)');
  };

  const getUserProfile = async (id: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id,first_name,last_name,device_token,points,shopify_customer_id,is_admin')
      .eq('user_id', id)
      .single();
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  };

  const checkIfUserHasTickets = async (userProfileId: string) => {
    const { data, error } = await supabase.from('tickets').select('id,valid_date').eq('user_id', userProfileId).eq('category', 'ADMISSION TICKETS');
    if (error) {
      console.error('Error fetching user tickets:', error);
      return false;
    }
    if (data.length > 0) {
      console.log('User has tickets:', true);
      const validDates: string[] = Array.from(new Set(data.map((ticket: Ticket) => ticket.valid_date)));
      return {
        hasTickets: true,
        valid_dates: validDates,
      };
    }
    console.log('User has tickets:', false);
    return false;
  };

  useEffect(() => {
    const handleAuthStateChange = async (event: string, session: Session | null) => {
      if (event === 'INITIAL_SESSION') {
        console.log('INITIAL_SESSION', session?.user.id);
        if (session?.user.id && !user) {
          console.log('Running getUserProfile');
          const userProfile = await getUserProfile(session.user.id);
          const ticketStatus: { hasTickets: boolean; valid_dates: string[] } | false = await checkIfUserHasTickets(userProfile?.id ?? '');
          setUser({
            id: userProfile?.id ?? '',
            shopifyCustomerId: userProfile?.shopify_customer_id ?? '',
            phone: session.user.phone ?? '',
            email: session.user.email ?? '',
            firstName: userProfile?.first_name ?? '',
            lastName: userProfile?.last_name ?? '',
            deviceToken: userProfile?.device_token ?? '',
            points: userProfile?.points ?? null,
            isAdmin: userProfile?.is_admin ?? false,
            hasTickets: ticketStatus && 'hasTickets' in ticketStatus ? ticketStatus.hasTickets : false,
            ticketDates: ticketStatus && 'valid_dates' in ticketStatus ? ticketStatus.valid_dates : [],
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
