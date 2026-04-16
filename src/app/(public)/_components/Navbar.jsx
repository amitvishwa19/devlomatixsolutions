'use client'
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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

                    </div>

                    {/* Right: Actions */}
                    <div className="hidden md:flex items-center gap-2">
                        {/* <ThemeToggle /> */}
                        {/* <ThemeSwitcher /> */}

                        {session && (
                            session.user.role === 'ADMIN' ||
                            session.user.role === 'SUPERADMIN' ||
                            session.user.roles?.some(role => role.title === 'workspace')
                        ) ? (
                            <Link href="/workspace">
                                <button variant="outline" size="sm" className="rounded-full h-9 px-5 text-sm  border border-primary/30 bg-primary/10 item-center justify-center hover:bg-primary/20 hover:text-primary cursor-pointer">
                                    Workspace
                                </button>
                            </Link>
                        ) : !session ? (
                            <Link href="/login">
                                <button variant="ghost" size="sm" className="rounded-full h-9 px-5 text-sm  border border-primary/30 bg-primary/10 item-center justify-center hover:bg-primary/20 hover:text-primary cursor-pointer">
                                    Login
                                </button>
                            </Link>
                        ) : null}

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
                        className="md:hidden px-4 pb-4 border-t border-border/30 pt-3 flex flex-col gap-1 bg-card rounded-lg border"
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
                                    href={link.href}
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
                            {session && (
                                session.user.role === 'admin' ||
                                session.user.role === 'superadmin' ||
                                session.user.role === 'super-admin' ||
                                session.user.roles?.some(role => role.title === 'workspace')
                            ) ? (
                                <Link href="/workspace" onClick={() => setIsOpen(false)} className="flex-1">
                                    <Button variant="outline" className="w-full rounded-full">Workspace</Button>
                                </Link>
                            ) : !session ? (
                                <Link href="/login" onClick={() => setIsOpen(false)} className="flex-1">
                                    <Button variant="outline" className="w-full rounded-full">Login</Button>
                                </Link>
                            ) : null}
                            <Link href="/contact" onClick={() => setIsOpen(false)} className="flex-1">
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
