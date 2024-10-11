import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const shopifyShopDomain = Deno.env.get('SHOPIFY_SHOP_DOMAIN') ?? ''
const shopifyAdminAccessToken = Deno.env.get('SHOPIFY_ADMIN_ACCESS_TOKEN') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const DELETE_CUSTOMER_MUTATION = `
  mutation DeleteCustomer($input: CustomerDeleteInput!) {
    customerDelete(input: $input) {
      deletedCustomerId
      userErrors {
        field
        message
      }
    }
  }
`;

serve(async (req: Request) => {
  try {
    const { userId } = await req.json()

    // user_profilesテーブルからレコードを取得
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id,shopify_customer_id')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new Error(`Error getting user profile: ${profileError.message}`);
    }

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const shopifyCustomerId = userProfile.shopify_customer_id;

    // user_profilesテーブルからレコードを削除
    const { error: deleteProfileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userProfile.id);

    if (deleteProfileError) {
      throw new Error(`Error deleting user profile: ${deleteProfileError.message}`);
    }

    // Supabaseの認証ユーザーを削除
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw new Error(`Error deleting user: ${deleteError.message}`);
    }

    // ShopifyでGraphQLを使用して顧客を削除
    const shopifyResponse = await fetch(`https://${shopifyShopDomain}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': shopifyAdminAccessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: DELETE_CUSTOMER_MUTATION,
        variables: { 
          input: { id: shopifyCustomerId }
        }
      })
    });

    if (!shopifyResponse.ok) {
      const responseText = await shopifyResponse.text();
      console.error('Shopify API error response:', responseText);
      throw new Error(`Shopify API error: ${shopifyResponse.status} ${shopifyResponse.statusText}`);
    }

    const shopifyData = await shopifyResponse.json();

    if (shopifyData.errors) {
      throw new Error(`Error deleting shopify user: ${JSON.stringify(shopifyData.errors)}`);
    }

    if (shopifyData.data.customerDelete.userErrors.length > 0) {
      throw new Error(`Error deleting shopify user: ${shopifyData.data.customerDelete.userErrors[0].message}`);
    }

    return new Response(
  JSON.stringify({
    message: 'User deleted successfully',
    status: 200,
    success: true
  }),
  {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  }
);
  } catch (error) {
    console.error('User deletion error:', error);
    return new Response(
  JSON.stringify({ 
    error: error instanceof Error ? error.message : String(error),
    status: 400,
    success: false
  }),
  {
    headers: { 'Content-Type': 'application/json' },
    status: 400
  }
);
  }
})