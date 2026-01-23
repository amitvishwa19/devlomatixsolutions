import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormModal from "../ContactFormModal";


const features = [
  { name: "Cloud-Based Access", carewell: true, traditional: false, basic: true },
  { name: "Auto Cloud Backup", carewell: true, traditional: false, basic: false },
  { name: "500+ Pathology Reports", carewell: true, traditional: false, basic: false },
  { name: "500+ Radiology Templates", carewell: true, traditional: false, basic: false },
  { name: "GST-Compliant Billing", carewell: true, traditional: true, basic: true },
  { name: "Multi-Branch Support", carewell: true, traditional: false, basic: false },
  { name: "Mobile App Access", carewell: true, traditional: false, basic: true },
  { name: "TPA/Insurance Integration", carewell: true, traditional: true, basic: false },
  { name: "WhatsApp Notifications", carewell: true, traditional: false, basic: false },
  { name: "ABDM/HL7 Compliant", carewell: true, traditional: false, basic: false },
  { name: "24/7 Support", carewell: true, traditional: true, basic: false },
  { name: "Free Training", carewell: true, traditional: false, basic: false },
];

const ComparisonSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why CareWell?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See How We Compare
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            CareWell HMS offers comprehensive features that traditional and basic software simply can't match
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-background rounded-2xl border border-border/50 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-secondary/50 border-b border-border/50">
              <div className="font-semibold text-foreground">Features</div>
              <div className="text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  <Sparkles className="h-3 w-3" />
                  CareWell
                </div>
              </div>
              <div className="text-center font-medium text-muted-foreground text-sm">Traditional HMS</div>
              <div className="text-center font-medium text-muted-foreground text-sm">Basic Software</div>
            </div>

            {/* Features */}
            <div className="divide-y divide-border/50">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="grid grid-cols-4 gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="text-sm text-foreground">{feature.name}</div>
                  <div className="flex justify-center">
                    {feature.carewell ? (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                        <X className="h-4 w-4 text-destructive" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {feature.traditional ? (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Check className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <X className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {feature.basic ? (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Check className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <X className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <ContactFormModal>
            <Button size="lg" variant="default">
              Switch to CareWell Today
            </Button>
          </ContactFormModal>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;
