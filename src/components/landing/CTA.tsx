import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CTA = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-24 bg-foreground text-background">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Ready to simplify your inbox?
          </h2>
          <p className="text-lg text-background/70 mb-10">
            Join thousands of professionals who've reclaimed their time. 
            Start free, upgrade when you're ready.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild 
              size="lg" 
              className="h-12 px-8 text-base bg-background text-foreground hover:bg-background/90"
            >
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="h-12 px-8 text-base border-background/30 text-background hover:bg-background/10"
            >
              <Link to="/signin">
                Sign In
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});

CTA.displayName = "CTA";
