import { motion } from "framer-motion";
import { 
  Layers, Zap, Search, Bell, Keyboard, Shield, 
  Palette, Globe, BarChart3, Lock, RefreshCw, Smartphone 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Layers,
    title: "Unified Inbox",
    description: "All your platforms in one place. Gmail, Slack, Twitter, Teams, and Google Meet—seamlessly integrated into a single, beautiful interface.",
    color: "gmail",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed. Instant load times, real-time sync, and optimistic updates. Every interaction feels immediate.",
    color: "twitter",
  },
  {
    icon: Search,
    title: "Universal Search",
    description: "Find any message across all platforms with powerful, intelligent search. Filter by date, platform, sender, or content.",
    color: "slack",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "AI-powered priority scoring ensures you never miss what matters. Customize notifications per platform and sender.",
    color: "teams",
  },
  {
    icon: Keyboard,
    title: "Keyboard First",
    description: "Navigate and respond without touching your mouse. Full keyboard shortcuts for power users who value efficiency.",
    color: "meet",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption, SOC 2 Type II certified, and GDPR compliant. Your data stays yours, always.",
    color: "gmail",
  },
  {
    icon: Palette,
    title: "Platform Themes",
    description: "The UI adapts to each platform's look and feel. Gmail feels like Gmail, Slack feels like Slack—just unified.",
    color: "slack",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Access your unified inbox from any device. Responsive design that works beautifully on desktop, tablet, and mobile.",
    color: "twitter",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Understand your communication patterns. See response times, peak hours, and platform usage insights.",
    color: "teams",
  },
  {
    icon: Lock,
    title: "Privacy Controls",
    description: "Granular privacy settings. Choose what data to sync, set retention policies, and export or delete anytime.",
    color: "meet",
  },
  {
    icon: RefreshCw,
    title: "Real-time Sync",
    description: "Messages appear instantly across all devices. No refresh needed—ever. WebSocket-powered live updates.",
    color: "gmail",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Full functionality on mobile. Compose, reply, search, and manage—all from your phone or tablet.",
    color: "slack",
  },
];

const FeaturesPage = () => {
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
              Features that make a difference
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to manage communications effectively. 
              Nothing you don't.
            </p>
            <Button asChild size="lg">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group p-6 rounded-xl bg-surface border border-border hover:border-foreground/20 transition-all"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: `hsl(var(--${feature.color}) / 0.1)` }}
                >
                  <feature.icon 
                    className="w-6 h-6" 
                    style={{ color: `hsl(var(--${feature.color}))` }}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-20"
          >
            <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of professionals who've simplified their inbox.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
