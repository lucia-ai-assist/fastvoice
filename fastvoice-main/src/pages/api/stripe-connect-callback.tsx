import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { handleStripeCallback } from '@/pages/stripe-connect-callback';

export default function StripeConnectCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleStripeCallback(code)
        .then(() => {
          navigate('/dashboard');
        })
        .catch((error) => {
          console.error('Error handling callback:', error);
          navigate('/dashboard?error=stripe-connect-failed');
        });
    }
  }, [searchParams, navigate]);

  return <div>Processing Stripe connection...</div>;
} 