import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createStripeConnectUrl } from "../_shared/stripe.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Log environment variables (without sensitive data)
    console.log('Environment check:', {
      hasStripeKey: !!Deno.env.get('STRIPE_SECRET_KEY'),
      hasClientId: !!Deno.env.get('STRIPE_CLIENT_ID'),
    });

    const connectAccountURL = await createStripeConnectUrl();
    console.log('Generated URL:', connectAccountURL.split('?')[0]);

    return new Response(
      JSON.stringify({ url: connectAccountURL }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 