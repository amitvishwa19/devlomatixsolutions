import { motion } from "framer-motion";
import { Shield, CheckCircle, Lock, Award } from "lucide-react";

const certifications = [
  {
    name: "HIPAA",
    fullName: "Health Insurance Portability & Accountability",
    icon: Shield,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "NABH",
    fullName: "National Accreditation Board for Hospitals",
    icon: Award,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    name: "ABDM",
    fullName: "Ayushman Bharat Digital Mission",
    icon: CheckCircle,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    name: "ISO 27001",
    fullName: "Information Security Management",
    icon: Lock,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const ComplianceSection = () => {
  return (
    <section className="py-16 bg-secondary/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Trusted & Certified
          </h3>
          <p className="text-muted-foreground text-sm">
            Our HMS meets the highest healthcare compliance standards
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 min-w-[140px]"
            >
              <div className={`w-14 h-14 rounded-xl ${cert.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <cert.icon className={`h-7 w-7 ${cert.color}`} />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-lg">{cert.name}</p>
                <p className="text-xs text-muted-foreground max-w-[120px] leading-tight mt-1">
                  {cert.fullName}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
