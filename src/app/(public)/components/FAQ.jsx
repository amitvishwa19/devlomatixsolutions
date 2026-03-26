import { motion } from "framer-motion";
import { Plus, Minus, Sparkles } from "lucide-react";
import { useState } from "react";
import Tagline from "./Tagline";

const faqs = [
  {
    question: "How long does a typical project take?",
    answer: "Project timelines vary based on scope and complexity. A simple MVP typically takes 6-8 weeks, while complex enterprise solutions may take 4-6 months. We provide detailed timelines during our discovery phase and keep you updated throughout development.",
  },
  {
    question: "What industries do you specialize in?",
    answer: "We have extensive experience across healthcare, fintech, e-commerce, logistics, and SaaS. Our diverse portfolio allows us to bring cross-industry insights to every project, often resulting in innovative solutions.",
  },
  {
    question: "Do you provide ongoing support after launch?",
    answer: "Absolutely! We offer comprehensive maintenance and support packages including bug fixes, security updates, performance optimization, and feature enhancements. Our 24/7 support ensures your systems run smoothly.",
  },
  {
    question: "How do you ensure project quality?",
    answer: "We follow rigorous quality assurance processes including code reviews, automated testing, manual QA, and performance testing. We also use CI/CD pipelines for consistent, reliable deployments.",
  },
  {
    question: "What is your development process?",
    answer: "We follow an agile methodology with 2-week sprints. This includes regular client check-ins, demo sessions, and iterative improvements. You'll have full visibility into progress through our project management tools.",
  },
  {
    question: "Can you work with our existing team?",
    answer: "Yes! We offer flexible engagement models including team augmentation, dedicated teams, and project-based work. Our developers integrate seamlessly with your existing workflows and communication tools.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-32 relative">
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Tagline text="FAQ" icon={<Sparkles className="w-4 h-4 text-primary" />} />


          <h2 className="text-primary text-4xl md:text-5xl font-bold mt-4 mb-6">
            Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Get answers to common questions about our services and process.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="glass-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-secondary/30 transition-colors duration-300"
              >
                <span className="font-display font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                  {openIndex === index ? (
                    <Minus className="w-4 h-4 text-primary" />
                  ) : (
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-5"
                >
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
