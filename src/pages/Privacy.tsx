import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-12">Last updated: January 27, 2026</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  At Nexus, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our unified communication platform.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mt-6 mb-3">Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Account information (name, email, password)</li>
                  <li>Profile information you choose to add</li>
                  <li>Communication preferences</li>
                  <li>Feedback and correspondence</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3">Information from Connected Platforms</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Messages, emails, and notifications from connected services</li>
                  <li>Contact information from your connected accounts</li>
                  <li>Platform-specific metadata (timestamps, read status, etc.)</li>
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Device information and browser type</li>
                  <li>Usage data and analytics</li>
                  <li>IP address and location data</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>To provide and maintain our service</li>
                  <li>To sync and display your messages across platforms</li>
                  <li>To personalize your experience</li>
                  <li>To improve our service and develop new features</li>
                  <li>To communicate with you about updates and support</li>
                  <li>To detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>End-to-end encryption for all message content</li>
                  <li>Encrypted data storage at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>SOC 2 Type II certification</li>
                  <li>Two-factor authentication support</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">5. Data Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal data. We may share information with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Service providers who assist in operating our platform</li>
                  <li>Law enforcement when required by law</li>
                  <li>Other parties with your explicit consent</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                <p className="text-muted-foreground mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Delete your data</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Disconnect platforms at any time</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@nexus.app" className="text-foreground underline">
                    privacy@nexus.app
                  </a>
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
