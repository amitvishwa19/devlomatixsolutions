"use client";

import React, { useState } from "react";
import { Star, ShoppingBag, CheckCircle2 } from "lucide-react";

const productsList = [
    {
        id: "ca-p1",
        name: "Natural Raw Amethyst Geode Cluster",
        category: "Raw Clusters",
        chakra: "Crown Chakra",
        price: 2499,
        originalPrice: 3299,
        rating: 4.9,
        reviews: 124,
        image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=800&fit=crop",
        desc: "Authentic Brazilian deep purple druzy geode for spiritual peace and mental clarity.",
        badge: "Bestseller",
    },
    {
        id: "ca-p2",
        name: "Golden Pyrite Wealth Manifestation Cluster",
        category: "Raw Clusters",
        chakra: "Solar Plexus",
        price: 899,
        originalPrice: 1299,
        rating: 4.8,
        reviews: 98,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=800&fit=crop",
        desc: "Mirror-metallic raw fool&apos;s gold cube cluster renowned for career and financial attraction.",
        badge: "Wealth Magnet",
    },
    {
        id: "ca-p3",
        name: "Madagascar Rose Quartz Energy Sphere",
        category: "Spheres",
        chakra: "Heart Chakra",
        price: 1299,
        originalPrice: 1799,
        rating: 5.0,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&h=800&fit=crop",
        desc: "Translucent pink polished sphere radiating gentle soothing harmony and self-compassion.",
        badge: "Top Rated",
    },
    {
        id: "ca-p4",
        name: "7 Chakra Kundalini Alignment Bracelet",
        category: "Bracelets",
        chakra: "All 7 Chakras",
        price: 699,
        originalPrice: 999,
        rating: 4.9,
        reviews: 210,
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop",
        desc: "8mm seven natural planetary crystals strung on high-tensile stretch cord.",
        badge: "Trending",
    },
    {
        id: "ca-p5",
        name: "Raw Black Tourmaline Protection Nugget",
        category: "Vastu",
        chakra: "Root Chakra",
        price: 499,
        originalPrice: 749,
        rating: 4.8,
        reviews: 85,
        image: "https://images.unsplash.com/photo-1600298882525-c4b2100e1000?w=800&h=800&fit=crop",
        desc: "Pure jet-black striated tourmaline for home entry protection and computer EMF shielding.",
        badge: "EMF Shield",
    },
    {
        id: "ca-p6",
        name: "Natural Golden Citrine Abundance Gem Tree",
        category: "Vastu",
        chakra: "Solar Plexus",
        price: 1599,
        originalPrice: 2199,
        rating: 4.9,
        reviews: 142,
        image: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&h=800&fit=crop",
        desc: "Hand-twisted golden wire bonsai tree featuring 150+ natural citrine crystal leaves.",
        badge: "Vastu Fav",
    },
];

const categories = ["All Sacred Stones", "Raw Clusters", "Spheres", "Bracelets", "Vastu"];

export default function Bestsellers({ onAddToCart }) {
    const [selectedCategory, setSelectedCategory] = useState("All Sacred Stones");
    const [addedIds, setAddedIds] = useState({});

    const filtered = selectedCategory === "All Sacred Stones"
        ? productsList
        : productsList.filter((p) => p.category === selectedCategory);

    const handleAdd = (product) => {
        setAddedIds((prev) => ({ ...prev, [product.id]: true }));
        if (onAddToCart) {
            onAddToCart({
                id: product.id,
                name: product.name.replace(/&apos;/g, "'"),
                price: product.price,
                image: product.image,
            });
        }
        setTimeout(() => {
            setAddedIds((prev) => ({ ...prev, [product.id]: false }));
        }, 2200);
    };

    return (
        <section id="ca-bestsellers" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#090614] to-[#120a24] border-b border-purple-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        ✦ Sacred Vault Collection ✦
                    </span>
                    <h2 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                        Curated Bestselling <span className="text-gold-shimmer italic">Healing Stones</span>
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
                        Every stone is ethically unearthed, lab-verified for purity, and energized through ancient Vedic mantras before transit.
                    </p>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                selectedCategory === cat
                                    ? "btn-gold-gradient text-slate-950 shadow-md shadow-amber-500/30"
                                    : "ca-glass-card text-slate-300 hover:text-amber-300 hover:border-amber-400/40"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filtered.map((item) => {
                        const isAdded = !!addedIds[item.id];
                        return (
                            <div
                                key={item.id}
                                className="ca-glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border-purple-500/20 hover:border-amber-400/40 transition-all duration-300"
                            >
                                <div className="relative h-64 overflow-hidden bg-slate-900/50">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#090614]/80 via-transparent to-transparent" />

                                    {/* Top badges */}
                                    <div className="absolute top-3 left-3 flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow">
                                            {item.badge}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#090614]/85 backdrop-blur-md text-purple-200 border border-purple-500/30">
                                            {item.chakra}
                                        </span>
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-[#090614]/85 px-2 py-0.5 rounded-md border border-amber-500/30">
                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            <span>{item.rating}</span>
                                            <span className="text-slate-400 font-normal">({item.reviews})</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3
                                            className="font-serif-heading text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-1.5"
                                            dangerouslySetInnerHTML={{ __html: item.name }}
                                        />
                                        <p
                                            className="text-xs text-slate-300 leading-relaxed mb-4"
                                            dangerouslySetInnerHTML={{ __html: item.desc }}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-purple-500/10 flex items-center justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sacred Price</span>
                                            <div className="flex items-baseline gap-1.5">
                                                <span className="text-xl font-bold font-serif-heading text-slate-100">
                                                    ₹{item.price}
                                                </span>
                                                <span className="text-xs line-through text-slate-500">
                                                    ₹{item.originalPrice}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleAdd(item)}
                                            className={`px-4 py-2.5 rounded-xl font-serif-heading font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                                                isAdded
                                                    ? "bg-emerald-600 text-white shadow-emerald-600/30"
                                                    : "btn-gold-gradient text-slate-950 shadow-amber-500/20 hover:scale-105"
                                            }`}
                                        >
                                            {isAdded ? (
                                                <>
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    <span>Added!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag className="h-3.5 w-3.5" />
                                                    <span>Add to Cart</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
