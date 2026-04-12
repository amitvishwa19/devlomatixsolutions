import ThemeSwitcher from '@/components/global/ThemeSwitch'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function Navbar() {
    return (

        <nav className="sticky top-0 z-50 glass border-b border-border/50">
            <div className="px-20 flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Briefcase className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-gradient-sun font-heading">HireFlow</span>
                </div>
                <div className="hidden items-center gap-8 md:flex">
                    <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                    <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                    <a href="#comparison" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Compare</a>
                    <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
                    <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                    <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
                </div>
                <div className="flex items-center gap-3">
                    {/* <ThemeToggle /> */}
                    <ThemeSwitcher />
                    <Link href="/admin">
                        <Button variant="ghost" size="sm">Login</Button>
                    </Link>
                    <Link href="/admin">
                        <Button size="sm" className="shadow-lg" style={{ boxShadow: "var(--shadow-glow)" }}>Start Free Trial</Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
