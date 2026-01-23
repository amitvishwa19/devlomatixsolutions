'use client'
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X, LayoutGrid, LogOut } from "lucide-react";
import carewellLogo from "@/assets/images/logo/logo.png";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ThemeToggle from "./ThemeToggle";
import ContactFormModal from "./ContactFormModal";
import Link from "next/link";
import ThemeSwitcher from "@/components/global/ThemeSwitch";
import { usePathname } from "next/navigation";
import { AuthSelector } from "@/components/global/AuthSelector";
import BookDemoModal from "./BookDemoModal";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/feature" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Articles", href: "/article" },
    { name: "Contact", href: "/contact" },
];

// Mock user data - replace with actual auth state
const mockUser = {
    name: "Amit Vishwakarma",
    email: "amitvishwa19@gmail.com",
    initials: "A",
};

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const path = usePathname()

    console.log('path', path)

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
        >
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <img src={carewellLogo.src} alt="CareWell" className="h-8 md:h-12" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = path === link.href || path.startsWith(link.href + "/");
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors ${isActive
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeSwitcher />
                        <BookDemoModal>
                            <Button variant="outline" className="rounded-lg">
                                Book Demo
                            </Button>
                        </BookDemoModal>
                        <ContactFormModal title="Get Started">
                            <Button className="hero-gradient text-primary-foreground rounded-lg shadow-glow hover:shadow-xl transition-all">
                                Let's get started
                            </Button>
                        </ContactFormModal>

                        {/* Auth Dropdown */}
                        <AuthSelector />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? (
                            <X className="w-6 h-6 text-foreground" />
                        ) : (
                            <Menu className="w-6 h-6 text-foreground" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden py-4 border-t border-border"
                    >
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.href;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className={`px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? "text-primary bg-accent"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                            <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                                <div className="flex items-center justify-between px-4 py-2">
                                    <span className="text-sm text-muted-foreground">Theme</span>
                                    <ThemeToggle />
                                </div>
                                <Button variant="ghost" className="w-full justify-start">
                                    Log In
                                </Button>
                                <ContactFormModal title="Get Started">
                                    <Button className="hero-gradient text-primary-foreground w-full">
                                        Get Started
                                    </Button>
                                </ContactFormModal>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
};

export default Header;
