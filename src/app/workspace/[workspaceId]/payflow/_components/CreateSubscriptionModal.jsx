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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    Repeat,
    Plus,
    Calendar,
    IndianRupee,
    CheckCircle2,
    Shield,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createSubscription } from '../_actions/payflow-actions';

export function CreateSubscriptionModal({ open, onOpenChange, workspaceId, onSubscriptionCreated }) {
    const [creating, setCreating] = useState(false);
    const [client, setClient] = useState('');
    const [plan, setPlan] = useState('Pro Business Tier');
    const [amount, setAmount] = useState('35000');
    const [interval, setInterval] = useState('mo');
    const [gateway, setGateway] = useState('Razorpay');
    const [freeTrial, setFreeTrial] = useState(false);

    const handlePlanChange = (val) => {
        setPlan(val);
        if (val === 'Starter Workspace') setAmount(interval === 'yr' ? '79990' : '7999');
        if (val === 'Pro Business Tier') setAmount(interval === 'yr' ? '350000' : '35000');
        if (val === 'Enterprise Growth Tier') setAmount(interval === 'yr' ? '950000' : '95000');
    };

    const handleIntervalChange = (val) => {
        setInterval(val);
        if (val === 'yr') {
            if (plan === 'Starter Workspace') setAmount('79990');
            if (plan === 'Pro Business Tier') setAmount('350000');
            if (plan === 'Enterprise Growth Tier') setAmount('950000');
        } else {
            if (plan === 'Starter Workspace') setAmount('7999');
            if (plan === 'Pro Business Tier') setAmount('35000');
            if (plan === 'Enterprise Growth Tier') setAmount('95000');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!client.trim()) return toast.error("Please enter a client name");

        setCreating(true);
        const res = await createSubscription(workspaceId, {
            client,
            plan,
            amount,
            interval,
            gateway
        });

        if (res.success) {
            toast.success(`Recurring subscription activated for ${client} (${plan})!`);
            onOpenChange(false);
            setClient('');
            if (onSubscriptionCreated) onSubscriptionCreated(res.data);
        } else {
            toast.error(res.error || "Failed to create subscription");
        }
        setCreating(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-card border-border/80 p-0 overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader className="p-4 border-b border-border/60 bg-secondary/15">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500">
                            <Repeat className="w-4 h-4" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-foreground">
                                Setup Recurring Subscription (INR ₹)
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Provision automated billing cycles, retainer contracts, and MRR tiers.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Client / Business Name</Label>
                        <Input
                            placeholder="e.g. Acme Global Inc."
                            value={client}
                            onChange={(e) => setClient(e.target.value)}
                            className="h-8 text-xs bg-secondary/30 border-border/80"
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">SaaS / Retainer Tier</Label>
                        <Select value={plan} onValueChange={handlePlanChange}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Starter Workspace">Starter Workspace Tier (₹7,999/mo)</SelectItem>
                                <SelectItem value="Pro Business Tier">Pro Business Tier (₹35,000/mo)</SelectItem>
                                <SelectItem value="Enterprise Growth Tier">Enterprise Growth Tier (₹95,000/mo)</SelectItem>
                                <SelectItem value="Custom Retainer Agreement">Custom Retainer Agreement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Billing Frequency</Label>
                            <Select value={interval} onValueChange={handleIntervalChange}>
                                <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mo">Monthly Billing</SelectItem>
                                    <SelectItem value="yr">Annual Billing (20% Off)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs font-semibold">Recurring Rate (₹)</Label>
                            <Input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="h-8 text-xs bg-secondary/30 border-border/80"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-xs font-semibold">Auto-Debit Gateway</Label>
                        <Select value={gateway} onValueChange={setGateway}>
                            <SelectTrigger className="h-8 text-xs bg-secondary/30 border-border/80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Razorpay">Razorpay Auto-Debit (UPI/Cards/e-Mandate)</SelectItem>
                                <SelectItem value="Stripe">Stripe Subscriptions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/40">
                        <div className="space-y-0.5">
                            <span className="font-semibold text-foreground block">Include 14-Day Free Trial</span>
                            <p className="text-[11px] text-muted-foreground">First charge will occur after 14 days of activation.</p>
                        </div>
                        <Switch checked={freeTrial} onCheckedChange={setFreeTrial} />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                        <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 text-xs">
                            Cancel
                        </Button>
                        <Button type="submit" size="sm" disabled={creating} className="h-8 text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs">
                            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Start Subscription'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
