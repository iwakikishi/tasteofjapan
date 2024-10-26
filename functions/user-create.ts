import { supabase } from '@/lib/supabase-client';
import { useMutation } from '@apollo/client';
import { CREATE_CUSTOMER } from '@/graphql/mutations';

interface CreateCustomerParams {
  email: string;
  password: string;
  acceptsMarketing: boolean;
}

export const useCreateUser = () => {
  const [createCustomer] = useMutation(CREATE_CUSTOMER);

  const createUser = async ({
    email,
    password,
    acceptsMarketing
  }: CreateCustomerParams) => {
    try {
      // 1. Supabaseでユーザーを作成（OTPを送信）
      const { data: supabaseData, error: supabaseError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (supabaseError) {
        throw new Error(`Woops, ${supabaseError.message}`);
      }

      const supabaseUserId = supabaseData.user?.id;
      if (!supabaseUserId) {
        throw new Error('Failed to retrieve user ID');
      }

      // 2. Shopifyで顧客を作成
      const { data } = await createCustomer({
        variables: { input: { email, password, acceptsMarketing } }
      });

      if (data.customerCreate.customerUserErrors.length > 0) {
        // const { data: { session } } = await supabase.auth.getSession();
        // if (!session) {
        //   throw new Error('Current session not found');
        // }
        // const response = await fetch(
        //   'https://wtgcaqmwnsdisvxppano.supabase.co/functions/v1/supabase-user-deletion',
        //   {
        //     method: 'POST', 
        //     headers: {
        //       'Authorization': `Bearer ${session.access_token}`,
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       supabaseUserId,
        //     }),
        //   }
        // );

        // const data = await response.json();
        // return data;
        throw new Error(`Error: You have already signed up with this email address on our website.`);
        
      }

      const shopifyCustomerId = data.customerCreate.customer.id;

      // 3. user_profilesテーブルに情報を追加
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: supabaseUserId,
          shopify_customer_id: shopifyCustomerId,
          accepts_marketing: acceptsMarketing,
          points: 3000,
          is_admin: false,
          has_received_signup_bonus: true,
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Supabase Profile Error: ${profileError.message}`);
      }

      return {
        shopifyCustomer: data.customerCreate.customer,
        supabaseUserId: supabaseUserId,
      };

    } catch (error) {
      console.error('User creation error:', error);
      throw error;
    }
  };

  return { createUser };
}

export const useVerifyOtp = () => {
  const verifyOtp = async ({ email, otp }: { email: string; otp: string }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email'
    });

    if (error) {
      throw new Error(`Supabase Error: ${error.message}`);
    }

    return data;
  }

  return { verifyOtp };
}