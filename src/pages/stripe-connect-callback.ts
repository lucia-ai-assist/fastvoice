
import { supabase } from "@/integrations/supabase/client";
import Stripe from "stripe";

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function createStripeConnectSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Correct the redirect_uri to the dashboard URL
    const connectAccountURL = await stripe.oauth.authorizeUrl({
      client_id: import.meta.env.VITE_STRIPE_CLIENT_ID,
      response_type: 'code',
      scope: 'read_write',
      redirect_uri: "https://www.fastvoice.online/dashboard", // Redirect to dashboard after Stripe connect
      state: session.access_token,
    });

    return { url: connectAccountURL };
  } catch (error: any) {
    console.error('Error creating Stripe Connect session:', error);
    throw new Error(error.message);
  }
}
