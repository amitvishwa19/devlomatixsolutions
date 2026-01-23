import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { question: "How long does it take to implement the HMS?", answer: "Implementation typically takes 4-8 weeks depending on the size of your hospital and complexity of requirements." },
  { question: "Is the system compliant with Indian healthcare regulations?", answer: "Yes, our HMS is fully compliant with NABH, ABDM, and all relevant Indian healthcare data protection regulations." },
  { question: "Can we migrate data from our existing system?", answer: "Absolutely! We provide comprehensive data migration services to safely transfer all patient records and billing data." },
  { question: "What kind of training do you provide?", answer: "We offer role-based training for all staff members including hands-on sessions, video tutorials, and documentation." },
];

const FAQSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-12">
          <span className="module-badge mb-4">FAQ</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">Frequently Asked <span className="hero-gradient-text">Questions</span></h2>
        </motion.div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-xl border border-border/50 px-6 shadow-soft">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-5">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
