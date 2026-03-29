import { motion } from "framer-motion";
import { Users, Target, Heart, Globe } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const values = [
  {
    icon: Target,
    title: "Focus",
    description: "We believe in doing one thing exceptionally well. Our mission is to make communication effortless.",
  },
  {
    icon: Users,
    title: "User First",
    description: "Every feature we build starts with understanding how it will make our users' lives easier.",
  },
  {
    icon: Heart,
    title: "Craftsmanship",
    description: "We obsess over details. From animations to accessibility, everything is intentionally designed.",
  },
  {
    icon: Globe,
    title: "Privacy",
    description: "Your data is yours. We use end-to-end encryption and never sell your information.",
  },
];

const team = [
  { name: "Alex Chen", role: "CEO & Co-Founder", image: "https://i.pravatar.cc/150?img=11" },
  { name: "Sarah Miller", role: "CTO & Co-Founder", image: "https://i.pravatar.cc/150?img=5" },
  { name: "James Wilson", role: "Head of Design", image: "https://i.pravatar.cc/150?img=12" },
  { name: "Emily Davis", role: "Head of Engineering", image: "https://i.pravatar.cc/150?img=9" },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container px-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              We're building the future of communication
            </h1>
            <p className="text-xl text-muted-foreground">
              Nexus started with a simple idea: what if you could manage all your messages
              in one beautiful, fast interface? Today, we're making that vision a reality.
            </p>
          </motion.div>

          {/* Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-2xl font-semibold mb-6">Our Story</h2>
            <div className="prose prose-neutral dark:prose-invert">
              <p className="text-muted-foreground mb-4">
                In 2024, our founders were drowning in notifications. Between email, Slack, 
                Twitter DMs, and Teams messages, staying on top of communication felt like a 
                full-time job. They knew there had to be a better way.
              </p>
              <p className="text-muted-foreground mb-4">
                After months of research and prototyping, Nexus was born—a unified inbox that 
                brings all your conversations together without sacrificing the unique experience 
                of each platform. No more context switching. No more missed messages.
              </p>
              <p className="text-muted-foreground">
                Today, thousands of professionals use Nexus to reclaim their time and stay 
                connected with what matters most.
              </p>
            </div>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-semibold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-center mb-12">Meet the Team</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
