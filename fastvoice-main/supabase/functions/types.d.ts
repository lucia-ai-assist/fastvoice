declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

declare module "https://esm.sh/stripe@13.10.0?target=deno" {
  interface Stripe {
    oauth: {
      token(params: { grant_type: string; code: string }): Promise<{ stripe_user_id: string }>;
      authorizeUrl(params: { client_id: string; response_type: string; scope: string; redirect_uri: string }): string;
    };
  }
  const Stripe: {
    new (secretKey: string, options: { apiVersion: string }): Stripe;
  };
  export default Stripe;
} 