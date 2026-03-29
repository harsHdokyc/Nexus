import { forwardRef } from "react";
import { Layers } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="py-12 border-t border-border">
      <div className="container px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Layers className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-semibold">Nexus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Unified communication for modern teams.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <nav className="space-y-3 text-sm">
              <Link to="/features" className="block text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground transition-colors">Demo</Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <nav className="space-y-3 text-sm">
              <Link to="/about" className="block text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <nav className="space-y-3 text-sm">
              <Link to="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Nexus. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Twitter</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Discord</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
