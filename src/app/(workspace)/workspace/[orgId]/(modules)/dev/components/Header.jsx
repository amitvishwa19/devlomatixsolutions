
import { motion } from 'framer-motion';
import { Code2, Home, LayoutTemplate, Sparkles, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/templates', label: 'Templates', icon: LayoutTemplate },
    { path: '/ai-generate', label: 'AI Generate', icon: Sparkles },
];

const Header = () => {

    const [isDark, setIsDark] = useState(false);

    // useEffect(() => {
    //   const isDarkMode = document.documentElement.classList.contains('dark');
    //   setIsDark(isDarkMode);
    // }, []);

    // const toggleTheme = () => {
    //   const newIsDark = !isDark;
    //   setIsDark(newIsDark);
    //   document.documentElement.classList.toggle('dark', newIsDark);
    // };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full group-hover:bg-primary/50 transition-colors" />
                        <div className="relative p-2 rounded-xl gradient-primary">
                            <Code2 className="w-6 h-6 text-primary-foreground" />
                        </div>
                    </div>
                    <span className="font-bold text-xl gradient-text">ModuleGen</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link href={item.path} to={item.path}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        'relative gap-2 px-4',
                                        isActive && 'text-primary'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{item.label}</span>

                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                                        />
                                    )}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>


            </div>
        </header>
    );
};

export default Header;
