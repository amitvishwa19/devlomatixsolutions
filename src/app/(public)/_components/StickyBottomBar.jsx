'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/WorkspaceProvider";
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Share2 } from "lucide-react";
import Chatbot from "./Chatbot";
import packageJson from "@/../package.json";

const StickyBottomBar = () => {
    const { settings, loading } = useSettings();

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
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 pointer-events-none">
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                    "container mx-auto rounded-2xl transition-all duration-500 ease-out border",
                    "bg-background/85 backdrop-blur-2xl border-border/60 shadow-lg shadow-primary/5 px-6 py-3.5 pointer-events-auto"
                )}
            >
                <div id='bottombar' className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">
                            © 2022 {settings?.branding?.appName || process.env.NEXT_PUBLIC_APP_NAME || 'Devlomatix'}. All rights reserved.
                        </p>

                        {/* App Version */}
                        <span className="text-[11px] font-semibold text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-full border border-border/50">
                            v{packageJson.version}
                        </span>

                        {!loading && activeSocialLinks.length === 0 && (
                            <div className="hidden group-hover:flex items-center gap-2 pl-4 border-l border-border/50 opacity-20">
                                <Share2 className="w-3 h-3" />
                                <span className="text-[10px] font-bold">Manage links in settings</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-5">
                        <div>
                            {/* Dynamic Social Links */}
                            {activeSocialLinks.length > 0 && (
                                <div className="flex items-center gap-3 pl-4 border-l border-border/50">
                                    {activeSocialLinks.map((social) => (
                                        <a
                                            key={social.id}
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                                            title={social.id.charAt(0).toUpperCase() + social.id.slice(1)}
                                        >
                                            <social.icon className="w-4 h-4" />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link href="/privacy" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                            Terms of Service
                        </Link>

                        <Chatbot />

                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StickyBottomBar;
