'use client';

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCart, useWishlist } from "../_context/CrystalAuraProviders";
import { products as allProducts } from "../_data/products";

// Inline SVG Icons
const HeartIcon = ({ className = "w-4 h-4", fill = "none" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const EyeIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);

const ShoppingBagIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

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
      className="group cursor-pointer flex flex-col justify-between h-full"
    >
      <div className="relative overflow-hidden rounded-2xl mb-4 bg-white/[0.03] border border-white/5 aspect-square">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-[#06040a]/40 opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Wishlist heart */}
        {id && (
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 left-3 p-2 rounded-full glass border border-white/10 transition-all duration-300 hover:scale-110 z-10"
            aria-label="Toggle Wishlist"
          >
            <HeartIcon
              className={`w-4 h-4 transition-colors ${
                wishlisted ? "text-primary" : "text-white"
              }`}
              fill={wishlisted ? "currentColor" : "none"}
            />
          </button>
        )}

        {/* Quick action buttons */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 flex gap-2">
          <div className="flex-1 glass rounded-xl text-white py-3 text-[10px] font-sans tracking-[0.2em] font-black uppercase hover:bg-primary/20 transition-all duration-300 flex items-center justify-center gap-2 border border-white/10">
            <EyeIcon className="w-4 h-4" />
            <span>View</span>
          </div>
          {id && (
            <button
              onClick={handleAddToCart}
              className="w-12 glass rounded-xl border border-white/10 text-primary py-3 hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center"
              aria-label="Add to Cart"
            >
              <ShoppingBagIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-[#06040a]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-primary font-serif text-xs font-bold shadow-lg">
          ₹{price.toLocaleString()}
        </div>
      </div>
      <div className="px-1 text-center mt-2">
        <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-[10px] mt-1 font-bold line-clamp-1 uppercase tracking-widest">{description}</p>
      </div>
    </motion.div>
  );

  if (id) {
    return <Link href={`/shop/${id}`}>{cardContent}</Link>;
  }

  return cardContent;
};

export default ProductCard;
