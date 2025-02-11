
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Connect Stripe",
    description: "Link your Stripe account with a single click",
  },
  {
    number: "02",
    title: "Configure Settings",
    description: "Set up your invoice preferences and templates",
  },
  {
    number: "03",
    title: "Generate Invoices",
    description: "Create professional invoices automatically",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-gray-300 transform -translate-y-1/2" />
              )}
              <div className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
                <div className="text-4xl font-bold text-primary mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
