import { motion } from "framer-motion";
import { 
  CreditCard, 
  MessageSquare, 
  Mail, 
  Cloud, 
  Smartphone,
  FileText,
  Scan,
  Wifi
} from "lucide-react";

const integrations = [
  { icon: CreditCard, name: "Payment Gateways", description: "Razorpay, PayTM, UPI" },
  { icon: MessageSquare, name: "SMS Services", description: "Twilio, MSG91" },
  { icon: Mail, name: "Email Services", description: "SendGrid, AWS SES" },
  { icon: Cloud, name: "Cloud Storage", description: "AWS, Azure, GCP" },
  { icon: Smartphone, name: "Mobile Apps", description: "iOS & Android" },
  { icon: FileText, name: "Insurance APIs", description: "IRDA Compliant" },
  { icon: Scan, name: "Lab Equipment", description: "HL7/FHIR Standards" },
  { icon: Wifi, name: "IoT Devices", description: "Medical Devices" }
];

const IntegrationsSection = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="module-badge mb-4">Integrations</span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-4 mb-6">
            Seamlessly{" "}
            <span className="hero-gradient-text">Connect Everything</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our HMS integrates with all major healthcare systems, payment gateways, and third-party services used in Indian healthcare.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-card rounded-xl p-5 shadow-soft border border-border/50 text-center hover:border-primary/50 hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <integration.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{integration.name}</h3>
              <p className="text-xs text-muted-foreground">{integration.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-muted-foreground">
            Need a custom integration?{" "}
            <a href="/contact" className="text-primary font-medium hover:underline">
              Talk to our team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
