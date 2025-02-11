import { handleStripeCallback } from '@/pages/stripe-connect-callback';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  
  if (!code) {
    return new Response('No code provided', { status: 400 });
  }

  try {
    await handleStripeCallback(code);
    return Response.redirect(`${import.meta.env.VITE_APP_URL}/dashboard`);
  } catch (error) {
    console.error('Error in stripe callback:', error);
    return new Response('Error processing callback', { status: 500 });
  }
} 