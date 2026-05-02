'use client';

import React, { useState, useEffect } from "react";
import { Gem, ShoppingBag, Menu, X, Heart, Sun, Moon, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, useWishlist, useTheme } from "../_context/CrystalAuraProviders";

const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "Crystals", path: "/crystals" },
    { label: "Vastu", path: "/vastu" },
    { label: "Blog", path: "/blog" },
    { label: "FAQ", path: "/faq" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
];

const Navbar = () => {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { totalItems, setIsOpen } = useCart();
    const { items: wishlistItems } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Sync mobile menu close with pathname changes
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "glass border-b border-white/10 shadow-lg"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <Gem className="w-6 h-6 text-primary transition-transform duration-300 group-hover:rotate-12" />
                        <div className="absolute inset-0 blur-lg bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <span className="font-serif text-2xl shimmer-text font-semibold">Crystal Aura</span>
                </Link>

                <ul className="hidden lg:flex items-center gap-1 text-sm font-sans tracking-wide">
                    {navLinks.map((link) => (
                        <li key={link.path}>
                            <Link
                                href={link.path}
                                className={`relative px-3 py-2 rounded-full transition-all duration-300 ${pathname === link.path
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                {link.label}
                                {pathname === link.path && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                                        transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                    />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    {/* <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button> */}

                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className="relative p-2.5 rounded-full bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                        <Heart className="w-4 h-4" />
                        {wishlistItems?.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {wishlistItems.length}
                            </span>
                        )}
                    </Link>

                    {/* Orders */}
                    <Link
                        href="/orders"
                        className="hidden sm:flex p-2.5 rounded-full bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                        <History className="w-4 h-4" />
                    </Link>

                    {/* Cart */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative p-2.5 rounded-full bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 group"
                    >
                        <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        {totalItems > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold-gradient text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg"
                            >
                                {totalItems}
                            </motion.span>
                        )}
                    </button>

                    <button
                        className="lg:hidden p-2.5 rounded-full bg-white/5 text-foreground hover:bg-primary/10 transition-all duration-300"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="lg:hidden glass border-b border-white/10 overflow-hidden"
                    >
                        <ul className="flex flex-col gap-1 px-6 py-4 text-sm font-sans tracking-wide">
                            {navLinks.map((link, i) => (
                                <motion.li
                                    key={link.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={link.path}
                                        className={`block py-3 px-4 rounded-lg transition-all duration-300 ${pathname === link.path
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
