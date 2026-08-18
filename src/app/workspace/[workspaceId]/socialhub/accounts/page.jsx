'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Share2,
    Plus,
    CheckCircle2,
    Linkedin,
    Twitter,
    Facebook,
    Instagram,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { getAccounts } from '../_actions/socialhub-actions';
import { ConnectAccountModal } from '../_components/ConnectAccountModal';

export default function SocialHubAccountsPage() {
    const params = useParams();
    const workspaceId = params?.workspaceId;

    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnectOpen, setIsConnectOpen] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const res = await getAccounts(workspaceId);
        if (res.success) setAccounts(res.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [workspaceId]);

    const getIcon = (platform) => {
        switch (platform) {
            case 'LinkedIn': return <Linkedin className="w-4 h-4 text-blue-600" />;
            case 'X (Twitter)': return <Twitter className="w-4 h-4 text-sky-500" />;
            case 'Facebook': return <Facebook className="w-4 h-4 text-blue-500" />;
            default: return <Instagram className="w-4 h-4 text-rose-500" />;
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                            <Share2 className="w-4 h-4 text-rose-500" />
                        </div>
                        <h1 className="text-lg font-bold text-foreground">Connected Social Accounts</h1>
                    </div>
                    <p className="text-xs text-muted-foreground">Manage authorized OAuth connections and brand pages for automated publishing.</p>
                </div>

                <Button
                    size="sm"
                    onClick={() => setIsConnectOpen(true)}
                    className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Connect Account
                </Button>
            </div>

            {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /> Loading accounts...
                </div>
            ) : accounts.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                    No social accounts connected yet
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {accounts.map((acc) => (
                        <Card key={acc.id} className="bg-card border-border/80 p-4 space-y-3 shadow-xs hover:border-rose-500/40 transition-all flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-secondary/50 border border-border/60">
                                            {getIcon(acc.platform)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-xs text-foreground flex items-center gap-1">
                                                {acc.username}
                                                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                                            </h3>
                                            <span className="text-[10px] text-muted-foreground font-mono">{acc.handle}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
                                        {acc.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                                    <span>Followers / Audience</span>
                                    <span className="font-bold text-foreground">{acc.followers}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Connect Account Modal */}
            <ConnectAccountModal
                open={isConnectOpen}
                onOpenChange={setIsConnectOpen}
                workspaceId={workspaceId}
                onAccountConnected={() => loadData()}
            />
        </div>
    );
}
