import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database.types";
import { StripeConnect } from "@/components/dashboard/StripeConnect";
import { InvoiceForm } from "@/components/dashboard/InvoiceForm";
import { InvoiceList } from "@/components/dashboard/InvoiceList";
import { Button } from "@/components/ui/button";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  date: string;
  status: string;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    checkAuth();
    checkStripeConnection();
    
    // Check for Stripe connection status from URL
    const stripeConnect = searchParams.get('stripe_connect');
    if (stripeConnect === 'success') {
      toast({
        title: "Success",
        description: "Your Stripe account has been connected successfully!",
        variant: "default",
      });
    } else if (stripeConnect === 'error') {
      toast({
        title: "Error",
        description: "Failed to connect your Stripe account. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth', { replace: true });
    } else {
      setLoading(false);
    }
  };

  const checkStripeConnection = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('users')
        .select('stripe_account_id')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error checking Stripe connection:', error);
        return;
      }
      
      setStripeConnected(!!data?.stripe_account_id);
      if (data?.stripe_account_id) {
        fetchTransactions(data.stripe_account_id);
      }
    } catch (error) {
      console.error('Error checking Stripe connection:', error);
      toast({
        title: "Error",
        description: "Failed to check Stripe connection status",
        variant: "destructive",
      });
    }
  };

  const fetchTransactions = async (stripeAccountId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-stripe-transactions', {
        body: { stripeAccountId }
      });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvoice = async (transaction: Transaction) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { transaction }
      });

      if (error) throw error;

      // Download the generated PDF
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transaction.id}.pdf`;
      a.click();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <img src="/icon.png" alt="FastVoice Logo" className="h-10 w-10" />
        <h1 className="text-3xl font-gabarito font-bold">Dashboard</h1>
      </div>
      
      <StripeConnect isConnected={stripeConnected} />

      {stripeConnected ? (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Your Transactions</h2>
          <div className="bg-white rounded-lg shadow">
            {transactions.length > 0 ? (
              <div className="divide-y">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      <p className="text-sm font-medium">${(transaction.amount / 100).toFixed(2)}</p>
                    </div>
                    <Button 
                      onClick={() => handleGenerateInvoice(transaction)}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      Generate Invoice
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No transactions found. Start accepting payments to see them here.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center text-gray-500">
          Connect your Stripe account to start managing your transactions and generating invoices.
        </div>
      )}
    </div>
  );
}
