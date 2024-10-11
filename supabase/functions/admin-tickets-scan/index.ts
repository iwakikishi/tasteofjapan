import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  try {
    const { ticketId } = await req.json()

    const { data, error } = await supabase
      .from('tickets')
      .select('id, check_in_status')
      .eq('id', ticketId)
      .single()

    if (error) throw error

    if (!data) {
      return new Response(JSON.stringify({ status: 'Error', message: 'Ticket not found' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 404
      })
    }

    if (data.check_in_status === 'NONE') {
      const { error: updateError } = await supabase
        .from('tickets')
        .update({ check_in_status: 'USED', check_in_time: new Date().toISOString() })
        .eq('id', ticketId)

      if (updateError) throw updateError

      return new Response(JSON.stringify({ status: 'Success', message: 'Check-in completed' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    } else {
      return new Response(JSON.stringify({ status: 'Warning', message: 'Already checked-in' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      })
    }
  } catch (error) {
    return new Response(JSON.stringify({ status: 'エラー', message: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
