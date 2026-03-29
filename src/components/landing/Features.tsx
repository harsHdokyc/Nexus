import { motion } from "framer-motion";
import { Zap, Shield, Layers, Search, Bell, Keyboard } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Unified Inbox",
    description: "All your platforms in one place. Gmail, Slack, Twitter, Teams, and more—seamlessly integrated.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Instant load times and real-time sync. Every interaction feels immediate.",
  },
  {
    icon: Search,
    title: "Universal Search",
    description: "Find any message across all platforms with powerful, intelligent search.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "AI-powered priority scoring ensures you never miss what matters.",
  },
  {
    icon: Keyboard,
    title: "Keyboard First",
    description: "Navigate and respond without touching your mouse. Built for power users.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "End-to-end encryption. Your data stays yours, always.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section className="py-24 bg-surface">
      <div className="container px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Everything you need, nothing you don't
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Built for speed and simplicity. Nexus removes the friction from 
            managing multiple communication platforms.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group p-6 rounded-xl bg-background border border-border hover:border-foreground/20 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
