import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const shopifyShopDomain = Deno.env.get('SHOPIFY_SHOP_DOMAIN') as string
const shopifyAdminAccessToken = Deno.env.get('SHOPIFY_ADMIN_ACCESS_TOKEN') as string
const SHOPIFY_SECRET = Deno.env.get('SHOPIFY_WEBHOOK_SECRET') as string

if (!supabaseUrl || !supabaseKey || !SHOPIFY_SECRET) {
  console.error('environment variables are not set')
  Deno.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }})
  }

  try {
    console.log('Customer Creation Request Received')
    const signature = req.headers.get('X-Shopify-Hmac-SHA256') || req.headers.get('x-shopify-hmac-sha256')
    const body = await req.text()

    if (!signature) {
      console.log('Signature header is missing')
      return new Response('Signature header is missing', { status: 401 })
    }

    if (!await verifyShopifyWebhook(body, signature)) {
      console.log('Signature mismatch')
      return new Response('Invalid signature', { status: 401 })
    }

    let customer;
    try {
      customer = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { status: 400 });
    }

    console.log('Parsed customer:', JSON.stringify(customer, null, 2));

      // 重複チェック
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('shopify_customer_id', customer.id)
      .single();

    if (existingProfile) {
      console.log('Customer already processed:', customer.id);
      return new Response(JSON.stringify({ success: true, message: 'Customer already processed' }), { status: 200 });
    }

    // ユーザー登録とプロファイル作成
    const { user, error: signUpError } = await signUpUser(customer);
    if (signUpError) {
      return new Response(JSON.stringify({ error: 'Failed to sign up user', details: signUpError.message }), { status: 500 });
    }

    const { error: profileError } = await createUserProfile(user, customer);
    if (profileError) {
      // プロファイル作成に失敗した場合、ユーザーを削除
      await supabase.auth.admin.deleteUser(user.id);
      return new Response(JSON.stringify({ error: 'Failed to create user profile', details: profileError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'An unexpected error occurred', details: error.message }), { status: 500 })
  }
})

async function verifyShopifyWebhook(body: string, signature: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SHOPIFY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );

  const digest = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return signature === digest;
}

async function signUpUser(customer: any) {
  const { data, error } = await supabase.auth.signUp({
    email: customer.email,
    password: generateRandomPassword(),
    ...(customer.phone ? { phone: customer.phone } : {}),
  });

  if (error) {
    console.error('Error signing up user:', error);
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

async function createUserProfile(user: any, customer: any) {

  const noteData = parseCustomerNote(customer.note);
  const updatedShopifyCustomer = await updateShopifyCustomer(customer.admin_graphql_api_id, noteData);

  const { error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: user.id,
      shopify_customer_id: `gid://shopify/Customer/${customer.id}`,
      first_name: customer.first_name,
      last_name: customer.last_name,
      gender: noteData.Gender,
      zip_code: noteData.Zipcode,
      ethnicity: noteData.Ethnicity,
      accepts_marketing: false,
      tax_exempt: customer.tax_exempt,
    });

  if (error) {
    console.error('Error inserting user profile:', error);
  }
  return { error };
}

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}

function parseCustomerNote(note: string): Record<string, string> {
  if (!note) return {};

  const lines = note.split('\n');
  const result: Record<string, string> = {};

  for (const line of lines) {
    const [key, value] = line.split(':').map(part => part.trim());
    if (key && value) {
      result[key] = value;
    }
  }

  return result;
}

async function updateShopifyCustomer(id: string, noteData: Record<string, string>) {
  const mutation = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          metafields(first: 3) {
            edges {
              node {
                id
                namespace
                key
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `

  const variables = {
    input: {
      id,
      metafields: [
        { namespace: "custom", key: "ethnicity", value: noteData.Ethnicity || '', type: "single_line_text_field" },
        { namespace: "custom", key: "gender", value: noteData.Gender || '', type: "single_line_text_field" },
        { namespace: "custom", key: "zipcode", value: noteData.Zipcode || '', type: "single_line_text_field" }
      ]
    }
  }

  const response = await fetch(`https://${shopifyShopDomain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': shopifyAdminAccessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: mutation, variables })
  })

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`)
  }

  const result = await response.json()

  if (result.data.customerUpdate.userErrors.length > 0) {
    throw new Error(`Shopify customer update error: ${result.data.customerUpdate.userErrors[0].message}`)
  }

  console.log('Shopify customer updated:', result.data.customerUpdate.customer)
  return result.data.customerUpdate.customer
}
