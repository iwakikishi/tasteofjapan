import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers });
  }

  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Contact Form <info@tasteofjpn.com>',
        to: 'info@tasteofjpn.com',
        subject: 'New Contact Form Submission',
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong> ${message}</p>
        `,
      }),
    })

    if (!res.ok) {
      const errorData = await res.text()
      console.error('Resend API error:', errorData)
      throw new Error(`Resend API error: ${res.status} ${errorData}`)
    }

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { 
      status: 500, 
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
})