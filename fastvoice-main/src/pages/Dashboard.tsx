import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Invoice } from "@/types/invoice";
import type { Database } from "@/types/database.types";
import { StripeConnect } from "@/components/dashboard/StripeConnect";
import { InvoiceForm } from "@/components/dashboard/InvoiceForm";
import { InvoiceList } from "@/components/dashboard/InvoiceList";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    checkStripeConnection();
    fetchInvoices();
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
    } catch (error) {
      console.error('Error checking Stripe connection:', error);
      toast({
        title: "Error",
        description: "Failed to check Stripe connection status",
        variant: "destructive",
      });
    }
  };

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
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
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <StripeConnect isConnected={stripeConnected} />

      {stripeConnected && (
        <>
          <InvoiceForm onInvoiceGenerated={fetchInvoices} />
          <InvoiceList invoices={invoices} />
        </>
      )}
    </div>
  );
}
