import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is the WhatsApp Business API?",
    a: "The WhatsApp Business API is a solution designed for medium and large businesses to communicate with customers at scale. Unlike the WhatsApp Business App, the API allows you to integrate WhatsApp messaging into your existing systems, automate conversations, and send bulk campaigns.",
  },
  {
    q: "Do I need a new phone number?",
    a: "You can use your existing business phone number or register a new one. We'll help you through the verification process to get your number approved on the WhatsApp Business API.",
  },
  {
    q: "How much does WhatsApp messaging cost?",
    a: "WhatsApp charges per conversation (24-hour window). Rates vary by country and conversation type (marketing, utility, service, or authentication). Our platform fee is separate from Meta's messaging charges.",
  },
  {
    q: "Can I get the green tick verification?",
    a: "Yes! We help businesses apply for the official green tick (verified business account) on WhatsApp. You'll need a verified Meta Business Manager and meet Meta's eligibility criteria.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses are up and running within 24-48 hours. Our onboarding team will guide you through number registration, template approval, and platform setup.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes, we offer a 7-day free trial on our Starter and Growth plans. No credit card required — you can explore all features before committing.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
            Frequently Asked <span className="text-gradient-sun">Questions</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card rounded-xl px-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
