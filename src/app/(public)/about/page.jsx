"use client"
import { motion } from "framer-motion";
import { Gem, Users, MapPin, Award } from "lucide-react";
import SEO from "../_components/SEO";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const AboutPage = () => {
  return (
    <div className="pt-20">
      <SEO title="Our Story" description="CrystalAura is a Mumbai-based boutique offering ethically-sourced healing crystals & gemstones across India." path="/about" />
      <section className="py-16 text-center">
        <p className="text-gold text-sm mb-2">✦ Our Journey ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4">
          About <span className="text-gold">Crystal Aura</span>
        </h1>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <motion.div {...fadeUp} className="glass-card rounded-2xl p-10 md:p-16 mb-16">
          <blockquote className="font-serif text-2xl md:text-3xl italic text-center text-muted-foreground leading-relaxed mb-12">
            "Crystal Aura was born from a deep love for the earth's hidden treasures
            and a sacred mission to heal world through frequency."
          </blockquote>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <p className="text-muted-foreground leading-relaxed">
              We are a team of crystal healers, Vastu consultants, and spiritual
              practitioners based in Mumbai, India — dedicated to bringing you the
              most authentic and energetically powerful gemstones.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is simple: to make the healing power of crystals
              accessible to everyone. Whether you're a seasoned practitioner or
              just beginning your spiritual journey, we're here to guide you.
            </p>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Gem, value: "5,000+", label: "Crystals Sourced" },
            { icon: Users, value: "10,000+", label: "Happy Customers" },
            { icon: MapPin, value: "500+", label: "Cities Served" },
            { icon: Award, value: "3+", label: "Years of Trust" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 text-center"
            >
              <stat.icon className="w-8 h-8 text-gold mx-auto mb-3" />
              <p className="font-serif text-2xl font-bold text-gold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;