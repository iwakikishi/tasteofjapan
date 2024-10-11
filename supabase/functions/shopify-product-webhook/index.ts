import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const handleProduct = async (product: any, action: 'insert' | 'update') => {
  const productData = {
    admin_graphql_api_id: product.admin_graphql_api_id,
    body_html: product.body_html,
    handle: product.handle,
    shopify_id: product.id,
    product_type: product.product_type,
    published_at: product.published_at,
    template_suffix: product.template_suffix,
    title: product.title,
    updated_at: product.updated_at,
    vendor: product.vendor,
    status: product.status,
    published_scope: product.published_scope,
    tags: product.tags,
    variants: product.variants,
    options: product.options,
    images: product.images,
    image: product.image,
    media: product.media,
    variant_gids: product.variant_gids,
    has_variants_that_requires_components: product.has_variants_that_requires_components,
    category: product.category
  }

  console.log('Product:', JSON.stringify(product, null, 2))
  console.log('Processing product:', product.id)

  // 既存の商品を検索
  const { data: existingProduct, error: searchError } = await supabase
    .from('products')
    .select('shopify_id')
    .eq('shopify_id', product.id)
    .single()

  if (searchError && searchError.code !== 'PGRST116') {
    console.error('商品の検索中にエラーが発生しました:', searchError)
    return
  }

  let result;

  if (existingProduct) {
    console.log('Existing product found, updating...')
    result = await supabase
      .from('products')
      .update(productData)
      .eq('shopify_id', product.id)
    
  } else {
    console.log('Product not found, inserting new record...')
    result = await supabase
      .from('products')
      .insert(productData)
  }

  if (result.error) {
    console.error(`Error ${action}ing product:`, result.error)
  } else {
    console.log(`Product ${action}d successfully:`, result)
  }
}

serve(async (req) => {
  const { headers, method } = req

  // Shopify webhookの検証
  const hmac = headers.get('x-shopify-hmac-sha256')
  const topic = headers.get('x-shopify-topic')
  const shopDomain = headers.get('x-shopify-shop-domain')

  // HMACの検証ロジックを実装する必要があります

  if (method === 'POST') {
    const body = await req.json()

    switch (topic) {
      case 'products/create':
        await handleProduct(body, 'insert')
        break
      case 'products/update':
        await handleProduct(body, 'update')
        break
      default:
        console.log(`Unhandled topic: ${topic}`)
    }
  }

  return new Response('Webhook processed', { status: 200 })
})