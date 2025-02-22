// Add this comment at the top of the file
// Follow this Supabase Edge Function example:
// https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { stripe } from "../_shared/stripe.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  
  console.log('Received callback:', { 
    code: code?.substring(0, 10), 
    state: state?.substring(0, 10),
    url: url.toString()
  })
  
  if (!code || !state) {
    console.error('Missing parameters:', { code, state })
    return new Response(
      JSON.stringify({ error: 'Missing required parameters' }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    await supabase
      .from('users')
      .update({ stripe_account_id: response.stripe_user_id })
      .eq('id', state)

    console.log('Successfully updated user with Stripe account ID')

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://www.fastvoice.online/dashboard?stripe_connect=success',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    console.error('Error in callback:', error)
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://www.fastvoice.online/dashboard?stripe_connect=error',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      },
    })
  }
}) 