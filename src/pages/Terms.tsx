import { motion } from "framer-motion";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const Terms = () => {
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
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-12">Last updated: January 27, 2026</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing or using Nexus, you agree to be bound by these Terms of Service and all 
                  applicable laws and regulations. If you do not agree with any of these terms, you are 
                  prohibited from using or accessing this service.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground mb-4">
                  Nexus is a unified communication platform that aggregates messages and notifications 
                  from multiple third-party services including email providers, messaging platforms, 
                  and social media networks into a single interface.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account credentials</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You must be at least 13 years old to use this service</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
                <p className="text-muted-foreground mb-4">
                  By connecting third-party services to Nexus, you:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Authorize us to access your data from those services</li>
                  <li>Agree to comply with those services' terms of use</li>
                  <li>Understand that we are not responsible for those services' availability or functionality</li>
                  <li>Can revoke access at any time through your settings</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Use the service for any illegal purpose</li>
                  <li>Attempt to gain unauthorized access to any systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Transmit malware or harmful code</li>
                  <li>Impersonate others or misrepresent your affiliation</li>
                  <li>Use automated systems to access the service without permission</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground mb-4">
                  The Nexus service, including its original content, features, and functionality, 
                  is owned by Nexus and is protected by international copyright, trademark, 
                  patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">7. Payment Terms</h2>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>Paid subscriptions are billed in advance</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Refunds are provided in accordance with our refund policy</li>
                  <li>Prices are subject to change with 30 days notice</li>
                </ul>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  In no event shall Nexus, its directors, employees, partners, agents, suppliers, 
                  or affiliates, be liable for any indirect, incidental, special, consequential, 
                  or punitive damages, including without limitation, loss of profits, data, use, 
                  goodwill, or other intangible losses.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your account immediately, without prior notice or liability, 
                  for any reason whatsoever, including without limitation if you breach the Terms. 
                  Upon termination, your right to use the service will immediately cease.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
                <p className="text-muted-foreground mb-4">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                  we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms, please contact us at{" "}
                  <a href="mailto:legal@nexus.app" className="text-foreground underline">
                    legal@nexus.app
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

export default Terms;
