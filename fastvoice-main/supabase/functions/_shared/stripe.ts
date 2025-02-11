import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Add a helper function for OAuth
export const createStripeConnectUrl = (state: string) => {
  return stripe.oauth.authorizeUrl({
    client_id: Deno.env.get('STRIPE_CLIENT_ID') || '',
    response_type: 'code',
    scope: 'read_write',
    state,
    redirect_uri: 'https://nrvhyrkegwhrfovftjtz.supabase.co/functions/v1/stripe-connect-callback',
  });
};
