export interface CheckoutLog {
  session_id: string;
  email: string | null | undefined;
  status: 'succeeded' | 'failed';
  amount: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
} 