import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StripeConnectProps {
  isConnected: boolean;
}

export function StripeConnect({ isConnected }: StripeConnectProps) {
  const { toast } = useToast();

  const handleStripeConnect = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to connect your Stripe account.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-stripe-connect-session', {
        body: { state: session.user.id }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get Stripe Connect URL');
      }
    } catch (error: any) {
      console.error('Error connecting to Stripe:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect to Stripe",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Connection</CardTitle>
        <CardDescription>
          Connect your Stripe account to start accepting payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-md">
              ✓ Stripe account connected
            </div>
          </div>
        ) : (
          <Button onClick={handleStripeConnect}>
            Connect with Stripe
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
