import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Add a helper function for OAuth
export const createStripeConnectUrl = (state: string) => {
  const baseUrl = 'https://nrvhyrkegwhrfovftjtz.supabase.co/functions/v1';
  const redirectUri = `${baseUrl}/stripe-connect-callback`;
  
  console.log('Creating Stripe Connect URL with:', { state, redirectUri });
  
  return stripe.oauth.authorizeUrl({
    client_id: Deno.env.get('STRIPE_CLIENT_ID') || '',
    response_type: 'code',
    scope: 'read_write',
    state: state, // This is the user's ID that we'll use to update their record
    redirect_uri: redirectUri,
  });
};
