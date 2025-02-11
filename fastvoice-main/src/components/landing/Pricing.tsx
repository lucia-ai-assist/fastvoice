import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    name: "Basic",
    price: "€39.99",
    description: "Perfect for small businesses",
    type: "basic",
    productId: "prod_RjmIoyb74UFYOx",
    features: [
      "Connect 1 Stripe Account",
      "Unlimited Invoices",
      "Basic Templates",
      "Email Support",
    ],
  },
  {
    name: "Premium",
    price: "€59.99",
    description: "For growing businesses",
    type: "premium",
    productId: "prod_RjmJq45tqayo65",
    features: [
      "Connect Multiple Stripe Accounts",
      "Unlimited Invoices",
      "Custom Templates",
      "Priority Support",
      "Advanced Analytics",
    ],
  },
];

export const Pricing = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (planType: string, productId: string) => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          email, 
          planType, 
          productId 
        }
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');

      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-8">
          Simple, Transparent Pricing
        </h2>
        <div className="max-w-md mx-auto mb-12">
          <input
            type="email"
            placeholder="Enter your email to get started"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-primary mb-4">{plan.price}</div>
              <p className="text-gray-600 mb-6">{plan.description}</p>
              <Button 
                className="w-full mb-8"
                onClick={() => handleSubscribe(plan.type, plan.productId)}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Get Started"}
              </Button>
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-700">
                    <Check className="w-5 h-5 text-primary mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
