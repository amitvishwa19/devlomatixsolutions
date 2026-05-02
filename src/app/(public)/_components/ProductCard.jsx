'use client';

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Eye, Heart } from "lucide-react";
import { useCart, useWishlist } from "../_context/CrystalAuraProviders";
import { products as allProducts } from "../_data/products";
import { Badge } from "@/components/ui/badge";

const ProductCard = ({ id, image, title, description, price, delay = 0 }) => {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const product = id ? allProducts.find((p) => p.id === id) : undefined;
  const wishlisted = id ? isWishlisted(id) : false;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) addItem(product);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product) toggleWishlist(product);
  };

  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-2xl mb-4 bg-white/[0.03] border border-white/5">
        <img
          src={image}
          alt={title}
          className="w-full aspect-square object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Wishlist heart */}
        {id && (
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 left-3 p-2 rounded-full glass border border-white/10 transition-all duration-300 hover:scale-110 z-10"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-destructive text-destructive" : "text-white"}`} />
          </button>
        )}

        {/* Quick action buttons */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 flex gap-2">
          <div className="flex-1 glass rounded-xl text-white py-3 text-xs font-medium hover:bg-primary/20 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10">
            <Eye className="w-4 h-4" />
            View
          </div>
          {id && (
            <button
              onClick={handleAddToCart}
              className="w-12 glass rounded-xl border border-white/10 text-primary py-3 hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="glass border-white/10 text-primary font-serif text-sm px-3 py-1">
            {price}
          </Badge>
        </div>
      </div>
      <div className="px-1 text-center">
        <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-xs mt-1 font-light line-clamp-1">{description}</p>
      </div>
    </motion.div>
  );

  if (id) {
    return <Link href={`/crystalaura/shop/${id}`}>{cardContent}</Link>;
  }

  return cardContent;
};

export default ProductCard;
