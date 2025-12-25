import { Button } from "@/components/ui/button";
import {
    Hospital,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: "Features", href: "#features" },
        { name: "Modules", href: "#modules" },
        { name: "Benefits", href: "#benefits" },
        { name: "Users", href: "#users" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Hospital className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="font-display font-bold text-lg md:text-xl text-foreground">
                            HMS<span className="text-primary">Pro</span>
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <Button variant="ghost" size="sm">
                            Sign In
                        </Button>
                        <Button variant="hero" size="sm">
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5 text-foreground" />
                        ) : (
                            <Menu className="w-5 h-5 text-foreground" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex flex-col gap-2 mt-4 px-4">
                                <Button variant="outline" className="w-full">
                                    Sign In
                                </Button>
                                <Button variant="hero" className="w-full">
                                    Get Started
                                </Button>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
