'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSettings } from "@/providers/WorkspaceProvider";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const StickyBottomBar = () => {
    const { settings } = useSettings();

    // Map social IDs to Lucide icons
    const socialIcons = {
        facebook: Facebook,
        twitter: Twitter,
        instagram: Instagram,
        linkedin: Linkedin,
        youtube: Youtube
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
        <div className="fixed border bottom-0 left-0 right-0 z-50 px-4 pb-3 pointer-events-none">
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                    "container mx-auto rounded-2xl transition-all duration-500 ease-out border",
                    "bg-background/80 backdrop-blur-2xl border-border/50 shadow-xl shadow-primary/5 px-6 py-4 pointer-events-auto"
                )}
            >
                <div id='bottombar' className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {/* Dynamic Social Links */}
                        {activeSocialLinks.length > 0 && (
                            <div className="flex items-center gap-4 pr-6 border-r border-border/50">
                                {activeSocialLinks.map((social) => (
                                    <a
                                        key={social.id}
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                    >
                                        <social.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        )}

                        <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-bold">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer font-bold">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default StickyBottomBar;
