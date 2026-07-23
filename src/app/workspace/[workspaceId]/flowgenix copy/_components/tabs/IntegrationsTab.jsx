"use client";

import { Globe, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function IntegrationsTab({ workspaceId, userId }) {
    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
                    <p className="text-muted-foreground">Manage your connections and modular nodes.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Add Integration
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search integrations..." className="pl-10 max-w-md" />
            </div>

            <div className="flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-12 bg-muted/5">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">No integrations yet</h3>
                <p className="text-muted-foreground max-w-xs mt-2">
                    Start by adding a new integration to connect your favorite tools and services.
                </p>
                <Button variant="outline" className="mt-6">
                    Browse Integration Library
                </Button>
            </div>
        </div>
    );
}
