
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  };

  const handleAuthClick = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-white relative">
      <div className="absolute top-4 right-4 z-50">
        {!loading && (
          <Button 
            onClick={handleAuthClick}
            className="bg-primary hover:bg-primary-dark transition-colors"
          >
            {isAuthenticated ? "Dashboard" : "Login"}
          </Button>
        )}
      </div>
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
    </div>
  );
};

export default Index;
