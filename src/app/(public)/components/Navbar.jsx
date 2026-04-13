'use client'
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import logo from '@/app/(public)/assets/acs_logo_1_nobg.png'
import ThemeSwitcher from "@/components/global/ThemeSwitch";
import { useSession } from "next-auth/react";
import { AppLogo } from "@/components/global/AppLogo";


const serviceLinks = [
    { name: "Web Development", href: "/services#web" },
    { name: "Mobile Apps", href: "/services#mobile" },
    { name: "Cloud Solutions", href: "/services#cloud" },
    { name: "UI/UX Design", href: "/services#design" },
    { name: "All Services", href: "/services" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const servicesRef = useRef(null);
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession()
    console.log(pathname)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (servicesRef.current && !servicesRef.current.contains(e.target)) {
                setServicesOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Services", href: "/service", hasDropdown: false },
        { name: "Projects", href: "/project" },
        { name: "Case Studies", href: "/casestudy" },
        { name: "Articles", href: "/article" },
        { name: "About", href: "/about" },
        { name: "Careers", href: "/career" },
        { name: "Contact", href: "/contact" },
    ];

    const isActive = (href) => pathname === href;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-3">
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                    "container mx-auto rounded-2xl transition-all duration-500 ease-out border",
                    scrolled
                        ? "bg-background/80 backdrop-blur-2xl border border-border/50 shadow-xl shadow-primary/5"
                        : "bg-transparent border border-transparent shadow-none "
                )}
            >
                <div className="px-4 py-2.5 flex items-center justify-between">
                    {/* Left: Logo */}
                    <motion.div whileHover={{ scale: 1.02 }} className="shrink-0">
                        <AppLogo link='/' size={200} height={80} width={180} />
                    </motion.div>

                    {/* Center: Nav Links */}
                    <div className="hidden md:flex items-center gap-0.5">
                        {navLinks.map((link) =>
                            link.hasDropdown ? (
                                <div key={link.name} className="relative" ref={servicesRef}>
                                    <button
                                        onClick={() => setServicesOpen(!servicesOpen)}
                                        className={cn(
                                            "relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1",
                                            isActive(link.href)
                                                ? "text-primary"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {isActive(link.href) && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10"
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">{link.name}</span>
                                        <ChevronDown
                                            className={cn(
                                                "relative z-10 w-3.5 h-3.5 transition-transform duration-200",
                                                servicesOpen && "rotate-180"
                                            )}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {servicesOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                className="absolute top-full left-0 mt-2 w-52 z-50 rounded-xl bg-popover border border-border shadow-lg shadow-black/10 overflow-hidden"
                                            >
                                                <div className="py-1.5">
                                                    {serviceLinks.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            onClick={() => setServicesOpen(false)}
                                                            className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={cn(
                                        "relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300",
                                        isActive(link.href)
                                            ? "text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {isActive(link.href) && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 rounded-full border border-primary/30 bg-primary/10"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.name}</span>
                                </Link>
                            )
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* <ThemeToggle /> */}
                        {/* <ThemeSwitcher /> */}

                        {session ? (
                            <Link href="/workspace">
                                <button variant="outline" size="sm" className="rounded-full h-9 px-5 text-sm  border border-primary/30 bg-primary/10 item-center justify-center hover:bg-primary/20 hover:text-primary cursor-pointer">
                                    Workspace
                                </button>
                            </Link>
                        ) : (

                            <Link href="/login">
                                <button variant="ghost" size="sm" className="rounded-full h-9 px-5 text-sm  border border-primary/30 bg-primary/10 item-center justify-center hover:bg-primary/20 hover:text-primary cursor-pointer">
                                    Login
                                </button>
                            </Link>
                        )}

                    </div>

                    {/* Mobile */}
                    <div className="flex md:hidden items-center gap-3">
                        {/* <ThemeToggle /> */}
                        <button className="text-foreground" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="md:hidden px-4 pb-4 border-t border-border/30 pt-3 flex flex-col gap-1"
                    >
                        {navLinks.map((link) =>
                            link.hasDropdown ? (
                                <div key={link.name}>
                                    <button
                                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-sm font-medium rounded-full transition-all flex items-center justify-between",
                                            isActive(link.href)
                                                ? "bg-primary/10 text-primary border border-primary/30"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {link.name}
                                        <ChevronDown
                                            className={cn(
                                                "w-4 h-4 transition-transform duration-200",
                                                mobileServicesOpen && "rotate-180"
                                            )}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {mobileServicesOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="pl-4 mt-1 flex flex-col gap-0.5"
                                            >
                                                {serviceLinks.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => { setIsOpen(false); setMobileServicesOpen(false); }}
                                                        className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-full transition-colors"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "px-4 py-2.5 text-sm font-medium rounded-full transition-all",
                                        isActive(link.href)
                                            ? "bg-primary/10 text-primary border border-primary/30"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            )
                        )}
                        <div className="flex gap-2 mt-3">
                            <Link to="/auth" onClick={() => setIsOpen(false)} className="flex-1">
                                <Button variant="outline" className="w-full rounded-full">Login</Button>
                            </Link>
                            <Link to="/consultation" onClick={() => setIsOpen(false)} className="flex-1">
                                <Button variant="hero" className="w-full rounded-full">Get Started</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </motion.nav>
        </div>
    );
};

export default Navbar;
