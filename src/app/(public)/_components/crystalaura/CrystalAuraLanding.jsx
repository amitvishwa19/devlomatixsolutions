"use client";

import React, { useState } from "react";
import "./crystalaura.css";
import Navbar from "./Navbar";
import Hero from "./Hero";
import VibrantBanner from "./VibrantBanner";
import CrystalOfTheDay from "./CrystalOfTheDay";
import ChakraMap from "./ChakraMap";
import CrystalQuiz from "./CrystalQuiz";
import BraceletCalculator from "./BraceletCalculator";
import Bestsellers from "./Bestsellers";
import VastuGuide from "./VastuGuide";
import Reviews from "./Reviews";
import FAQ from "./FAQ";
import Newsletter from "./Newsletter";
import Footer from "./Footer";
import { ShoppingBag, X, CheckCircle2, ArrowRight } from "lucide-react";

export default function CrystalAuraLanding({ onClose }) {
    const [cartItems, setCartItems] = useState([
        {
            id: "initial-amethyst",
            name: "Raw Brazilian Amethyst Geode Cluster",
            price: 699,
            image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&h=800&fit=crop",
            quantity: 1,
        },
    ]);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkedOut, setCheckedOut] = useState(false);

    const handleAddToCart = (product) => {
        setCartItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.id === product.id);
            if (existingIndex > -1) {
                const next = [...prev];
                next[existingIndex].quantity += 1;
                return next;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleRemove = (id) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalAmount = cartItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

    return (
        <div className="crystalaura-site min-h-screen text-slate-100 bg-[#090614] antialiased selection:bg-purple-600 selection:text-white relative">
            <Navbar
                onClose={onClose}
                cartCount={totalCartCount}
                onOpenCart={() => setCartOpen(true)}
            />

            <main>
                <Hero />
                <VibrantBanner />
                <CrystalOfTheDay onAddToCart={handleAddToCart} />
                <ChakraMap />
                <CrystalQuiz onAddToCart={handleAddToCart} />
                <BraceletCalculator onAddToCart={handleAddToCart} />
                <Bestsellers onAddToCart={handleAddToCart} />
                <VastuGuide />
                <Reviews />
                <FAQ />
                <Newsletter />
            </main>

            <Footer />

            {/* Sacred Cart Drawer Overlay */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-[#0e0920] border-l border-purple-500/30 p-6 flex flex-col justify-between shadow-2xl h-full overflow-y-auto">
                        <div>
                            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20 mb-6">
                                <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-amber-400" />
                                    <h3 className="font-serif-heading text-lg font-bold text-slate-100">
                                        Your Sacred Cart ({totalCartCount})
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCartOpen(false);
                                        setCheckedOut(false);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-purple-950/40"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="text-center py-16 text-slate-400">
                                    <span className="text-4xl block mb-3">✧</span>
                                    <p className="text-sm">Your sacred cart is currently empty.</p>
                                    <button
                                        type="button"
                                        onClick={() => setCartOpen(false)}
                                        className="mt-4 px-4 py-2 rounded-xl btn-gold-gradient text-xs font-bold text-slate-950"
                                    >
                                        Explore Sacred Vault
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="p-3.5 rounded-xl ca-glass-card flex items-center justify-between gap-3 border-purple-500/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-12 w-12 rounded-lg object-cover shrink-0 border border-purple-500/20"
                                                />
                                                <div>
                                                    <h4 className="font-serif-heading text-xs font-bold text-slate-100 line-clamp-1">
                                                        {item.name}
                                                    </h4>
                                                    <span className="text-[11px] text-purple-300">
                                                        ₹{item.price} × {item.quantity}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemove(item.id)}
                                                className="text-xs text-rose-400 hover:text-rose-300 p-1"
                                                title="Remove"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="pt-6 border-t border-purple-500/20 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Total Investment:</span>
                                    <span className="text-2xl font-bold font-serif-heading text-slate-50">
                                        ₹{totalAmount}
                                    </span>
                                </div>

                                <div className="text-[11px] text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40 flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                                    <span>Complimentary Sacred Ganga Cleansing &amp; Insured Transit</span>
                                </div>

                                {checkedOut ? (
                                    <div className="p-4 rounded-xl bg-purple-950/60 border border-amber-400/40 text-center space-y-1">
                                        <div className="text-xs font-bold text-amber-300 font-serif-heading">
                                            ✦ Sacred Order Blessing Initiated!
                                        </div>
                                        <p className="text-[11px] text-slate-300">
                                            Your stones are being prepared under Vedic astrological coordinates.
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setCheckedOut(true)}
                                        className="w-full py-3.5 rounded-xl btn-gold-gradient font-serif-heading font-bold text-sm text-slate-950 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        <span>Proceed to Sacred Checkout</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
