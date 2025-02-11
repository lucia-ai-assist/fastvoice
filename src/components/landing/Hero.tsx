
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary-dark to-navy overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="container relative z-10 px-4 py-32 mx-auto text-center">
        <h1 className="animate-fadeIn text-4xl md:text-6xl font-bold text-white mb-6">
          Effortless Invoicing,
          <br />
          <span className="text-primary-light">Powered by Stripe</span>
        </h1>
        <p className="animate-fadeIn [animation-delay:200ms] text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Automate your invoicing workflow and get paid faster with our Stripe-powered platform.
        </p>
        <Button
          size="lg"
          className="animate-fadeIn [animation-delay:400ms] bg-white text-primary hover:bg-gray-100 transition-all duration-300 text-lg px-8 py-6"
        >
          Get Started for €39.99
        </Button>
      </div>
    </section>
  );
};
