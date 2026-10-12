"use client";

import React, { useState } from "react";
import { ShoppingBag, CheckCircle2, Sparkles } from "lucide-react";

const chakraOptions = [
    { value: "crown", label: "Crown — Spiritual Connection", color: "#a855f7" },
    { value: "thirdEye", label: "Third Eye — Intuition & Insight", color: "#6366f1" },
    { value: "throat", label: "Throat — Clear Communication", color: "#38bdf8" },
    { value: "heart", label: "Heart — Love & Healing", color: "#10b981" },
    { value: "solar", label: "Solar Plexus — Willpower & Wealth", color: "#f59e0b" },
    { value: "sacral", label: "Sacral — Passion & Creativity", color: "#f97316" },
    { value: "root", label: "Root — Grounding & Safety", color: "#ef4444" },
];

const intentionOptions = [
    { value: "abundance", label: "Wealth & Prosperity", icon: "💰" },
    { value: "love", label: "Love & Relationships", icon: "💖" },
    { value: "protection", label: "Psychic Shield & Protection", icon: "🛡️" },
    { value: "calm", label: "Deep Stress Relief & Peace", icon: "🧘" },
    { value: "energy", label: "Physical Vitality & Drive", icon: "⚡" },
    { value: "spiritual", label: "Spiritual Awakening", icon: "✨" },
];

const beadSizes = [
    { size: "8mm", desc: "Delicate & light, ideal for daily wrist layering" },
    { size: "10mm", desc: "Classic standard size, balanced weight & aura field" },
    { size: "12mm", desc: "Substantial statement beads with intense mineral mass" },
];

const calculatedBracelets = {
    abundance: {
        name: "Triple Prosperity Pyrite & Citrine Bracelet",
        beads: "10mm Natural Golden Pyrite + Grade-A Heat-Treated Citrine",
        price: 799,
        originalPrice: 1199,
        image: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&h=600&fit=crop",
        desc: "Combines the financial magnetism of Pyrite with the solar activation of Citrine. Charged under Lakshmi mantra for abundance.",
    },
    love: {
        name: "Madagascar Rose Quartz & Rhodochrosite Bracelet",
        beads: "8mm High-Grade Translucent Rose Quartz + Strawberry Quartz",
        price: 699,
        originalPrice: 999,
        image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&h=600&fit=crop",
        desc: "Deeply harmonizes the heart center, dissolving past emotional wounds and radiating soft, magnetic unconditional love.",
    },
    protection: {
        name: "Triple Shield Black Tourmaline & Hematite Bracelet",
        beads: "10mm Jet-Black Tourmaline + Magnetic Hematite + Tiger's Eye",
        price: 649,
        originalPrice: 899,
        image: "https://images.unsplash.com/photo-1600298882525-c4b2100e1000?w=600&h=600&fit=crop",
        desc: "The ultimate grounding trinity. Creates a personal perimeter against environmental EMF, psychic vampirism, and evil eye.",
    },
    calm: {
        name: "Deep Peace Amethyst & Sodalite Mala Bracelet",
        beads: "8mm Natural Purple Amethyst + Blue Sodalite Druzy",
        price: 599,
        originalPrice: 849,
        image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=600&fit=crop",
        desc: "Soothes an overactive sympathetic nervous system, inducing tranquil sleep, reduced tension, and clear meditative awareness.",
    },
    energy: {
        name: "Solar Sunstone & Red Carnelian Vitality Bracelet",
        beads: "10mm Shimmering Sunstone + Banded Orange Carnelian",
        price: 749,
        originalPrice: 1049,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=600&fit=crop",
        desc: "Ignites the inner fire of the Sacral and Solar Plexus chakras, stimulating physical vitality, enthusiasm, and courage.",
    },
    spiritual: {
        name: "7 Chakra Kundalini Alignment Sacred Bracelet",
        beads: "8mm 7 Natural Gemstones + Lava Grounding Diffuser Beads",
        price: 699,
        originalPrice: 999,
        image: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=600&h=600&fit=crop",
        desc: "Features authentic Amethyst, Sodalite, Turquoise, Green Aventurine, Tiger's Eye, Carnelian, and Red Jasper in perfect harmonic sequence.",
    },
};

export default function BraceletCalculator({ onAddToCart }) {
    const [selectedChakra, setSelectedChakra] = useState("heart");
    const [selectedIntention, setSelectedIntention] = useState("love");
    const [selectedBeadSize, setSelectedBeadSize] = useState("10mm");
    const [added, setAdded] = useState(false);

    const match = calculatedBracelets[selectedIntention] || calculatedBracelets.abundance;

    const handleAdd = () => {
        setAdded(true);
        if (onAddToCart) {
            onAddToCart({
                id: `bracelet-${selectedIntention}-${selectedBeadSize}`,
                name: `${match.name} (${selectedBeadSize})`,
                price: match.price,
                image: match.image,
            });
        }
        setTimeout(() => setAdded(false), 2500);
    };

    return (
        <section id="ca-calculator" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#090614] border-b border-purple-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        ✦ Sacred Wristwear ✦
                    </span>
                    <h2 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                        Custom Crystal <span className="text-gold-shimmer italic">Bracelet Matcher</span>
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
                        Configure your target chakra, intention, and bead size to generate your customized Vedic healing bracelet.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Interactive Selectors */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* 1. Target Chakra */}
                        <div className="ca-glass-card rounded-2xl p-6 border-purple-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-3">
                                1. Select Primary Chakra to Balance:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {chakraOptions.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => setSelectedChakra(c.value)}
                                        className={`p-2.5 rounded-xl text-left text-xs font-medium flex items-center gap-2.5 transition-all cursor-pointer ${
                                            selectedChakra === c.value
                                                ? "bg-purple-950/70 border border-amber-400/50 text-slate-100 ring-1 ring-amber-400/20 shadow-md"
                                                : "bg-[#0d091a]/50 border border-purple-500/10 text-slate-300 hover:border-purple-400/30"
                                        }`}
                                    >
                                        <span
                                            className="h-3 w-3 rounded-full shrink-0"
                                            style={{ backgroundColor: c.color }}
                                        />
                                        <span>{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Primary Intention */}
                        <div className="ca-glass-card rounded-2xl p-6 border-purple-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-3">
                                2. Select Your Conscious Life Intention:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                {intentionOptions.map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => setSelectedIntention(item.value)}
                                        className={`p-3 rounded-xl text-center text-xs font-medium transition-all cursor-pointer ${
                                            selectedIntention === item.value
                                                ? "bg-purple-950/70 border border-amber-400/50 text-slate-100 ring-1 ring-amber-400/20 shadow-md"
                                                : "bg-[#0d091a]/50 border border-purple-500/10 text-slate-300 hover:border-purple-400/30"
                                        }`}
                                    >
                                        <span className="text-lg block mb-1">{item.icon}</span>
                                        <span className="block leading-snug">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Bead Size */}
                        <div className="ca-glass-card rounded-2xl p-6 border-purple-500/20">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-3">
                                3. Choose Natural Bead Size:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {beadSizes.map((b) => (
                                    <button
                                        key={b.size}
                                        type="button"
                                        onClick={() => setSelectedBeadSize(b.size)}
                                        className={`p-3 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                            selectedBeadSize === b.size
                                                ? "bg-purple-950/70 border border-amber-400/50 text-slate-100 ring-1 ring-amber-400/20 shadow-md"
                                                : "bg-[#0d091a]/50 border border-purple-500/10 text-slate-300 hover:border-purple-400/30"
                                        }`}
                                    >
                                        <span className="font-bold font-serif-heading text-sm text-amber-300 block">
                                            {b.size}
                                        </span>
                                        <span className="text-[11px] text-slate-400 block mt-0.5 leading-tight">
                                            {b.desc}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Matched Recommendation Result */}
                    <div className="lg:col-span-5 ca-glass-card rounded-3xl p-6 sm:p-8 border-amber-400/40 shadow-2xl sticky top-24">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>100% Calculated Harmonic Match</span>
                        </div>

                        <div className="relative h-60 rounded-2xl overflow-hidden mb-5 border border-purple-500/30">
                            <img
                                src={match.image}
                                alt={match.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-3 right-3 bg-[#090614]/80 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-300 border border-amber-500/30">
                                Size: {selectedBeadSize}
                            </div>
                        </div>

                        <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-slate-100 mb-2">
                            {match.name}
                        </h3>

                        <p className="text-xs text-purple-300 font-medium mb-3">
                            ✦ {match.beads}
                        </p>

                        <p className="text-xs text-slate-300 leading-relaxed mb-6 font-normal">
                            {match.desc}
                        </p>

                        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/20 mb-6 space-y-1.5 text-xs text-slate-300">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Elasticity:</span>
                                <span className="font-semibold text-purple-200">Japanese 4-Core Stretch Cord</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Purification:</span>
                                <span className="font-semibold text-emerald-300">Ganga Cleansed &amp; Smudged</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Wrist Fit:</span>
                                <span className="font-semibold text-purple-200">Comfort Unisex (6.5&quot; - 7.5&quot;)</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                            <div>
                                <span className="text-[11px] text-slate-400 block">Direct Sacred Price</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold font-serif-heading text-slate-50">₹{match.price}</span>
                                    <span className="text-xs line-through text-slate-500">₹{match.originalPrice}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAdd}
                                className={`px-6 py-3 rounded-xl font-serif-heading font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                                    added
                                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                                        : "btn-gold-gradient text-slate-950 shadow-amber-500/30 hover:scale-105"
                                }`}
                            >
                                {added ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Added to Cart!</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-4 w-4" />
                                        <span>Order Custom Bracelet</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
