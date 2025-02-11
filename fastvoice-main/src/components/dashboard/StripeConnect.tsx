import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createStripeConnectSession } from "@/pages/stripe-connect-callback";

interface StripeConnectProps {
  isConnected: boolean;
}

export function StripeConnect({ isConnected }: StripeConnectProps) {
  const { toast } = useToast();

  const handleStripeConnect = async () => {
    try {
      const { url } = await createStripeConnectSession();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to get Stripe Connect URL');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate Stripe Connect",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Stripe Connect</CardTitle>
        <CardDescription>
          Connect your Stripe account to start receiving payments
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
