'use client';

import React from "react";
import ProductCard from "./ProductCard";
import { products } from "../_data/products";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ProductsSection = () => {
  const featured = products.slice(0, 8);

  return (
    <section className="py-28 px-6 relative bg-background/50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <p className="text-primary text-xs font-medium mb-4">
              Our Collection
            </p>
            <h2 className="font-serif text-4xl md:text-6xl text-foreground">
              Sacred <span className="text-gold-gradient font-semibold">Treasures</span>
            </h2>
          </div>
          <Link href="/crystalaura/shop">
            <Button variant="outline" className="border-white/10 text-foreground font-medium text-sm hover:bg-white/5 hover:border-white/20 group py-6 px-8 rounded-xl transition-all duration-300">
              View All
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {featured.map((product, index) => (
            <ProductCard key={product.id} {...product} delay={index * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
