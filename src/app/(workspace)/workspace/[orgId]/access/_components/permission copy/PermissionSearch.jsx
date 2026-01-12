import { Shield, Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import React from 'react'

export default function PermissionSearch({ onSearch }) {
    return (
        <header className="flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search modules..."
                        className="w-64 pl-10 bg-secondary border-border  transition-colors"
                        onChange={(e) => onSearch?.(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
}
