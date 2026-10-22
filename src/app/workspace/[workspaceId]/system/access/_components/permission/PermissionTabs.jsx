'use client'

import React, { useState, useEffect } from "react";
import { Monitor, Smartphone, Globe, Shield, Sparkles } from "lucide-react";
import { PermissionMatrix } from "./PermissionMatrix.jsx";
import { MobilePermissionMatrix } from "./MobilePermissionMatrix.jsx";
import { MOBILE_PERMISSIONS } from "../../_lib/mobile-permissions.js";

export function PermissionTabs() {
    const [platform, setPlatform] = useState("web"); // 'web' | 'mobile'

    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("system_access_perm_platform");
            if (saved === "web" || saved === "mobile") {
                setPlatform(saved);
            }
        }
    }, []);

    const handlePlatformChange = (newPlatform) => {
        setPlatform(newPlatform);
        if (typeof window !== "undefined") {
            localStorage.setItem("system_access_perm_platform", newPlatform);
        }
    };

    return (
        <div className="space-y-4">
            {/* Platform Sub-Tabs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center p-1 bg-muted/60 rounded-xl border border-border/60">
                        <button
                            type="button"
                            onClick={() => handlePlatformChange("web")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                platform === "web"
                                    ? "bg-background text-foreground shadow-xs border border-border/40"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                        >
                            <Globe className="w-3.5 h-3.5 text-primary" />
                            <span>Web App Permissions</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handlePlatformChange("mobile")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                platform === "mobile"
                                    ? "bg-background text-foreground shadow-xs border border-border/40"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                        >
                            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Mobile App Permissions</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-mono font-medium">
                                {MOBILE_PERMISSIONS.length}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="text-[11px] text-muted-foreground hidden sm:block">
                    {platform === "web" ? (
                        <span>Showing navigation modules & route permissions for Next.js web portal</span>
                    ) : (
                        <span>Showing permissions registry from <code className="font-mono text-primary text-[10px]">devlomatix-expo/src/utils/access.js</code></span>
                    )}
                </div>
            </div>

            {/* Platform Content */}
            <div className="animate-in fade-in-50 duration-200">
                {platform === "web" ? (
                    <PermissionMatrix />
                ) : (
                    <MobilePermissionMatrix />
                )}
            </div>
        </div>
    );
}

export default PermissionTabs;
