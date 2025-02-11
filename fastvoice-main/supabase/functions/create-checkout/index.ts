
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { stripe } from "../_shared/stripe.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request body
    const { email, planType, productId } = await req.json()
    
    if (!email || !planType || !productId) {
      console.error('Missing required fields:', { email, planType, productId })
      throw new Error('Missing required fields')
    }

    console.log('Creating checkout session for:', { email, planType, productId })

    // Set amount based on plan type
    const amount = planType === 'premium' ? 5999 : 3999

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product: productId,
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/auth?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}`,
      customer_email: email,
    })

    console.log('Stripe session created:', session.id)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Store payment information
    const { error: insertError } = await supabase
      .from('pre_registration_payments')
      .insert({
        email,
        plan_type: planType,
        stripe_session_id: session.id,
        stripe_customer_id: session.customer,
        payment_status: 'pending'
      })

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      throw new Error('Failed to store payment information')
    }

    console.log('Payment information stored successfully')

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Create checkout error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during checkout' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
