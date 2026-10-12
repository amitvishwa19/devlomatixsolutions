"use client";

import React, { useState } from "react";
import { ArrowRight, ArrowLeft, RotateCcw, CheckCircle2, ShoppingBag } from "lucide-react";

const quizQuestions = [
    {
        id: "zodiac",
        title: "What is your primary Zodiac sign?",
        subtitle: "Astrological mineral frequencies harmonize with your planetary alignment",
        type: "grid",
        options: [
            { value: "aries", label: "Aries", symbol: "♈" },
            { value: "taurus", label: "Taurus", symbol: "♉" },
            { value: "gemini", label: "Gemini", symbol: "♊" },
            { value: "cancer", label: "Cancer", symbol: "♋" },
            { value: "leo", label: "Leo", symbol: "♌" },
            { value: "virgo", label: "Virgo", symbol: "♍" },
            { value: "libra", label: "Libra", symbol: "♎" },
            { value: "scorpio", label: "Scorpio", symbol: "♏" },
            { value: "sagittarius", label: "Sagittarius", symbol: "♐" },
            { value: "capricorn", label: "Capricorn", symbol: "♑" },
            { value: "aquarius", label: "Aquarius", symbol: "♒" },
            { value: "pisces", label: "Pisces", symbol: "♓" },
        ],
    },
    {
        id: "intention",
        title: "What is your primary life intention right now?",
        subtitle: "Crystals act as energetic tuning forks for your conscious intentions",
        type: "list",
        options: [
            { value: "abundance", label: "💰 Abundance, Career Success & Wealth", desc: "Attract prosperity and business growth" },
            { value: "love", label: "💖 Unconditional Love, Harmony & Healing", desc: "Open heart chakra and attract soulmates" },
            { value: "protection", label: "🛡️ Grounding, Psychic Shield & Ward EMF", desc: "Deflect negativity and anchor safety" },
            { value: "calm", label: "🧘 Deep Tranquility, Stress Relief & Sleep", desc: "Quiet the mind and enhance relaxation" },
            { value: "spiritual", label: "✨ Spiritual Intuition, Clarity & Vision", desc: "Open third eye and higher awareness" },
        ],
    },
    {
        id: "color",
        title: "Which sacred color vibration draws you most strongly?",
        subtitle: "Color rays directly correspond with your active chakra biofield",
        type: "list",
        options: [
            { value: "purple", label: "💜 Deep Royal Violet", desc: "Sahasrara Crown Chakra — Spiritual Wisdom" },
            { value: "pink", label: "💗 Gentle Rose Quartz Pink", desc: "Anahata Heart Chakra — Self-Compassion" },
            { value: "gold", label: "💛 Radiant Citrine Gold", desc: "Manipura Solar Plexus — Personal Power" },
            { value: "black", label: "🖤 Dense Tourmaline Charcoal", desc: "Muladhara Root Chakra — Deep Protection" },
            { value: "green", label: "💚 Emerald Aventurine Green", desc: "Heart Chakra — Abundance & Opportunity" },
        ],
    },
    {
        id: "energy",
        title: "How would you describe your mental & physical energy today?",
        subtitle: "Helps us pinpoint whether you need grounding, stimulating, or soothing minerals",
        type: "list",
        options: [
            { value: "tired", label: "⚡ Low Vitality / Feeling Depleted", desc: "Need energizing and solar activation" },
            { value: "anxious", label: "🌀 Racing Mind / Overstimulated", desc: "Need grounding and emotional calm" },
            { value: "seeking", label: "🧭 Seeking Direction & Clarity", desc: "Need intuitive third-eye focus" },
            { value: "balanced", label: "🍃 Peaceful / Ready to Manifest", desc: "Ready to amplify existing vibrations" },
        ],
    },
    {
        id: "placement",
        title: "Where will your sacred crystal primarily reside?",
        subtitle: "Environmental placement determines resonance and field coverage",
        type: "list",
        options: [
            { value: "bedroom", label: "🌙 Bedroom / Nightstand", desc: "For peaceful sleep, dream recall, and romantic harmony" },
            { value: "office", label: "💼 Office Desk / Workspace", desc: "For concentration, career wealth, and EMF protection" },
            { value: "altar", label: "🧘 Meditation Altar / Sacred Space", desc: "For deepening daily mindfulness and prayer rituals" },
            { value: "body", label: "📿 On the Body / Pocket or Jewelry", desc: "Continuous 24/7 personal biofield resonance" },
        ],
    },
];

const crystalRecommendations = {
    abundance: {
        name: "Golden Pyrite Wealth Cluster & Citrine",
        tagline: "The Master Manifestation & Financial Magnet",
        matchPercent: 98,
        chakra: "Solar Plexus & Sacral",
        price: 899,
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=800&fit=crop",
        desc: "Known as &apos;Fool&apos;s Gold&apos; for its shimmering brassy luster, Pyrite is revered worldwide as the stone of ultimate abundance, business prosperity, and confidence.",
        affirmation: "Wealth and opportunity flow effortlessly into my life.",
    },
    love: {
        name: "Madagascar Natural Rose Quartz Sphere",
        tagline: "The Universal Stone of Gentle Love & Forgiveness",
        matchPercent: 99,
        chakra: "Anahata Heart Chakra",
        price: 1299,
        image: "https://images.unsplash.com/photo-1615529328331-f8917597711f?w=800&h=800&fit=crop",
        desc: "Rose Quartz emits a soothing, loving frequency that melts emotional armor, fosters self-acceptance, and attracts authentic soulmate connections.",
        affirmation: "I am deserving of unconditional love and harmony.",
    },
    protection: {
        name: "Raw Black Tourmaline Grounding Nugget",
        tagline: "The Ultimate Psychic Shield & EMF Neutralizer",
        matchPercent: 97,
        chakra: "Muladhara Root Chakra",
        price: 499,
        image: "https://images.unsplash.com/photo-1600298882525-c4b2100e1000?w=800&h=800&fit=crop",
        desc: "Black Tourmaline creates an impenetrable energetic boundary around your aura, converting negative thoughts and electromagnetic smog into neutral light.",
        affirmation: "I am safe, anchored, and divinely protected at all times.",
    },
    calm: {
        name: "Deep Violet Brazilian Amethyst Geode",
        tagline: "The Divine Tranquility & Third Eye Beacon",
        matchPercent: 98,
        chakra: "Sahasrara Crown Chakra",
        price: 699,
        image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=800&fit=crop",
        desc: "Amethyst elevates mental frequency beyond worry and insomnia, instilling profound serene calmness and deep meditative awareness.",
        affirmation: "My mind is peaceful, still, and centered in grace.",
    },
    spiritual: {
        name: "Lapis Lazuli & Selenite Sacred Duo",
        tagline: "The Gateway to High Intuition & Truth",
        matchPercent: 96,
        chakra: "Ajna Third Eye & Crown",
        price: 999,
        image: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60?w=800&h=800&fit=crop",
        desc: "Lapis Lazuli has been sacred to Pharaohs and Yogis for millennia, stimulating intellectual vision and direct connection with higher spiritual realms.",
        affirmation: "I trust the universe and walk forward in spiritual truth.",
    },
};

export default function CrystalQuiz({ onAddToCart }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isComplete, setIsComplete] = useState(false);
    const [added, setAdded] = useState(false);

    const handleSelect = (questionId, value) => {
        const nextAnswers = { ...answers, [questionId]: value };
        setAnswers(nextAnswers);

        if (currentStep < quizQuestions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setIsComplete(true);
        }
    };

    const handleReset = () => {
        setAnswers({});
        setCurrentStep(0);
        setIsComplete(false);
        setAdded(false);
    };

    const selectedIntention = answers.intention || "abundance";
    const recommended = crystalRecommendations[selectedIntention] || crystalRecommendations.abundance;

    const handleClaim = () => {
        setAdded(true);
        if (onAddToCart) {
            onAddToCart({
                id: `quiz-match-${selectedIntention}`,
                name: recommended.name.replace(/&apos;/g, "'"),
                price: recommended.price,
                image: recommended.image,
            });
        }
        setTimeout(() => setAdded(false), 2500);
    };

    return (
        <section id="ca-quiz" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#110a22] to-[#090614] border-b border-purple-500/10 relative">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        ✦ Interactive Alignment ✦
                    </span>
                    <h2 className="mt-3 font-serif-heading text-3xl sm:text-4xl lg:text-5xl text-slate-100">
                        Discover Your <span className="text-gold-shimmer italic">Sacred Gemstone</span> Match
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-2">
                        Answer 5 intuitive questions to reveal the exact mineral vibration that aligns with your astrological chart and spiritual goals.
                    </p>
                </div>

                {!isComplete ? (
                    <div className="ca-glass-card rounded-3xl p-6 sm:p-10 border-purple-500/30 shadow-2xl relative">
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between text-xs text-purple-300 mb-2">
                                <span>Question {currentStep + 1} of {quizQuestions.length}</span>
                                <span>{Math.round(((currentStep + 1) / quizQuestions.length) * 100)}% Aligned</span>
                            </div>
                            <div className="h-1.5 w-full bg-purple-950 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-amber-300 transition-all duration-300"
                                    style={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Current Question */}
                        <div className="mb-8">
                            <h3 className="font-serif-heading text-xl sm:text-2xl text-slate-100 font-bold mb-1">
                                {quizQuestions[currentStep].title}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {quizQuestions[currentStep].subtitle}
                            </p>
                        </div>

                        {/* Options */}
                        {quizQuestions[currentStep].type === "grid" ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {quizQuestions[currentStep].options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(quizQuestions[currentStep].id, opt.value)}
                                        className="p-3 rounded-2xl ca-glass-card hover:border-amber-400/60 hover:bg-purple-950/50 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
                                    >
                                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{opt.symbol}</span>
                                        <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {quizQuestions[currentStep].options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(quizQuestions[currentStep].id, opt.value)}
                                        className="w-full p-4 rounded-2xl ca-glass-card hover:border-amber-400/60 hover:bg-purple-950/50 flex items-center justify-between text-left transition-all cursor-pointer group"
                                    >
                                        <div>
                                            <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 block">
                                                {opt.label}
                                            </span>
                                            {opt.desc && (
                                                <span className="text-xs text-slate-400 block mt-0.5">
                                                    {opt.desc}
                                                </span>
                                            )}
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-purple-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 ml-3" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Navigation back */}
                        {currentStep > 0 && (
                            <div className="mt-8 pt-4 border-t border-purple-500/10">
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1.5"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    <span>Previous Question</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Result Card */
                    <div className="ca-glass-card rounded-3xl p-6 sm:p-10 border-amber-400/40 shadow-2xl relative overflow-hidden">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-3">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>{recommended.matchPercent}% Biofield Alignment Detected</span>
                            </div>
                            <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100">
                                Your Resonant Sacred Crystal:
                            </h3>
                            <p className="text-xs text-amber-300 mt-1 uppercase tracking-wider font-semibold">
                                {recommended.tagline}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                            <div className="relative h-64 rounded-2xl overflow-hidden border border-purple-500/30">
                                <img
                                    src={recommended.image}
                                    alt={recommended.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 left-3 bg-[#090614]/85 px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-amber-500/30">
                                    {recommended.chakra}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-serif-heading text-xl sm:text-2xl font-bold text-slate-100" dangerouslySetInnerHTML={{ __html: recommended.name }} />
                                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: recommended.desc }} />

                                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/20">
                                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Recommended Affirmation Mantra</span>
                                    <p className="text-xs font-serif-heading italic text-slate-200">
                                        &ldquo;{recommended.affirmation}&rdquo;
                                    </p>
                                </div>

                                <div className="flex items-baseline gap-2 pt-2">
                                    <span className="text-xs text-slate-400">Sacred Price:</span>
                                    <span className="text-2xl font-bold font-serif-heading text-slate-100">₹{recommended.price}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-purple-500/20">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="text-xs text-slate-400 hover:text-purple-300 flex items-center gap-1.5 cursor-pointer order-2 sm:order-1"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                <span>Retake Energy Quiz</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleClaim}
                                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-serif-heading font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl order-1 sm:order-2 ${
                                    added
                                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                                        : "btn-gold-gradient text-slate-950 shadow-amber-500/30 hover:scale-105"
                                }`}
                            >
                                {added ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Added to Sacred Cart!</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="h-4 w-4" />
                                        <span>Claim Your Resonant Stone</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
