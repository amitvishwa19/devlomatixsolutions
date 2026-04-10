import { motion } from "framer-motion";

const integrations = [
  "Shopify", "WooCommerce", "Salesforce", "HubSpot",
  "Zoho", "Razorpay", "Stripe", "Google Sheets",
  "Zapier", "Freshdesk", "Zendesk", "Slack",
];

export function Integrations() {
  return (
    <section id="integrations" className="relative overflow-hidden py-24 sm:py-32">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Integrations
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Connect With Your{" "}
            <span className="text-gradient-sun">Favorite Tools</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Seamlessly integrate with 50+ apps and platforms your business already uses.
          </p>
        </motion.div>

        {/* Marquee */}
        <div className="relative mt-16">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

          <div className="flex animate-[marquee_30s_linear_infinite] gap-6">
            {[...integrations, ...integrations].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex h-20 min-w-[180px] items-center justify-center glass-card rounded-xl px-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="text-sm font-semibold text-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
