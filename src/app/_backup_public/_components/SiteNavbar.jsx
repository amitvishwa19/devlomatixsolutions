'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart, useWishlist, useTheme } from "../_context/CrystalAuraProviders";

// Inline SVG Icon components to completely bypass Next.js Turbopack lucide-react caching bugs
const ShoppingBagIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

const MenuIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const HeartIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const SunIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);

const MoonIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const ChevronDownIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);

const GlobeIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

const UserIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const navItems = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { 
        label: "Discover", 
        submenu: [
            { label: "Crystal Guide", path: "/crystals" },
            { label: "Vastu Stones", path: "/vastu" },
        ] 
    },
    { 
        label: "Resources", 
        submenu: [
            { label: "Blog", path: "/blog" },
            { label: "FAQ", path: "/faq" },
        ] 
    },
    { 
        label: "About Us", 
        submenu: [
            { label: "Our Story", path: "/about" },
            { label: "Contact", path: "/contact" },
        ] 
    },
];

const SiteNavbar = () => {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { totalItems, setIsOpen } = useCart();
    const { items: wishlistItems } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setActiveDropdown(null);
    }, [pathname]);

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "glass border-b border-primary/20 shadow-lg shadow-primary/5 py-3"
                : "bg-transparent border-b border-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group relative">
                    <span className="font-serif text-2xl md:text-3xl font-semibold text-foreground tracking-widest relative">
                      CRYSTAL<span className="text-primary-foreground text-gold-gradient font-black">AURA</span>
                      <span className="absolute bottom-[-4px] left-0 w-0 h-[1.5px] bg-gold-gradient transition-all duration-500 group-hover:w-full" />
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <ul className="hidden md:flex items-center gap-1.5 text-xs font-sans tracking-[0.18em] uppercase font-bold">
                    {navItems.map((item, idx) => {
                        if (item.submenu) {
                            const isOpen = activeDropdown === idx;
                            return (
                                <li 
                                    key={item.label}
                                    className="relative"
                                    onMouseEnter={() => setActiveDropdown(idx)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button
                                        className={`flex items-center gap-1 px-4 py-2.5 rounded-lg transition-all duration-300 hover:bg-white/5 ${
                                            item.submenu.some(sub => sub.path === pathname)
                                                ? "text-primary font-black"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        {item.label}
                                        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 mt-1.5 w-52 rounded-xl border border-white/10 glass shadow-2xl p-2.5 flex flex-col gap-1"
                                                style={{ boxShadow: '0 10px 40px -10px rgba(220,160,40,0.15)' }}
                                            >
                                                {item.submenu.map((subItem) => (
                                                    <Link
                                                        key={subItem.path}
                                                        href={subItem.path}
                                                        className={`px-4 py-3 rounded-lg text-[10px] tracking-widest transition-colors duration-200 ${
                                                            pathname === subItem.path
                                                                ? "text-primary bg-primary/10 font-black"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                                        }`}
                                                    >
                                                        {subItem.label}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </li>
                            );
                        }

                        return (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    className={`px-4 py-2.5 rounded-lg transition-all duration-300 block ${
                                        pathname === item.path
                                            ? "text-primary bg-primary/10 font-black"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* Right Side Icons */}
                <div className="flex items-center gap-2">
                    {/* Currency Indicator */}
                    <button className="text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-[10px] font-sans tracking-widest font-black uppercase px-3 py-2 rounded-xl border border-white/10 hover:border-primary/40 bg-white/5 mr-1 hover:shadow-lg hover:shadow-primary/5 active:scale-95">
                        <GlobeIcon className="w-3.5 h-3.5 text-primary" />
                        <span>INR</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? <SunIcon className="w-4.5 h-4.5" /> : <MoonIcon className="w-4.5 h-4.5" />}
                    </button>

                    {/* Wishlist */}
                    <Link
                        href="/wishlist"
                        className="relative p-2.5 rounded-xl bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                        aria-label="Wishlist"
                    >
                        <HeartIcon className="w-4.5 h-4.5" />
                        {wishlistItems?.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-destructive text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md">
                                {wishlistItems.length}
                            </span>
                        )}
                    </Link>

                    {/* Cart */}
                    <button
                        onClick={() => setIsOpen(true)}
                        className="relative p-2.5 rounded-xl bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary border border-white/5 hover:border-primary/20 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                        aria-label="Open cart"
                    >
                        <ShoppingBagIcon className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110" />
                        {totalItems > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-gold-gradient text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg"
                            >
                                {totalItems}
                            </motion.span>
                        )}
                    </button>

                    {/* User Profile */}
                    <button
                        className="p-2.5 rounded-xl bg-white/5 text-foreground hover:bg-primary/10 hover:text-primary border border-white/5 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-95"
                        aria-label="User menu"
                    >
                        <UserIcon className="w-4.5 h-4.5" />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2.5 rounded-xl bg-white/5 text-foreground hover:bg-primary/10 border border-white/5 transition-all duration-300"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <XIcon className="w-4.5 h-4.5" /> : <MenuIcon className="w-4.5 h-4.5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden glass border-b border-white/10 overflow-hidden"
                    >
                        <ul className="flex flex-col gap-1.5 px-6 py-5 text-[10px] tracking-widest uppercase font-bold">
                            {navItems.map((item) => {
                                if (item.submenu) {
                                    return (
                                        <li key={item.label} className="py-2">
                                            <span className="block px-4 py-1 text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 font-black">
                                                {item.label}
                                            </span>
                                            <ul className="flex flex-col gap-1.5 mt-1.5 pl-4 border-l border-white/5">
                                                {item.submenu.map((subItem) => (
                                                    <li key={subItem.path}>
                                                        <Link
                                                            href={subItem.path}
                                                            className={`block py-2.5 px-4 rounded-lg transition-all duration-300 ${
                                                                pathname === subItem.path
                                                                    ? "text-primary bg-primary/10 font-black"
                                                                    : "text-muted-foreground hover:text-foreground"
                                                            }`}
                                                        >
                                                            {subItem.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    );
                                }

                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            className={`block py-3 px-4 rounded-lg transition-all duration-300 ${
                                                pathname === item.path
                                                    ? "text-primary bg-primary/10 font-black"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default SiteNavbar;
