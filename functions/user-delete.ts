import { supabase } from '@/lib/supabase-client';
interface DeleteUserParams {
  userId: string;
  // session: Session;
}

export const deleteUser = async ({
  userId,
}: DeleteUserParams) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Current session not found');
    }

    const response = await fetch(
      'https://wtgcaqmwnsdisvxppano.supabase.co/functions/v1/user-deletion',
      {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    return null;
  }
};