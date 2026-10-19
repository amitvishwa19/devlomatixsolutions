"use client";

import React, { useEffect, useState } from 'react';
import { 
    CheckCircle2, 
    Loader2, 
    Globe, 
    Code, 
    Cpu, 
    Image as ImageIcon, 
    Sparkles 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ScraperProgressTerminal({ isExtracting, platform, productCount }) {
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (!isExtracting) {
            setCurrentStep(1);
            return;
        }

        const t1 = setTimeout(() => setCurrentStep(2), 800);
        const t2 = setTimeout(() => setCurrentStep(3), 2000);
        const t3 = setTimeout(() => setCurrentStep(4), 4500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [isExtracting]);

    const steps = [
        { id: 1, label: "Host Connection", desc: "Fetching HTML & headers", icon: Globe },
        { id: 2, label: "DOM Sanitization", desc: "Harvesting JSON-LD & OpenGraph", icon: Code },
        { id: 3, label: "Gemini 1.5 Flash", desc: "Structuring variants & specs", icon: Cpu },
        { id: 4, label: "Media Pipeline", desc: "Resolving high-res photos", icon: ImageIcon }
    ];

    if (!isExtracting) return null;

    return (
        <Card className="bg-card/90 backdrop-blur-md border-cyan-500/30 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span className="text-xs font-semibold text-foreground">
                            AI Extraction Pipeline Running...
                        </span>
                    </div>
                    {platform && (
                        <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/30 uppercase font-mono">
                            Detected: {platform}
                        </Badge>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
                    {steps.map((step) => {
                        const isDone = currentStep > step.id;
                        const isCurrent = currentStep === step.id;

                        return (
                            <div 
                                key={step.id}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    isDone 
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : isCurrent
                                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 ring-1 ring-cyan-500/20"
                                        : "bg-background/40 border-border/50 text-muted-foreground opacity-60"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <step.icon className="w-4 h-4" />
                                    {isDone ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : isCurrent ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                                    ) : (
                                        <span className="text-[10px] font-mono">{step.id}</span>
                                    )}
                                </div>
                                <p className="text-xs font-semibold leading-tight">{step.label}</p>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{step.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
