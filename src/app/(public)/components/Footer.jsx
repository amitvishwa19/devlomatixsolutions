'use client';
import { AppLogo } from "@/components/global/AppLogo";
import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
    const links = {
        services: [
            "Custom Development",
            "Process Automation",
            "Web & Mobile Apps",
            "Cloud Solutions",
        ],
        company: ["About Us", "Our Process", "Careers", "Contact"],
        resources: ["Blog", "Case Studies", "Documentation", "Support"],
    };

    return (
        <footer className="border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <AppLogo link={'/'} size={100} height={50} />
                        </div>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            Building innovative software solutions that drive business growth and digital transformation.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Linkedin, Github].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-300"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-display font-semibold text-foreground mb-4">Services</h4>
                        <ul className="space-y-3">
                            {links.services.map((link, index) => (
                                <li key={index}>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-semibold cursor-pointer">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-foreground mb-4">Company</h4>
                        <ul className="space-y-3">
                            {links.company.map((link, index) => (
                                <li key={index}>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-semibold cursor-pointer">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-foreground mb-4">Resources</h4>
                        <ul className="space-y-3">
                            {links.resources.map((link, index) => (
                                <li key={index}>
                                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm font-semibold cursor-pointer">
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div id='bottombar' className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-bold">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-bold">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
