import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 sm:py-20"
          style={{
            background: "var(--gradient-sun)",
            boxShadow: "var(--shadow-glow-lg)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/5" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <MessageCircle className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-extrabold text-primary-foreground sm:text-4xl lg:text-5xl">
              Ready to Transform Your Business?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
              Join 5,000+ businesses already using KonnectX to engage customers,
              drive sales, and deliver exceptional support on WhatsApp.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/pricing">
                <Button
                  size="lg"
                  className="gap-2 text-base font-bold bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-primary-foreground/30 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                >
                  Talk to Sales
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
