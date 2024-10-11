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
    const { customerId } = await req.json()

    // Shopify顧客の注文を取得
    const customerOrders = await getShopifyCustomerOrders(customerId)

    return new Response(JSON.stringify({ success: true, data: { orders: customerOrders } }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Customer orders fetch error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})

async function getShopifyCustomerOrders(customerId: string, first: number = 10) {
  const query = `
    query getCustomerOrders($customerId: ID!, $first: Int!) {
      customer(id: $customerId) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 100) {
                edges {
                  node {
                    id
                    title
                    variant {
                      id
                      title
                      sku
                      product {
                        id
                        title
                        tags
                        priceRange {
                          minVariantPrice {
                            amount
                            currencyCode
                          }
                        }
                        images(first: 1) {
                          edges {
                            node {
                              url
                              altText
                            }
                          }
                        }
                      }
                    }
                    quantity
                    customAttributes {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `

  const variables = {
    customerId,
    first
  }

  const response = await fetch(`https://${shopifyShopDomain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': shopifyAdminAccessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  })

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`)
  }

  const result = await response.json()

  if (result.errors) {
    throw new Error(`Shopify GraphQL error: ${result.errors[0].message}`)
  }

  return result.data.customer.orders
}