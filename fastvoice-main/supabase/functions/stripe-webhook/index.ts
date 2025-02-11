
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from "../_shared/stripe.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) throw new Error('No Stripe signature found')

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) throw new Error('Webhook secret not configured')

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      // Update payment status in pre_registration_payments
      const { error: preRegError } = await supabase
        .from('pre_registration_payments')
        .update({ 
          payment_status: 'completed',
          stripe_customer_id: session.customer,
        })
        .eq('stripe_session_id', session.id)

      if (preRegError) throw preRegError

      // Log successful payment
      const { error: logError } = await supabase
        .from('checkout_logs')
        .insert({
          session_id: session.id,
          email: session.customer_email,
          status: 'succeeded',
          amount: session.amount_total,
          currency: session.currency,
        })

      if (logError) throw logError
    }

    // Handle checkout.session.async_payment_failed event
    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object

      // Update payment status in pre_registration_payments
      const { error: preRegError } = await supabase
        .from('pre_registration_payments')
        .update({ 
          payment_status: 'failed',
          stripe_customer_id: session.customer,
        })
        .eq('stripe_session_id', session.id)

      if (preRegError) throw preRegError

      // Log failed payment
      const { error: logError } = await supabase
        .from('checkout_logs')
        .insert({
          session_id: session.id,
          email: session.customer_email,
          status: 'failed',
          amount: session.amount_total,
          currency: session.currency,
        })

      if (logError) throw logError
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
