
import { CheckCircle, Link, RefreshCcw } from "lucide-react";

const features = [
  {
    icon: Link,
    title: "Connect Your Stripe Account",
    description: "Seamlessly integrate with your existing Stripe account in just a few clicks.",
  },
  {
    icon: CheckCircle,
    title: "Unlimited Invoices",
    description: "Generate and manage as many invoices as you need with our powerful platform.",
  },
  {
    icon: RefreshCcw,
    title: "Manage Multiple Accounts",
    description: "Premium plan users can connect and manage multiple Stripe accounts effortlessly.",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
          Powerful Features for Modern Businesses
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="mb-4">
                <feature.icon className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
