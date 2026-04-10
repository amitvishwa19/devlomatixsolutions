import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How often should solar panels be cleaned?",
    answer:
      "We recommend cleaning every 3-4 months for optimal performance. In dusty or polluted areas, monthly cleaning may be needed. Our AMC plan takes care of scheduling so you never have to worry.",
  },
  {
    question: "Will cleaning damage my solar panels?",
    answer:
      "Absolutely not. We use soft brushes, gentle cleaning chemicals, and trained technicians. Our process is designed to remove dirt without scratching or damaging the panel surface.",
  },
  {
    question: "How much energy can I recover after cleaning?",
    answer:
      "Dirty panels can lose up to 30% of their efficiency. After professional cleaning, most customers see a 15-30% boost in energy output, which translates to significant savings on electricity bills.",
  },
  {
    question: "Do you clean commercial and industrial solar setups?",
    answer:
      "Yes! We service residential rooftops, commercial buildings, solar farms, and industrial installations of any size. Contact us for a custom quote for large-scale projects.",
  },
  {
    question: "What is included in the AMC plan?",
    answer:
      "Our AMC (Annual Maintenance Contract) includes scheduled cleanings, a custom monitoring app, weekly performance dashboards, free emergency visits, a dedicated account manager, and detailed performance reports — all at the lowest per-panel rate of ₹14.",
  },
  {
    question: "How do I book a cleaning service?",
    answer:
      "Simply fill out the contact form on our website, call us, or send a WhatsApp message. We'll schedule a visit at your convenience, often within 24 hours.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-28 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            FAQ
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Everything you need to know about our solar panel cleaning services.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl border border-border bg-card px-6 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:text-primary transition-colors py-5 text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
