'use client';

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import { saveStore } from "../_actions/save-store";
import { toast } from "sonner";

export const ShopifyConnectModal = ({ isOpen, onClose, onConnected, workspaceId }) => {
    const [formData, setFormData] = useState({
        name: '',
        storeUrl: '',
        accessToken: ''
    });

    const { execute, isLoading: loading } = useAction(saveStore, {
        onSuccess: () => {
            toast.success("Shopify store connected successfully!");
            onConnected();
            onClose();
        },
        onError: (err) => {
            toast.error(err || "Failed to connect store");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        execute({ ...formData, platform: 'shopify', workspaceId });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-[#0f0f1a] border-white/10 text-white rounded-3xl shadow-2xl">
                <DialogHeader className="space-y-4">
                    <div className="mx-auto p-4 bg-primary/10 rounded-2xl w-fit">
                        <ShoppingBag className="h-10 w-10 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center tracking-tight">Connect Shopify Store</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-xs font-medium">
                        Enter your Shopify App credentials to sync orders and automate customer interactions.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Store Display Name</Label>
                        <Input 
                            required
                            placeholder="e.g. My Cool Shop" 
                            className="bg-white/5 border-white/10 text-xs rounded-xl h-12 focus:ring-primary/20"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Store URL</Label>
                        <Input 
                            required
                            placeholder="my-shop.myshopify.com" 
                            className="bg-white/5 border-white/10 text-xs rounded-xl h-12 focus:ring-primary/20"
                            value={formData.storeUrl}
                            onChange={(e) => setFormData({...formData, storeUrl: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Admin API Access Token</Label>
                        <Input 
                            required
                            type="password"
                            placeholder="shpat_xxxxxxxxxxxxxxxxxxxx" 
                            className="bg-white/5 border-white/10 text-xs rounded-xl h-12 focus:ring-primary/20 font-mono"
                            value={formData.accessToken}
                            onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
                        />
                        <p className="text-[10px] text-muted-foreground mt-2 px-1 italic leading-relaxed">
                            Generated from Shopify Admin &gt; Settings &gt; Apps and sales channels &gt; Develop apps.
                        </p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3">
                        <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase">
                            Your credentials are encrypted and stored securely. We only access order and product data.
                        </p>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-black tracking-widest uppercase transition-all shadow-xl shadow-primary/20"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Authorize & Connect"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
