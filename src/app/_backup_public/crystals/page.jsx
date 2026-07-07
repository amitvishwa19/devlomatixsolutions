"use client"
import { motion } from "framer-motion";
import { Sun } from "lucide-react";
import { crystalTypes, sunshineCrystals } from "../_data/products";
import SEO from "../_components/SEO";

const CrystalsPage = () => {
  return (
    <div className="pt-20">
      <SEO title="Browse Crystals" description="Explore our curated catalog of healing crystals organized by intent, chakra and energy." path="/crystals" />
      <section className="py-16 text-center">
        <p className="text-gold text-sm mb-2">✦ Crystal Encyclopedia ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4">Healing <span className="text-gold">Crystals</span></h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Explore the unique properties and healing benefits of our curated crystal collection.</p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="glass-card rounded-2xl p-8 md:p-12 mb-12 relative overflow-hidden">
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(40 95% 60%), transparent 70%)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gold/15 text-gold">
                <Sun className="w-6 h-6" />
              </div>
              <p className="text-gold text-sm uppercase tracking-widest">Solar Energy Collection</p>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl mb-3">
              Crystals for <span className="text-gold">Sunshine</span> & Vitality
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              These warm, radiant stones channel the energy of the sun — perfect for boosting mood,
              confidence, abundance and inner light, especially on grey or low-energy days.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {sunshineCrystals.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-xl overflow-hidden bg-card border border-border hover:border-gold/50 transition-colors group"
                >
                  <div className="overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-serif text-lg font-semibold">{c.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-gold border border-gold/40 rounded-full px-2 py-0.5">
                        {c.benefit}
                      </span>
                    </div>
                    <p className="text-xs text-gold mb-2">{c.chakra} Chakra</p>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="font-serif text-3xl md:text-4xl mb-8 text-center">
          Full <span className="text-gold">Collection</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {crystalTypes.map((crystal, i) => (
            <motion.div key={crystal.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass-card rounded-xl overflow-hidden group">
              <div className="overflow-hidden"><img src={crystal.image} alt={crystal.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" /></div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold mb-1">{crystal.name}</h3>
                <p className="text-xs text-gold mb-2">{crystal.chakra} Chakra</p>
                <p className="text-sm text-muted-foreground">{crystal.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CrystalsPage;