import { handleStripeWebhook } from './stripe';

export async function POST(req: Request) {
  return handleStripeWebhook(req);
} 