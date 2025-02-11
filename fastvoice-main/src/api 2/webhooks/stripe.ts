
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { CheckoutLog } from '@/types/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function handleStripeWebhook(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle specific events
    if (event.type === 'checkout.session.completed' || 
        event.type === 'checkout.session.async_payment_failed') {
      
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract relevant data
      const logData: CheckoutLog = {
        session_id: session.id,
        email: session.customer_details?.email,
        status: event.type === 'checkout.session.completed' ? 'succeeded' : 'failed',
        amount: session.amount_total,
        currency: session.currency,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Log to Supabase
      const { error } = await supabase
        .from('checkout_logs')
        .insert([logData]);

      if (error) {
        console.error('Supabase logging error:', error);
        return new Response('Error logging to database', { status: 500 });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }), 
      { 
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 
