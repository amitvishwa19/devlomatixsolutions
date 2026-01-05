'use client'
import { useState } from 'react';
import { Menu, X, Sun, Moon, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AppointmentDialog from '../AppointmentDialog';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/assets/images/logo/logo.png'
import { usePathname } from 'next/navigation';
import ThemeSwitcher from '@/components/global/ThemeSwitch';
import { AuthSelector } from '@/components/global/AuthSelector';

const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/feature' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
];

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const path = usePathname()

    console.log(path)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <Image src={logo} alt='logo' height={30} />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                path === link.path
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-3">
                    <ThemeSwitcher />
                    <AppointmentDialog>
                        <Button variant='default' size="default">
                            Book Appointment
                        </Button>
                    </AppointmentDialog>
                    <AuthSelector />
                </div>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden items-center gap-2">
                    <ThemeSwitcher />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(!isOpen)}
                        className="rounded-xl"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden border-t border-border bg-background animate-slide-up">
                    <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                    // location.pathname === link.path
                                    //     ? "bg-accent text-accent-foreground"
                                    //     : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                {link.name}
                            </Link>

                        ))}
                        <AppointmentDialog>
                            <Button variant='default' size='sm' className="mt-2 w-full">
                                Book Appointment
                            </Button>
                        </AppointmentDialog>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
