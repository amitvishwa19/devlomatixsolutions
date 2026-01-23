import { motion } from "framer-motion";

const clients = [
  { name: "Apollo Hospitals", logo: "A" },
  { name: "Fortis Healthcare", logo: "F" },
  { name: "Max Healthcare", logo: "M" },
  { name: "KIMS Hospital", logo: "K" },
  { name: "Narayana Health", logo: "N" },
  { name: "Manipal Hospitals", logo: "M" },
  { name: "Medanta", logo: "M" },
  { name: "Aster DM", logo: "A" },
];

const ClientsSection = () => {
  return (
    <section className="py-16 bg-background border-y border-border/50">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <p className="text-muted-foreground font-medium">
            Trusted by 500+ Healthcare Institutions Across India
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {clients.map((client, index) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">{client.logo}</span>
              </div>
              <span className="font-medium text-foreground/80 text-sm md:text-base">
                {client.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientsSection;
