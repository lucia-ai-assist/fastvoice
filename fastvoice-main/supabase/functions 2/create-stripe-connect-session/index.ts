
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import Stripe from 'https://esm.sh/stripe@14.18.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { accessToken } = await req.json()
    if (!accessToken) {
      throw new Error('Access token is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const connectAccountURL = "https://connect.stripe.com/oauth/authorize" +
      "?redirect_uri=https://www.fastvoice.online/api/stripe-connect-callback" +
      "&client_id=ca_RkSUZC4iFSxJNpZtCxGkYRSetch4haGp" +
      "&state=" + accessToken +
      "&response_type=code" +
      "&scope=read_write" +
      "&stripe_user[country]=IE";

    console.log('Generated Stripe Connect URL:', connectAccountURL)

    return new Response(
      JSON.stringify({ url: connectAccountURL }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error creating Stripe Connect session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})
