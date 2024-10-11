import { supabase } from '@/lib/supabase-client';

interface ScanTicketsParams {
  ticketId: string;
}

export const scanTickets = async ({
  ticketId,
}: ScanTicketsParams) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication session not found');
    }

    const response = await fetch(
      'https://wtgcaqmwnsdisvxppano.supabase.co/functions/v1/admin-tickets-scan',
      {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('ユーザー登録中にエラーが発生しました:', error);
    return null;
  }
};