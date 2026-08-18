'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Share2,
    Link2,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { connectAccount } from '../_actions/socialhub-actions';

export function ConnectAccountModal({ open, onOpenChange, workspaceId, onAccountConnected }) {
    const [connecting, setConnecting] = useState(false);
    const [platform, setPlatform] = useState('LinkedIn');
    const [username, setUsername] = useState('');
    const [handle, setHandle] = useState('');

    const handleConnect = async (e) => {
        e.preventDefault();
        if (!username.trim()) return toast.error("Please enter account/company name");

        setConnecting(true);
        const res = await connectAccount(workspaceId, {
            platform,
            username,
            handle: handle.startsWith('@') ? handle : `@${handle}`
        });

        if (res.success) {
            toast.success(`${platform} profile "${username}" connected via OAuth!`);
            onOpenChange(false);
            setUsername('');
            setHandle('');
            if (onAccountConnected) onAccountConnected(res.data);
        } else {
            toast.error(res.error || "Failed to connect account");
        }
        setConnecting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col">
                <DialogHeader className="p-4 border-b border-border/60 bg-sky-500/10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500">
                            <Link2 className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Connect Social Network Account
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Authorize secure OAuth token access for multi-channel scheduling.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleConnect} className="p-5 space-y-3.5 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Social Network Platform</Label>
                        <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LinkedIn">LinkedIn Company Page / Profile</SelectItem>
                                <SelectItem value="X (Twitter)">X / Twitter Business Account</SelectItem>
                                <SelectItem value="Instagram">Instagram Professional Page</SelectItem>
                                <SelectItem value="Facebook">Facebook Business Page</SelectItem>
                                <SelectItem value="Threads">Threads by Meta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Brand / Account Display Name</Label>
                        <Input
                            placeholder="e.g. Devlomatix Solutions"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Social Handle / URL Identifier</Label>
                        <Input
                            placeholder="e.g. @devlomatix"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px]">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Tokens are encrypted with AES-256 and only used for publishing.</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={connecting} className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs">
                            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Authorize & Connect'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
