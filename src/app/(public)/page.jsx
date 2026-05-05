"use client"
import React from "react";
import SEO from "./_components/SEO";
import { categories, testimonials } from "./_data/products";
import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Truck, Compass, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import CrystalOfTheDay from "./_components/CrystalOfTheDay";
import QuizSection from "./_components/QuizSection";
import ChakraDiagram from "./_components/ChakraDiagram";
import PersonalizedPicks from "./_components/PersonalizedPicks";
import RecentlyViewed from "./_components/RecentlyViewed";

const instagramImages = [
  "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600298882525-c4b2100e1000?w=400&h=400&fit=crop",
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  return (
    <div>
      <SEO
        title="Authentic Healing Crystals & Gemstones"
        description="Shop ethically-sourced healing crystals, gemstones & Vastu stones online in India. Pan-India delivery, expert guidance, INR pricing."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: "CrystalAura",
          url: "https://crystalaura.lovable.app/",
          image: "https://crystalaura.lovable.app/og-image.jpg",
          priceRange: "₹₹",
          address: { "@type": "PostalAddress", addressCountry: "IN" },
        }}
      />
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1920&h=1080&fit=crop)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-8">
              <Sparkles className="w-4 h-4 text-gold mr-2" /> Healing Energy &
              Spiritual Wellness <Sparkles className="w-4 h-4 text-gold ml-2" />
            </Badge>
          </motion.div>
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-4"
          >
            <span className="text-gold">Crystal</span> Aura
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-2xl md:text-3xl italic text-muted-foreground mb-6"
          >
            & Sacred Stones
          </motion.p>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Discover authentic gemstones, crystal bracelets, healing spheres,
            and spiritual pyramids — handpicked to align your energy and elevate
            your spirit.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg">
              <Link href="/shop">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">
                Our Story
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      <section className="border-y border-border py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">✦ 100% Authentic</span>
          <span className="flex items-center gap-2">✦ Free Shipping 999+</span>
          <span className="flex items-center gap-2">✦ Vastu Guidance</span>
        </div>
      </section>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="text-muted-foreground text-sm mb-2">Our Collection</p>
            <h2 className="font-serif text-3xl md:text-4xl">
              Sacred <span className="text-gold">Treasures</span>
            </h2>
            <Link
              href="/shop"
              className="inline-block mt-4 text-sm text-gold hover:underline"
            >
              View All
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/shop?category=${cat.slug}`}>
                  <Card className="group overflow-hidden hover:border-primary/30 transition-all">
                    <div className="relative overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium">View</span>
                      </div>
                      <Badge variant="secondary" className="absolute top-3 right-3">
                        From ₹{cat.startingPrice.toLocaleString()}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-serif font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cat.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="text-muted-foreground text-sm mb-2">Why Choose Us</p>
            <h2 className="font-serif text-3xl md:text-4xl">
              The Crystal Aura <span className="text-gold">Promise</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "100% Authentic",
                desc: "Every crystal is naturally sourced and certified genuine",
              },
              {
                icon: Sparkles,
                title: "Energetically Cleansed",
                desc: "Each stone is purified with sage and moonlight before shipping",
              },
              {
                icon: Truck,
                title: "Pan-India Delivery",
                desc: "Secure packaging with free shipping on orders above ₹999",
              },
              {
                icon: Compass,
                title: "Vastu Guidance",
                desc: "Complimentary consultation on crystal placement & energy flow",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <item.icon className="w-10 h-10 text-gold mx-auto mb-4" />
                    <h3 className="font-serif text-lg font-semibold mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <CrystalOfTheDay />
      <QuizSection />
      <ChakraDiagram />
      <PersonalizedPicks />
      <RecentlyViewed />
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="text-muted-foreground text-sm mb-2">Testimonials</p>
            <h2 className="font-serif text-3xl md:text-4xl">
              Blessed <span className="text-gold">Experiences</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-gold fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground text-sm italic mb-4">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-secondary text-gold font-semibold">
                          {t.initial}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.location}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="text-gold text-sm mb-2">✦ Follow Our Journey ✦</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-3">
              @crystalaura on <span className="text-gold">Instagram</span>
            </h2>
            <p className="text-muted-foreground">
              Daily crystal inspiration, behind-the-scenes, and spiritual
              wisdom.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {instagramImages.map((img, i) => (
              <motion.a
                key={i}
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-lg aspect-square"
              >
                <img
                  src={img}
                  alt={`Instagram post ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm">
                    ♥ 250
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Follow us on Instagram
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
