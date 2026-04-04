'use client';

import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, Rocket } from 'lucide-react';
import { toast } from "sonner";

export const WooCommerceConnectModal = ({ isOpen, onClose, onConnected }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        storeUrl: '',
        apiKey: '',
        apiSecret: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch('/api/wa/ecommerce', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    platform: 'woocommerce'
                })
            });
            
            const json = await res.json();
            if (json.success) {
                toast.success("WooCommerce store connected successfully!");
                onConnected();
                onClose();
            } else {
                toast.error("Failed to connect WooCommerce store");
            }
        } catch (err) {
            toast.error("Network error connecting WooCommerce");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md bg-[#0f0f1a] border-white/10 text-white rounded-3xl shadow-2xl">
                <DialogHeader className="p-2 space-y-4">
                    <div className="mx-auto p-4 bg-purple-500/10 rounded-2xl w-fit border border-purple-500/20">
                        <Zap className="h-10 w-10 text-purple-500" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-center tracking-tight">WooCommerce Integration</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground text-xs font-medium px-4">
                        Connect your self-hosted WordPress/WooCommerce store using REST API keys.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4 px-2">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Store Name</Label>
                        <Input 
                            required
                            placeholder="e.g. WordPress MegaStore" 
                            className="bg-white/5 border-white/10 text-xs rounded-xl h-12 focus:ring-purple-500/20"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Store URL (HTTPS)</Label>
                        <Input 
                            required
                            placeholder="https://mysite.com" 
                            className="bg-white/5 border-white/10 text-xs rounded-xl h-12 focus:ring-purple-500/20"
                            value={formData.storeUrl}
                            onChange={(e) => setFormData({...formData, storeUrl: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Consumer Key</Label>
                            <Input 
                                required
                                placeholder="ck_xxxx" 
                                className="bg-white/5 border-white/10 text-xs rounded-xl h-12 focus:ring-purple-500/20 font-mono"
                                value={formData.apiKey}
                                onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Consumer Secret</Label>
                            <Input 
                                required
                                type="password"
                                placeholder="cs_xxxx" 
                                className="bg-white/5 border-white/10 text-xs rounded-xl h-12 focus:ring-purple-500/20 font-mono"
                                value={formData.apiSecret}
                                onChange={(e) => setFormData({...formData, apiSecret: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10 flex items-start gap-3">
                        <Rocket size={16} className="text-purple-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            Generate keys in WooCommerce &gt; Settings &gt; Advanced &gt; REST API. Ensure <strong>Read/Write</strong> permissions are active.
                        </p>
                    </div>

                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-black tracking-widest uppercase transition-all shadow-xl shadow-purple-500/10"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : "Complete Connection"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
