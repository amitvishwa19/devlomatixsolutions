'use client'

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, Bell, Palette, Save, Loader2, LogOut, Moon, Sun, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const { theme, setTheme } = useTheme();

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "appearance", label: "Appearance", icon: Palette },
    ];

    return (
        <div className="p-4  space-y-4 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Configure your workspace environment and personal preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="md:w-64 flex md:flex-col gap-1 shrink-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${activeTab === tab.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            <tab.icon className="h-4.5 w-4.5 shrink-0" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-6">
                    {activeTab === "profile" && (
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-foreground">Profile Information</h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                                    <Input placeholder="John Doe" className="h-11 rounded-xl" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                                    <Input placeholder="john@example.com" disabled className="h-11 rounded-xl bg-muted/50" />
                                </div>
                                <Button className="font-bold h-11 px-6 rounded-xl">Save Profile</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-foreground">Security Settings</h2>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                                    <Input type="password" placeholder="••••••••" className="h-11 rounded-xl" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                                    <Input type="password" placeholder="••••••••" className="h-11 rounded-xl" />
                                </div>
                                <Button className="font-bold h-11 px-6 rounded-xl">Update Password</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-foreground">Appearance</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    { id: "light", label: "Light", icon: Sun },
                                    { id: "dark", label: "Dark", icon: Moon },
                                    { id: "system", label: "System", icon: Monitor },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => { setTheme(t.id); toast.success(`Theme set to ${t.label}`); }}
                                        className={`flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all ${theme === t.id
                                            ? "border-primary bg-primary/5 shadow-inner"
                                            : "border-border hover:border-primary/30 hover:bg-muted/30"
                                            }`}
                                    >
                                        <t.icon className={`h-8 w-8 ${theme === t.id ? "text-primary" : "text-muted-foreground"}`} />
                                        <span className="text-sm font-bold text-foreground">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
                            <div className="space-y-4 divide-y divide-border">
                                {[
                                    { label: "Workflow Success", desc: "Notify when a workflow execution completes successfully" },
                                    { label: "Workflow Failure", desc: "Notify immediately when an error occurs in execution" },
                                    { label: "Daily Summary", desc: "Receive a summary of all automation activity" },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between pt-4 first:pt-0">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">{item.label}</p>
                                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                                        </div>
                                        <div className="inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/80">
                                            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}