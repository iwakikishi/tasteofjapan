import { supabase } from '@/lib/supabase-client';

interface UpdateUserParams {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  ethnicity: string;
  gender: string;
  zipcode: string;
  deviceToken: string;
}

export const updateUser = async ({
  id,
  userId,
  firstName,
  lastName,
  phone,
  ethnicity,
  gender,
  zipcode,
  deviceToken
}: UpdateUserParams) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Current session not found');
    }

    const response = await fetch(
      'https://wtgcaqmwnsdisvxppano.supabase.co/functions/v1/signup-from-app',
      {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          userId,
          firstName,
          lastName,
          phone,
          ethnicity,
          gender,
          zipcode,
          deviceToken,
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