import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const SHOPIFY_SECRET = Deno.env.get('SHOPIFY_WEBHOOK_SECRET') as string

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }})
  }

  try {
    console.log('Order webhook received')
    
    const signature = req.headers.get('X-Shopify-Hmac-SHA256') || req.headers.get('x-shopify-hmac-sha256')
    const body = await req.text()
    const topic = req.headers.get('X-Shopify-Topic')

    if (!signature) {
      console.log('Signature header is missing')
      return new Response('Signature header is missing', { status: 401 })
    }

    if (!await verifyShopifyWebhook(body, signature)) {
      console.log('Signature mismatch')
      return new Response('Invalid signature', { status: 401 })
    }

    let order;
    try {
      order = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), { status: 400 });
    }

    console.log('Parsed order:', JSON.stringify(order, null, 2));

    if (!order || !order.id) {
      console.error('Valid order object not found');
      return new Response(JSON.stringify({ error: 'Valid order object not found in request body' }), { status: 400 });
    }

    const userId = await fetchUserProfileId(order.customer.id)
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const orderData = {
      user_id: userId,
      admin_graphql_api_id: order.admin_graphql_api_id,
      buyer_accepts_marketing: order.buyer_accepts_marketing,
      cancel_reason: order.cancel_reason,
      cancelled_at: order.cancelled_at,
      financial_status: order.financial_status,
      fulfillment_status: order.fulfillment_status,
      payment_gateway_names: order.payment_gateway_names,
      phone: order.phone,
      source_name: order.source_name,
      tax_lines: order.tax_lines,
      total_shipping_price_set: order.total_shipping_price_set,
      tags: order.tags,
      test: order.test,
      shopify_order_id: order.id,
      contact_email: order.contact_email,
      shopify_checkout_id: order.checkout_id,
      confirmation_number: order.confirmation_number,
      confirmed: order.confirmed ?? null,
      subtotal_price: order.subtotal_price,
      total_discounts: order.total_discounts,
      total_price: order.total_price,
      total_tax: order.total_tax,
      total_line_items_price: order.total_line_items_price,
      currency: order.currency,
      order_created_at: order.created_at,
      customer_locale: order.customer_locale,
      order_number: order.order_number,
      order_status_url: order.order_status_url,
      order_processed_at: order.processed_at,
      tax_exempt: order.tax_exempt,
      taxes_included: order.taxes_included,
      total_outstanding: order.total_outstanding,
      total_tip_received: order.total_tip_received,
      total_weight: order.total_weight,
      order_updated_at: order.updated_at,
      billing_address: order.billing_address,
      customer: order.customer,
      line_items: order.line_items,
    }

    let orderId: string;

    switch (topic) {
      case 'orders/create':
        console.log('Processing order creation');
        const { data: insertData, error: insertError } = await supabase
          .from('orders')
          .insert(orderData)
          .select('id')
      
        if (insertError) {
          console.error('Error occurred while inserting order:', insertError)
          return new Response(JSON.stringify({ error: 'Failed to insert order record', details: insertError.message }), { status: 500 })
        }
      
        orderId = insertData?.[0]?.id
        console.log('Inserted new order')
        break;

      case 'orders/updated':
        console.log('Processing order update');
        const { data: updateData, error: updateError } = await supabase
          .from('orders')
          .upsert(orderData)
          .eq('shopify_order_id', order.id)
          .select('id')
        
        if (updateError) {
          console.error('Error occurred while updating order:', updateError)
          return new Response(JSON.stringify({ error: 'Failed to update order record', details: updateError.message }), { status: 500 })
        }
        console.log('Updated existing order:', updateData)
        orderId = updateData?.[0]?.id
        break;

      default:
        console.log('Unhandled topic:', topic);
        return new Response(JSON.stringify({ error: 'Unhandled webhook topic' }), { status: 400 });
    }

    console.log('Order ID:', orderId)

    if (!orderId) {
      console.error('Failed to retrieve order ID')
      return new Response(JSON.stringify({ error: 'Failed to retrieve order ID' }), { status: 500 })
    }

    const shopifyOrderId = order.id;
    const orderNumber = order.order_number;
    const checkoutId = order.checkout_id;

    try {
      console.log('Starting upsertTickets function');
      console.log('Received parameters:', { lineItems: order.line_items.length, shopifyOrderId, orderNumber, userId, orderId, checkoutId });
      await upsertTickets(order.line_items, shopifyOrderId, orderNumber, userId, orderId, checkoutId);
      console.log('Order processing and ticket registration completed successfully');
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error('Error occurred while upserting tickets:', error);
      return new Response(JSON.stringify({ error: 'Failed to upsert tickets', details: error.message }), { status: 500 });
    }
    
  } catch (error) {
    console.error('Unexpected error occurred:', error)
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

async function fetchUserProfileId(shopify_customer_id: string): Promise<string | null> {
  const { data: user, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('shopify_customer_id', `gid://shopify/Customer/${shopify_customer_id}`)
    .single()

  if (error) {
    console.error('Failed to fetch user:', error)
    return null
  }
  return user.id
}

async function upsertTickets(lineItems: any[], shopifyOrderId: string, orderNumber: string, userId: string, orderId: string, checkoutId: string) {
  console.log('Starting upsertTickets function');
  console.log('Received parameters:', { lineItems: lineItems.length, shopifyOrderId, orderNumber, userId });

  const filterItemsByProductId = (items: any[], productIds: number[]) => 
    items.filter((item: any) => 
      productIds.includes(Number(item.product_id))
    );
  
  console.log('Line items:', lineItems)

  const admissionItems = filterItemsByProductId(lineItems, [8059502919855,8059503968431]);
  const yokochoItems = filterItemsByProductId(lineItems, [8060162113711,8060164473007]);
  const goodieBagItems = filterItemsByProductId(lineItems, [8060162146479,8060164276399]);

  console.log('Filtered items:', {
    admissionItems: admissionItems.length,
    yokochoItems: yokochoItems.length,
    goodieBagItems: goodieBagItems.length
  });

  const createTickets = (items: any[], category: string) => 
  items.flatMap((item: any) => 
    Array(item.quantity).fill({
      user_id: userId,
      shopify_order_id: shopifyOrderId,
      order_id: orderId,
      order_number: orderNumber,
      product_id: `gid://shopify/Product/${item.product_id}`,
      variant_id: `gid://shopify/ProductVariant/${item.variant_id}`,
      title: item.title,
      variant_title: item.variant_title,
      event_name: 'ARZ-DEC-2024',
      checkout_id: `gid://shopify/Checkout/${checkoutId}`,
      check_in_status: 'NONE',
      category,
      valid_date: category === 'ADMISSION TICKETS'
        ? (item.variant_title.includes('12/14') ? '2024-12-14' : '2024-12-15')
        : null,
      is_early_bird: item.name.includes('Early Bird') || item.name.includes('EARLY BIRD')
    })
  );

  const allTickets = [
    ...createTickets(admissionItems, 'ADMISSION TICKETS'),
    ...createTickets(yokochoItems, 'YOKOCHO TICKETS'),
    ...createTickets(goodieBagItems, 'GOODIE BAG'),
  ];

  console.log('Total tickets created:', allTickets.length);

  // Check for existing tickets
  console.log('Fetching existing tickets for order:', orderId);
  const { data: existingTickets, error: fetchError } = await supabase
    .from('tickets')
    .select('id, product_id, variant_id')
    .eq('shopify_order_id', shopifyOrderId);

  if (fetchError) {
    console.error('Error occurred while fetching existing tickets:', fetchError);
    throw fetchError;
  }

  console.log('Existing tickets found:', existingTickets?.length || 0);

  const ticketsToInsert = [];
  const ticketsToUpdate = [];

  allTickets.forEach(ticket => {
    const existingTicket = existingTickets?.find(et => 
      et.product_id === ticket.product_id && et.variant_id === ticket.variant_id
    );

    if (existingTicket) {
      ticketsToUpdate.push({ ...ticket, id: existingTicket.id });
    } else {
      ticketsToInsert.push(ticket);
    }
  });

  console.log('Tickets to insert:', ticketsToInsert.length);
  console.log('Tickets to update:', ticketsToUpdate.length);

  // Insert new tickets
  if (ticketsToInsert.length > 0) {
    console.log('Inserting new tickets');
    const { error: insertError } = await supabase
      .from('tickets')
      .insert(ticketsToInsert);

    if (insertError) {
      console.error('Error occurred while inserting new tickets:', insertError);
      throw insertError;
    }
    console.log(`${ticketsToInsert.length} new tickets inserted successfully`);
  }

  // Update existing tickets
  if (ticketsToUpdate.length > 0) {
    console.log('Updating existing tickets');
    const { error: updateError } = await supabase
      .from('tickets')
      .update(ticketsToUpdate);

    if (updateError) {
      console.error('Error occurred while updating existing tickets:', updateError);
      throw updateError;
    }
    console.log(`${ticketsToUpdate.length} existing tickets updated successfully`);
  }

  console.log(`Total ${allTickets.length} tickets processed successfully`);
}