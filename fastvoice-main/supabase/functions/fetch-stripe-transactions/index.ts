import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { stripe } from "../_shared/stripe.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { stripeAccountId } = await req.json()

    const charges = await stripe.charges.list({
      limit: 100,
      stripeAccount: stripeAccountId,
    });

    const transactions = charges.data.map(charge => ({
      id: charge.id,
      amount: charge.amount,
      description: charge.description || 'No description',
      date: new Date(charge.created * 1000).toISOString(),
      status: charge.status,
    }));

    return new Response(
      JSON.stringify(transactions),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 