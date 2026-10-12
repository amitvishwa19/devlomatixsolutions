"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        q: "How are CrystalAura stones energized and cleansed before dispatch?",
        a: "Every single specimen is purified under holy Ganges water in Rishikesh, smudged with sacred Himalayan white sage and organic dhoop, and consecrated with ancient Vedic planetary chants. This removes foreign human imprint frequencies so your crystal arrives in a virgin, highly active energetic state.",
    },
    {
        q: "How do I know these crystals are 100% natural and not dyed glass?",
        a: "We work directly with certified ethical geological mines in Brazil, Madagascar, India, and Peru. Each batch undergoes strict gemological refractive index, density, and microscopic crystal lattice testing. We provide an authenticity guarantee certificate with every single shipment.",
    },
    {
        q: "How should I cleanse and recharge my crystals once they arrive?",
        a: "We recommend bathing your crystals under full moonlight for an overnight charge, smudging them with frankincense or sage, or simply resting them atop a raw Selenite charging plate for 4 to 6 hours. We also include a complimentary printed ritual guide in every order.",
    },
    {
        q: "Which sacred crystal is best for a complete beginner?",
        a: "For newcomers, we strongly recommend starting with either a Raw Amethyst Geode (for calming a stressed mind and enhancing sleep), a Natural Rose Quartz Sphere (for emotional healing and soft self-love), or a 7 Chakra Alignment Bracelet for everyday whole-body balance.",
    },
    {
        q: "How is fragile mineral packaging handled during shipping?",
        a: "Natural crystals feature delicate druzy points and cleavage planes. We package each item with triple-layer shock-absorbent custom foam, heavy-duty padded enclosures, and sacred jute wrappers. All shipments are fully insured against transit damage.",
    },
    {
        q: "Can I wear multiple crystal bracelets simultaneously on the same wrist?",
        a: "Yes! Many stones amplify each other synergistically. For example, wearing Black Tourmaline (root protection) alongside Golden Pyrite (solar abundance) creates a dynamic shield that deflects negative drained energy while attracting new financial opportunities.",
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section id="ca-faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#090614] border-b border-purple-500/10 relative">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        ✦ Sacred Knowledge ✦
                    </span>
                    <h2 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                        Frequently Asked <span className="text-gold-shimmer italic">Questions</span>
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
                        Everything you need to know about crystal origins, Ganga cleansing, gem testing, and home rituals.
                    </p>
                </div>

                {/* Collapsible FAQ list */}
                <div className="space-y-4">
                    {faqs.map((faq, i) => {
                        const isOpen = openIndex === i;
                        return (
                            <div
                                key={i}
                                className={`rounded-2xl ca-glass-card transition-all duration-300 overflow-hidden ${
                                    isOpen
                                        ? "border-amber-400/50 bg-[#120a26] shadow-xl shadow-purple-950/30"
                                        : "hover:border-purple-400/30"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer transition-colors"
                                >
                                    <span className="font-serif-heading text-sm sm:text-base font-bold text-slate-100 pr-4">
                                        {faq.q}
                                    </span>
                                    <span
                                        className={`shrink-0 h-7 w-7 rounded-xl flex items-center justify-center transition-colors ${
                                            isOpen
                                                ? "bg-amber-400 text-slate-950"
                                                : "bg-purple-950/80 text-purple-300"
                                        }`}
                                    >
                                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    </span>
                                </button>
                                {isOpen && (
                                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm leading-relaxed text-slate-300 border-t border-purple-500/10 pt-4 font-normal">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
