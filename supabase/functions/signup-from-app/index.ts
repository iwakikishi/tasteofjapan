import { createClient } from 'jsr:@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import 'https://deno.land/x/dotenv/load.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const shopifyAdminAccessToken = Deno.env.get('SHOPIFY_ADMIN_ACCESS_TOKEN') ?? ''
const shopifyShopDomain = Deno.env.get('SHOPIFY_SHOP_DOMAIN') ?? ''

const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req: Request) => {
  try {
    const { id, userId, phone, firstName, lastName, ethnicity, gender, zipcode, deviceToken } = await req.json()

    // Shopify顧客更新
    const shopifyCustomer = await updateShopifyCustomer(id, phone, firstName, lastName, ethnicity, gender, zipcode)

    // Supabase認証情報更新
    await updateSupabaseAuth(userId, phone)

    // Supabaseプロフィール更新
    const profileData = await updateSupabaseProfile(userId, id, firstName, lastName, ethnicity, gender, zipcode, deviceToken)

    // Supabaseポイント更新
    await upsertSupabasePoints(profileData.id)

    // Supabaseポイント更新
    return new Response(JSON.stringify({ success: true, data: { profile: profileData, shopify_customer: shopifyCustomer } }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Customer update error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function updateShopifyCustomer(id: string, phone: string, firstName: string, lastName: string, ethnicity: string, gender: string, zipcode: string) {
  const mutation = `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        customer {
          id
          phone
          firstName
          lastName
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

  async function executeUpdate(includePhone: boolean) {
    const variables = {
      input: {
        id,
        firstName,
        lastName,
        ...(includePhone && phone && { phone }),
        metafields: [
          { namespace: "custom", key: "ethnicity", value: ethnicity, type: "single_line_text_field" },
          { namespace: "custom", key: "gender", value: gender, type: "single_line_text_field" },
          { namespace: "custom", key: "zipcode", value: zipcode, type: "single_line_text_field" }
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

    return await response.json()
  }

  let result = await executeUpdate(true)

  if (result.data.customerUpdate.userErrors.length > 0) {
    const error = result.data.customerUpdate.userErrors[0]
    if (error.message.includes('Phone has already been taken')) {
      console.log('Phone number already taken, retrying without phone update')
      result = await executeUpdate(false)
    } else {
      throw new Error(`Shopify customer update error: ${error.message}`)
    }
  }

  if (result.data.customerUpdate.userErrors.length > 0) {
    throw new Error(`Shopify customer update error: ${result.data.customerUpdate.userErrors[0].message}`)
  }

  return result.data.customerUpdate.customer
}

async function updateSupabaseAuth(userId: string, phone: string) {
  console.log('userId', userId, 'phone', phone)
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { phone: phone }
  )
  if (error) {
    console.error('Supabase auth update error:', error);
    throw error;
  }
  return data;
}

async function updateSupabaseProfile(userId: string,id: string, firstName: string, lastName: string, ethnicity: string, gender: string, zipcode: string, deviceToken: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      first_name: firstName,
      last_name: lastName,
      ethnicity,
      gender,
      zip_code: zipcode,
      points: 1000,
      device_token: deviceToken,
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Supabase profile update error: ${error.message}`)
  }

  return data
}

async function upsertSupabasePoints(id: string) {
  const { data, error } = await supabase
    .from('points')
    .insert({ user_id: id, points: 1000, action: 'ADD', how: 'SIGNUP' })
    .select()

  if (error) {
    throw new Error(`Supabase points update error: ${error.message}`)
  }

  return data
}
  