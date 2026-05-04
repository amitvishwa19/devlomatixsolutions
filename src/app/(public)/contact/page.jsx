"use client"
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import SEO from "../_components/SEO";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(3, "Subject too short").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
});

const TOPICS = ["General Inquiry", "Order & Shipping", "Crystal Guidance", "Vastu Consultation", "Wholesale", "Partnership"];

const FAQS = [
  { q: "How long does shipping take?", a: "Pan-India delivery in 3–5 business days. International shipping in 7–14 days." },
  { q: "Are your crystals authentic?", a: "Yes — every crystal is ethically sourced and authenticity-verified by our gemologists." },
  { q: "Do you offer crystal consultations?", a: "Absolutely. Book a 1-on-1 session via the form below or WhatsApp us." },
  { q: "What is your return policy?", a: "30-day hassle-free returns on unopened items. Read our full policy in FAQ." },
];

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", topic: TOPICS[0], message: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const flat = {};
      result.error.issues.forEach((i) => { flat[i.path[0]] = i.message; });
      setErrors(flat);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", topic: TOPICS[0], message: "" });
  };

  const inputClass = (field) =>
    `w-full bg-secondary border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-colors ${
      errors[field] ? "border-destructive" : "border-border"
    }`;

  const contactCards = [
    { icon: Mail, label: "EMAIL", value: "hello@crystalaura.com", href: "mailto:hello@crystalaura.com" },
    { icon: Phone, label: "PHONE", value: "+91 98765 43210", href: "tel:+919876543210" },
    { icon: MessageCircle, label: "WHATSAPP", value: "Chat with us instantly", href: "https://wa.me/919876543210" },
    { icon: MapPin, label: "ADDRESS", value: "Bandra West, Mumbai 400050, India" },
    { icon: Clock, label: "HOURS", value: "Mon – Sat · 10AM – 7PM IST" },
  ];

  return (
    <div className="pt-20">
      <SEO title="Contact Us" description="Get in touch with CrystalAura for crystal guidance, Vastu consultations, orders or partnership inquiries." path="/contact" />
      <section className="py-16 text-center">
        <p className="text-gold text-sm mb-2">✦ Get In Touch ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4">
          <span className="text-gold">Contact</span> Us
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto px-4">
          Have questions about crystals, Vastu placement, or your order? Reach out and our spiritual guides will assist you.
        </p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {contactCards.map((item, i) => {
              const Wrapper = item.href ? "a" : "div";
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Wrapper
                    {...(item.href ? { href: item.href, target: item.href.startsWith("http") ? "_blank" : undefined, rel: "noopener noreferrer" } : {})}
                    className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/40 transition-colors block"
                  >
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground tracking-wider">{item.label}</p>
                      <p className="font-semibold text-sm tracking-wide truncate">{item.value}</p>
                    </div>
                  </Wrapper>
                </motion.div>
              );
            })}

            <div className="glass-card rounded-xl p-5">
              <p className="text-xs text-muted-foreground tracking-wider mb-3">FOLLOW US</p>
              <div className="flex gap-2">
                {[
                  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-xl p-6 md:p-8 lg:col-span-3"
          >
            <h2 className="font-serif text-2xl mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider mb-1 block">NAME *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    maxLength={100}
                    className={inputClass("name")}
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground tracking-wider mb-1 block">EMAIL *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    maxLength={255}
                    className={inputClass("email")}
                  />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground tracking-wider mb-1 block">TOPIC</label>
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground tracking-wider mb-1 block">SUBJECT *</label>
                <input
                  type="text"
                  placeholder="Brief subject line"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  maxLength={200}
                  className={inputClass("subject")}
                />
                {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="text-xs text-muted-foreground tracking-wider mb-1 block">
                  MESSAGE * <span className="text-muted-foreground/60">({form.message.length}/2000)</span>
                </label>
                <textarea
                  placeholder="Share your thoughts..."
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={2000}
                  className={`${inputClass("message")} resize-none`}
                />
                {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="gold-gradient text-primary-foreground px-8 py-3 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity tracking-wider text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? "SENDING..." : "SEND MESSAGE"}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="text-center mb-10">
          <p className="text-gold text-sm mb-2">✦ Quick Answers ✦</p>
          <h2 className="font-serif text-3xl md:text-4xl">Frequently Asked</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full px-6 py-4 flex items-center justify-between text-left"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <span className={`text-gold text-xl transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm text-muted-foreground">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="glass-card rounded-xl overflow-hidden">
          <iframe
            title="CrystalAura Mumbai location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.81%2C19.04%2C72.86%2C19.08&layer=mapnik&marker=19.0596%2C72.8295"
            className="w-full h-[400px] border-0"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  );
};

export default ContactPage;