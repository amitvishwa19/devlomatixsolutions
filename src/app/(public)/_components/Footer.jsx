import { Briefcase, Github, Heart, Linkedin, Twitter } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function Footer() {
    return (
        <footer className="border-t border-border/50 p-16">
            <div className="">
                <div className="grid gap-12 md:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                                <Briefcase className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-gradient-sun font-heading">HireFlow</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">The modern ATS built for teams that want to hire smarter and faster.</p>
                        <div className="flex gap-3">
                            <Link href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <Twitter className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <Github className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4 font-heading">Product</h4>
                        <ul className="space-y-2">
                            {["Features", "Pricing", "Integrations", "Changelog", "Roadmap"].map((link) => (
                                <li key={link}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4 font-heading">Company</h4>
                        <ul className="space-y-2">
                            {["About", "Blog", "Careers", "Press", "Contact"].map((link) => (
                                <li key={link}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</Link></li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-4 font-heading">Legal</h4>
                        <ul className="space-y-2">
                            {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR", "Security"].map((link) => (
                                <li key={link}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">© 2026 HireFlow. All rights reserved.</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        Made with <Heart className="h-3 w-3 text-destructive inline" /> by the HireFlow team
                    </p>
                </div>
            </div>
        </footer>
    )
}
