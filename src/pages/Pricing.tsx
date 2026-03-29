import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for personal use",
    features: [
      "Up to 2 connected platforms",
      "100 messages/month",
      "7-day message history",
      "Basic search",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For professionals who need more",
    features: [
      "Unlimited platforms",
      "Unlimited messages",
      "Unlimited message history",
      "Advanced search & filters",
      "Priority support",
      "Keyboard shortcuts",
      "Custom themes",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "per user/month",
    description: "For teams that collaborate",
    features: [
      "Everything in Pro",
      "Shared inboxes",
      "Team analytics",
      "Admin controls",
      "SSO/SAML",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Start free, upgrade when you need more. No hidden fees, no surprises.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "relative p-8 rounded-2xl border",
                  plan.popular
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-background text-foreground rounded-full">
                      <Zap className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className={cn(
                      "text-sm ml-1",
                      plan.popular ? "text-background/70" : "text-muted-foreground"
                    )}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm",
                    plan.popular ? "text-background/70" : "text-muted-foreground"
                  )}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className={cn(
                        "w-5 h-5 flex-shrink-0",
                        plan.popular ? "text-background" : "text-success"
                      )} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn(
                    "w-full",
                    plan.popular
                      ? "bg-background text-foreground hover:bg-background/90"
                      : ""
                  )}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link to="/signup">{plan.cta}</Link>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* FAQ Teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-16"
          >
            <p className="text-muted-foreground">
              Have questions?{" "}
              <Link to="/contact" className="text-foreground underline underline-offset-4 hover:no-underline">
                Contact our sales team
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
