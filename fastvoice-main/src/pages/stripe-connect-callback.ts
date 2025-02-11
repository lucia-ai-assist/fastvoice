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

    const connectAccountURL = await stripe.oauth.authorizeUrl({
      client_id: import.meta.env.VITE_STRIPE_CLIENT_ID,
      response_type: 'code',
      scope: 'read_write',
      redirect_uri: 'https://nrvhyrkegwhrfovftjtz.supabase.co/functions/v1/stripe-connect-callback',
      state: session.access_token,
    });

    return { url: connectAccountURL };
  } catch (error: any) {
    console.error('Error creating Stripe Connect session:', error);
    throw new Error(error.message);
  }
}

// Add the callback handler
export async function handleStripeCallback(code: string) {
  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    });
    
    // Store the connected account ID in your database if needed
    const connectedAccountId = response.stripe_user_id;
    
    // Redirect to dashboard
    window.location.href = `${import.meta.env.VITE_APP_URL}/dashboard`;
    
    return response;
  } catch (error: any) {
    console.error('Error handling Stripe callback:', error);
    throw new Error(error.message);
  }
}
