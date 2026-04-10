import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Marketing Head, ShopEase",
    avatar: "PS",
    rating: 5,
    quote:
      "KonnectX transformed our customer engagement. We saw a 3x increase in conversions within the first month of using their WhatsApp campaigns.",
  },
  {
    name: "Rahul Mehta",
    role: "CEO, EduPrime Academy",
    avatar: "RM",
    rating: 5,
    quote:
      "The chatbot builder is incredibly intuitive. We automated 80% of our admissions queries and our team now focuses on what truly matters.",
  },
  {
    name: "Ananya Iyer",
    role: "Operations Manager, FreshBite",
    avatar: "AI",
    rating: 5,
    quote:
      "Order confirmations, delivery updates, feedback collection — all automated on WhatsApp. Our customers love the seamless experience.",
  },
  {
    name: "David Chen",
    role: "Founder, TravelNest",
    avatar: "DC",
    rating: 4,
    quote:
      "Integrating KonnectX with our CRM was effortless. The API is well-documented and the support team is phenomenal.",
  },
  {
    name: "Sara Al-Rashid",
    role: "CTO, HealthFirst Clinics",
    avatar: "SA",
    rating: 5,
    quote:
      "Patient no-shows dropped by 45% after we set up automated appointment reminders. The ROI was immediate and measurable.",
  },
  {
    name: "Michael Torres",
    role: "Sales Director, PropHub Realty",
    avatar: "MT",
    rating: 5,
    quote:
      "We close deals faster now. Automated follow-ups and instant property sharing on WhatsApp changed our entire sales pipeline.",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
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
            Testimonials
          </p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Loved by <span className="text-gradient-sun">Businesses Worldwide</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers have to say about their experience with KonnectX.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass-card rounded-2xl p-6 transition-all duration-300 hover:border-primary/20"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s < t.rating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground"
                  style={{ background: "var(--gradient-sun)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
