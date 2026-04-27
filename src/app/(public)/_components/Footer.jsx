'use client';
import { AppLogo } from "@/components/global/AppLogo";
import { Facebook, Github, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import { useSettings } from "@/providers/WorkspaceProvider";

const Footer = () => {
    const { settings } = useSettings();

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

    // Map social IDs to Lucide icons
    const socialIcons = {
        facebook: Facebook,
        twitter: Twitter,
        instagram: Instagram,
        linkedin: Linkedin,
        youtube: Youtube,
        github: Github
    };

    // Filter active social links from branding settings
    const activeSocialLinks = settings?.branding?.socialLinks 
        ? Object.entries(settings.branding.socialLinks)
            .filter(([_, data]) => data.active && data.url)
            .map(([id, data]) => ({
                id,
                url: data.url,
                icon: socialIcons[id]
            }))
        : [];

    return (
        <footer className="border-t border-border/50 bg-card/30">
            <div className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <AppLogo link={'/'} size={100} height={50} />
                        </div>
                        <p className="text-muted-foreground max-w-sm mb-6 font-medium text-sm leading-relaxed">
                            {settings?.branding?.appDescription || "Building innovative software solutions that drive business growth and digital transformation."}
                        </p>
                        
                        {/* Dynamic Social Icons */}
                        <div className="flex items-center gap-4">
                            {activeSocialLinks.length > 0 ? (
                                activeSocialLinks.map((social) => (
                                    <a
                                        key={social.id}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary transition-all duration-300 group"
                                        title={social.id.charAt(0).toUpperCase() + social.id.slice(1)}
                                    >
                                        <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </a>
                                ))
                            ) : (
                                // Fallback/Default icons if none are active in settings
                                [Twitter, Linkedin, Github].map((Icon, index) => (
                                    <div
                                        key={index}
                                        className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground/30 border border-dashed border-border/40"
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                ))
                            )}
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

            </div>
        </footer>
    );
};

export default Footer;
