import { motion } from "framer-motion";
import { TrendingUp, Clock, Users, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormModal from "../ContactFormModal";


const caseStudies = [
  {
    hospital: "Apollo Multi-Specialty Hospital",
    location: "Mumbai, Maharashtra",
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format",
    stats: [
      { label: "Billing Errors Reduced", value: "40%", icon: TrendingUp },
      { label: "Patient Wait Time", value: "-35%", icon: Clock },
    ],
    quote: "CareWell HMS transformed our operations. We now process 3x more patients with fewer staff.",
    author: "Dr. Rajesh Sharma",
    role: "Chief Administrator",
  },
  {
    hospital: "Fortis Care Center",
    location: "Ahmedabad, Gujarat",
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format",
    stats: [
      { label: "Revenue Increase", value: "28%", icon: TrendingUp },
      { label: "Staff Efficiency", value: "+45%", icon: Users },
    ],
    quote: "The pharmacy and pathology integration alone saved us 15 hours per week in manual work.",
    author: "Mrs. Priya Patel",
    role: "Operations Head",
  },
  {
    hospital: "KIMS Hospital Network",
    location: "Hyderabad, Telangana",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&auto=format",
    stats: [
      { label: "Hospitals Connected", value: "12", icon: Building2 },
      { label: "Monthly Patients", value: "50K+", icon: Users },
    ],
    quote: "Scaling to 12 locations was seamless with CareWell's multi-branch support.",
    author: "Mr. Venkat Rao",
    role: "IT Director",
  },
];

const CaseStudiesSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real Results from Real Hospitals
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how leading healthcare institutions across India transformed their operations with CareWell HMS
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.hospital}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-secondary/30 rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={study.image}
                  alt={study.hospital}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="font-bold text-foreground text-lg mb-1">{study.hospital}</h3>
                <p className="text-sm text-muted-foreground mb-4">{study.location}</p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {study.stats.map((stat) => (
                    <div key={stat.label} className="bg-background rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <stat.icon className="h-4 w-4 text-primary" />
                        <span className="font-bold text-foreground text-lg">{stat.value}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <blockquote className="text-sm text-muted-foreground italic border-l-2 border-primary/50 pl-4 mb-4">
                  "{study.quote}"
                </blockquote>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">{study.author[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{study.author}</p>
                    <p className="text-xs text-muted-foreground">{study.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <ContactFormModal>
            <Button size="lg" className="group">
              Get Your Success Story Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </ContactFormModal>
        </motion.div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
