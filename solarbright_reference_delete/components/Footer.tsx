import { Sun } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border pt-20 pb-8 relative overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-primary/2 blur-[150px]" />

      <div className="container mx-auto px-4 relative">
        <div className="grid sm:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Sun className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold text-foreground">
                Solar<span className="text-primary">Shine</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              India's trusted solar panel cleaning service. Serving 50+ cities across Rajasthan, Gujarat, Maharashtra, Tamil Nadu & more.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {["Services", "How It Works", "Why Choose Us", "Pricing", "Testimonials"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-primary group-hover:w-4 transition-all duration-300" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-foreground text-sm uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">📞 +91 98765 43210</li>
              <li className="flex items-center gap-2">💬 WhatsApp: +91 98765 43210</li>
              <li className="flex items-center gap-2">✉️ info@solarshine.in</li>
              <li className="flex items-center gap-2">📍 Jaipur, Rajasthan, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground/60">
          <p>© {new Date().getFullYear()} SolarShine. All rights reserved.</p>
          <p>Starting at just ₹499 per visit</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
