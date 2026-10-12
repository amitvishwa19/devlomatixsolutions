"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

const chakras = [
    {
        id: "crown",
        name: "Sahasrara",
        english: "Crown Chakra",
        symbol: "ॐ",
        color: "#a855f7",
        element: "Pure Cosmic Consciousness",
        location: "Top of the Head",
        affirmation: "I am connected to the infinite divine source of universal light.",
        symptoms: "Balanced: Deep spiritual peace, wisdom, inner clarity. Blocked: Cynicism, alienation, rigid thinking.",
        crystals: ["Amethyst", "Clear Quartz", "Selenite"],
    },
    {
        id: "thirdeye",
        name: "Ajna",
        english: "Third Eye Chakra",
        symbol: "ॐ",
        color: "#6366f1",
        element: "Intuition & Inner Light",
        location: "Between the Brows",
        affirmation: "I trust my inner vision and honor my deep intuitive knowing.",
        symptoms: "Balanced: Clear visualization, foresight, vivid dreams. Blocked: Mental fog, lack of direction, overthinking.",
        crystals: ["Lapis Lazuli", "Sodalite", "Rainbow Fluorite"],
    },
    {
        id: "throat",
        name: "Vishuddha",
        english: "Throat Chakra",
        symbol: "हं",
        color: "#38bdf8",
        element: "Ether & Sacred Sound",
        location: "Center of the Throat",
        affirmation: "I speak my authentic truth with clarity, kindness, and love.",
        symptoms: "Balanced: Confident self-expression, active listening. Blocked: Fear of speaking, social anxiety, hesitation.",
        crystals: ["Blue Lace Agate", "Turquoise", "Aquamarine"],
    },
    {
        id: "heart",
        name: "Anahata",
        english: "Heart Chakra",
        symbol: "यं",
        color: "#10b981",
        element: "Air & Compassion",
        location: "Center of the Chest",
        affirmation: "I give and receive unconditional love freely and effortlessly.",
        symptoms: "Balanced: Empathy, emotional forgiveness, healthy relationships. Blocked: Jealousy, emotional walls, grief.",
        crystals: ["Rose Quartz", "Green Aventurine", "Malachite"],
    },
    {
        id: "solar",
        name: "Manipura",
        english: "Solar Plexus Chakra",
        symbol: "रं",
        color: "#f59e0b",
        element: "Fire & Willpower",
        location: "Upper Abdomen",
        affirmation: "I am strong, capable, courageous, and stepping into my power.",
        symptoms: "Balanced: Motivation, leadership, financial manifestation. Blocked: Self-doubt, low vitality, inertia.",
        crystals: ["Golden Citrine", "Tiger&apos;s Eye", "Pyrite"],
    },
    {
        id: "sacral",
        name: "Svadhisthana",
        english: "Sacral Chakra",
        symbol: "वं",
        color: "#f97316",
        element: "Water & Creative Flow",
        location: "Lower Abdomen",
        affirmation: "I honor my authentic desires and allow creative joy to flow.",
        symptoms: "Balanced: Passion, artistic inspiration, sensory joy. Blocked: Creative blocks, emotional stagnation.",
        crystals: ["Carnelian", "Orange Calcite", "Sunstone"],
    },
    {
        id: "root",
        name: "Muladhara",
        english: "Root Chakra",
        symbol: "लं",
        color: "#ef4444",
        element: "Earth & Physical Foundation",
        location: "Base of the Spine",
        affirmation: "I am safe, grounded, supported, and anchored to mother Earth.",
        symptoms: "Balanced: Financial security feelings, stability, vital health. Blocked: Chronic worry, instability, survival panic.",
        crystals: ["Black Tourmaline", "Red Jasper", "Smoky Quartz"],
    },
];

export default function ChakraMap() {
    const [selectedChakra, setSelectedChakra] = useState(chakras[0]);

    return (
        <section id="ca-chakra-map" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#090614] border-b border-purple-500/10 relative">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        ✦ Sacred Energy Map ✦
                    </span>
                    <h2 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                        Align Your <span className="text-amethyst-gradient italic">7 Energy</span> Vortices
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto mt-2">
                        Select any sacred chakra below to explore its Sanskrit mantra, balance indications, and perfectly tuned gemstone frequencies.
                    </p>
                </div>

                {/* Interactive Chakra Selector Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3 mb-10">
                    {chakras.map((c) => {
                        const isCurrent = selectedChakra.id === c.id;
                        return (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedChakra(c)}
                                className={`p-3.5 rounded-2xl ca-glass-card flex flex-col items-center text-center transition-all cursor-pointer ${
                                    isCurrent
                                        ? "border-amber-400/60 bg-purple-950/60 shadow-lg -translate-y-1 ring-1 ring-amber-400/30"
                                        : "hover:border-purple-400/40 hover:-translate-y-0.5"
                                }`}
                            >
                                <div
                                    className="h-10 w-10 rounded-full flex items-center justify-center text-base font-bold mb-2 shadow-inner"
                                    style={{
                                        backgroundColor: `${c.color}25`,
                                        color: c.color,
                                        border: `1px solid ${c.color}60`,
                                    }}
                                >
                                    {c.symbol}
                                </div>
                                <span className="text-xs font-bold font-serif-heading text-slate-100 block">
                                    {c.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                    {c.english.replace(" Chakra", "")}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Chakra Spotlight Detail Card */}
                <div className="ca-glass-card rounded-3xl p-6 sm:p-10 border-purple-500/30 shadow-2xl relative overflow-hidden">
                    <div
                        className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl pointer-events-none opacity-20"
                        style={{ backgroundColor: selectedChakra.color }}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                        {/* Left Emblem */}
                        <div className="lg:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl bg-[#0e0920]/70 border border-purple-500/20">
                            <div
                                className="h-24 w-24 rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-xl"
                                style={{
                                    backgroundColor: `${selectedChakra.color}20`,
                                    color: selectedChakra.color,
                                    border: `2px solid ${selectedChakra.color}`,
                                }}
                            >
                                {selectedChakra.symbol}
                            </div>
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                                {selectedChakra.english}
                            </span>
                            <h3 className="text-2xl font-bold font-serif-heading text-slate-100 mt-1">
                                {selectedChakra.name}
                            </h3>
                            <span className="text-xs text-purple-300 mt-0.5">
                                Location: {selectedChakra.location}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5">
                                Element: {selectedChakra.element}
                            </span>
                        </div>

                        {/* Right Content */}
                        <div className="lg:col-span-8 space-y-5">
                            {/* Affirmation */}
                            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20">
                                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                                    Sacred Affirmation Mantra
                                </span>
                                <p className="text-base sm:text-lg font-serif-heading italic text-slate-100 leading-snug">
                                    &ldquo;{selectedChakra.affirmation}&rdquo;
                                </p>
                            </div>

                            {/* Symptoms */}
                            <div className="text-xs text-slate-300 leading-relaxed bg-[#0d091a]/40 p-4 rounded-xl border border-purple-500/10">
                                <span className="font-bold text-purple-200 block mb-1">Energy Diagnosis:</span>
                                {selectedChakra.symptoms}
                            </div>

                            {/* Recommended Stones */}
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2.5">
                                    Resonant Crystals for {selectedChakra.name}:
                                </span>
                                <div className="flex flex-wrap gap-2.5">
                                    {selectedChakra.crystals.map((cr) => (
                                        <a
                                            key={cr}
                                            href="#ca-bestsellers"
                                            className="px-3.5 py-1.5 rounded-xl ca-glass-card hover:border-amber-400/50 text-xs font-semibold text-slate-200 hover:text-amber-300 flex items-center gap-1.5 transition-all group"
                                        >
                                            <Sparkles className="h-3 w-3 text-amber-400" />
                                            <span dangerouslySetInnerHTML={{ __html: cr }} />
                                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
