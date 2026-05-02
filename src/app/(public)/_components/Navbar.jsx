'use client';

import React, { useState, useEffect } from "react";
import { Gem, ShoppingBag, Menu, X, Heart, History, User, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useCart, useWishlist } from "../_context/CrystalAuraProviders";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    const { data: session, status } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { totalItems, setIsOpen } = useCart();
    const { items: wishlistItems } = useWishlist();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const user = session?.user;
    const userName = user?.displayName || user?.name || "Account";
    const userEmail = user?.email || "";
    const userAvatar = user?.avatar || user?.image;
    const userInitial = (userName || userEmail || "U").charAt(0).toUpperCase();
    const isLoggedIn = status === "authenticated";

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

                    {isLoggedIn && (
                        <Link
                            href="/account"
                            className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pathname === "/account"
                                ? "text-primary bg-primary/10"
                                : "text-foreground bg-white/5 hover:bg-primary/10 hover:text-primary"
                                }`}
                        >
                            <User className="w-4 h-4" />
                            Account
                        </Link>
                    )}

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

                    {isLoggedIn && (
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-2 py-1.5 text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0 data-[state=open]:bg-primary/10 data-[state=open]:text-primary"
                                    aria-label="Open account menu"
                                >
                                    <Avatar className="h-8 w-8 border border-white/10">
                                        <AvatarImage src={userAvatar} alt={userName} />
                                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-64 border-white/10 bg-[#121214] text-white shadow-2xl"
                            >
                                <DropdownMenuLabel className="flex items-center gap-3 p-3">
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={userAvatar} alt={userName} />
                                        <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                                            {userInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold">{userName}</p>
                                        {userEmail && (
                                            <p className="truncate text-xs font-normal text-white/55">{userEmail}</p>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white">
                                    <Link href="/account" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Account
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem
                                    onSelect={() => signOut({ callbackUrl: "/" })}
                                    className="cursor-pointer text-red-300 focus:bg-red-500/10 focus:text-red-200"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

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
                                        onClick={() => setMobileOpen(false)}
                                        className={`block py-3 px-4 rounded-lg transition-all duration-300 ${pathname === link.path
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.li>
                            ))}
                            {isLoggedIn && (
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: navLinks.length * 0.05 }}
                                >
                                    <Link
                                        href="/account"
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${pathname === "/account"
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                            }`}
                                    >
                                        <User className="w-4 h-4" />
                                        Account
                                    </Link>
                                </motion.li>
                            )}
                            {isLoggedIn && (
                                <motion.li
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: (navLinks.length + 1) * 0.05 }}
                                    className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={userAvatar} alt={userName} />
                                            <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                                                {userInitial}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
                                            {userEmail && (
                                                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => signOut({ callbackUrl: "/" })}
                                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/20 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </button>
                                </motion.li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
