"use client"
import { motion } from "framer-motion";
import { Compass, Home, Gem, Shield, Sun, Wind } from "lucide-react";
import SEO from "../_components/SEO";

const vastuTips = [
  { icon: Home, title: "Entrance & Living Room", description: "Place clear quartz near the entrance to invite positive energy. A citrine crystal in the living room attracts abundance and warmth.", crystals: "Clear Quartz, Citrine, Green Aventurine" },
  { icon: Sun, title: "Bedroom & Sleep", description: "Amethyst under your pillow promotes peaceful sleep. Rose quartz on your bedside table enhances love and harmony.", crystals: "Amethyst, Rose Quartz, Lepidolite" },
  { icon: Compass, title: "North-East Direction", description: "The most auspicious direction in Vastu. Place a crystal pyramid or clear quartz cluster here for spiritual growth.", crystals: "Clear Quartz Pyramid, Selenite" },
  { icon: Shield, title: "Protection & EMF", description: "Black tourmaline near electronic devices protects against EMF radiation. Place at all four corners for complete protection.", crystals: "Black Tourmaline, Shungite, Obsidian" },
  { icon: Wind, title: "Office & Study", description: "Tiger eye on your desk enhances focus and determination. Fluorite helps with concentration and decision-making.", crystals: "Tiger Eye, Fluorite, Pyrite" },
  { icon: Gem, title: "Wealth & Prosperity", description: "Place a citrine crystal tree in the south-east direction to activate the wealth corner according to Vastu Shastra.", crystals: "Citrine, Pyrite, Green Jade" },
];

const VastuPage = () => {
  return (
    <div className="pt-20">
      <SEO title="Vastu Crystals for Your Home" description="Place crystals correctly in your home with our Vastu guide. Bring harmony, prosperity and protection to every room." path="/vastu" />
      <section className="py-16 text-center">
        <p className="text-gold text-sm mb-2">✦ Sacred Placement ✦</p>
        <h1 className="font-serif text-5xl md:text-7xl mb-4"><span className="text-gold">Vastu</span> Guidance</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">Learn how to place crystals in your home and office according to Vastu Shastra for maximum positive energy flow.</p>
        <div className="w-20 h-1 bg-gold mx-auto mt-6 rounded-full" />
      </section>
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vastuTips.map((tip, i) => (
            <motion.div key={tip.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass-card rounded-xl p-6">
              <tip.icon className="w-10 h-10 text-gold mb-4" />
              <h3 className="font-serif text-lg font-semibold mb-2">{tip.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{tip.description}</p>
              <p className="text-xs text-gold">Recommended: {tip.crystals}</p>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 glass-card rounded-2xl p-10 text-center">
          <h2 className="font-serif text-2xl md:text-3xl mb-4">Need Personalized <span className="text-gold">Vastu Consultation?</span></h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Our Vastu experts can analyze your space and recommend the perfect crystal placement for harmony, prosperity, and protection.</p>
          <a href="https://wa.me/919876543210?text=Hi!%20I%20need%20a%20Vastu%20consultation%20for%20crystal%20placement." target="_blank" rel="noopener noreferrer" className="inline-block gold-gradient text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">Book Free Consultation</a>
        </motion.div>
      </section>
    </div>
  );
};

export default VastuPage;