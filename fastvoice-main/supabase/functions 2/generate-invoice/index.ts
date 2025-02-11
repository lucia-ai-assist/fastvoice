
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { stripe } from "../_shared/stripe.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get the user from the token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Get the connected Stripe account
    const { data: stripeAccount, error: stripeAccountError } = await supabaseClient
      .from('stripe_connect_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (stripeAccountError || !stripeAccount) {
      throw new Error('No connected Stripe account found')
    }

    // Parse the request body
    const { client_name, client_email, amount, description, due_date } = await req.json()

    // Create the invoice using the connected account
    const invoice = await stripe.invoices.create(
      {
        customer_email: client_email,
        collection_method: 'send_invoice',
        due_date: Math.floor(new Date(due_date).getTime() / 1000),
        custom_fields: [
          {
            name: 'Client Name',
            value: client_name,
          },
        ],
        description,
        pending_invoice_items_behavior: 'include',
      },
      {
        stripeAccount: stripeAccount.stripe_account_id,
      }
    )

    // Create an invoice item
    await stripe.invoiceItems.create(
      {
        customer_email: client_email,
        invoice: invoice.id,
        amount,
        currency: 'usd',
        description,
      },
      {
        stripeAccount: stripeAccount.stripe_account_id,
      }
    )

    // Save the invoice details to Supabase
    const { error: dbError } = await supabaseClient
      .from('invoices')
      .insert({
        user_id: user.id,
        stripe_invoice_id: invoice.id,
        client_name,
        client_email,
        amount,
        description,
        due_date,
        status: invoice.status,
      })

    if (dbError) {
      throw dbError
    }

    // Send the invoice
    const finalizedInvoice = await stripe.invoices.sendInvoice(
      invoice.id,
      {
        stripeAccount: stripeAccount.stripe_account_id,
      }
    )

    return new Response(
      JSON.stringify({ 
        success: true, 
        invoice: finalizedInvoice 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating invoice:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
