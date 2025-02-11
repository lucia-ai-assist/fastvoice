
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.17.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // This contains the access token

    if (!code || !state) {
      throw new Error("Missing code or state parameter");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Exchange the authorization code for an access token
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(state);
    
    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    // Store the connected account ID
    const { error: dbError } = await supabaseClient
      .from("stripe_connect_accounts")
      .upsert({
        user_id: user.id,
        stripe_account_id: response.stripe_user_id,
      });

    if (dbError) {
      throw dbError;
    }

    // Redirect back to the dashboard with a success message
    return Response.redirect(`${url.origin}/dashboard?success=true`);
  } catch (error) {
    console.error("Stripe Connect callback error:", error);
    return Response.redirect(`${new URL(req.url).origin}/dashboard?error=true`);
  }
});
