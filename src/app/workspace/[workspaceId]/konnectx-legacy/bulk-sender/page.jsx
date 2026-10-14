'use client';

import React, { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
    Zap,
    Send,
    Play,
    Pause,
    Square,
    Upload,
    CheckCircle2,
    XCircle,
    Clock,
    ShieldCheck,
    Smartphone,
    Smile,
    Sparkles,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { sendTestMessageAction } from '../_actions/connection-actions';

export default function KonnectBulkSenderPage() {
    const params = useParams();
    const workspaceId = params.workspaceId;

    const [recipientData, setRecipientData] = useState(
        "919876543210, Alice\n15551234567, Bob\n447123456789, Charlie"
    );
    const [messageTemplate, setMessageTemplate] = useState(
        "Hi {name}! 👋 We are reaching out from Devlomatix to share our new update. Let us know if you have any questions!"
    );
    const [pacingDelay, setPacingDelay] = useState(4); // seconds
    const [isBlasting, setIsBlasting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Blaster progress state
    const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, current: 0 });
    const [liveFeed, setLiveFeed] = useState([]);

    const stopRef = useRef(false);
    const pausedRef = useRef(false);

    // Parse recipient data
    const parseRecipients = () => {
        const lines = recipientData.split('\n').map(l => l.trim()).filter(Boolean);
        return lines.map((line, idx) => {
            const parts = line.split(',');
            const rawPhone = parts[0]?.trim();
            const cleanPhone = rawPhone?.replace(/[^0-9]/g, '');
            const name = parts[1]?.trim() || `Friend`;
            return {
                id: idx + 1,
                phone: cleanPhone,
                name
            };
        }).filter(r => r.phone && r.phone.length >= 6);
    };

    // Live preview formatted with first recipient
    const sampleRecipients = parseRecipients();
    const sampleRecipient = sampleRecipients[0] || { name: "Alice", phone: "919876543210" };
    const previewMessage = messageTemplate
        .replace(/{name}/g, sampleRecipient.name)
        .replace(/{phone}/g, `+${sampleRecipient.phone}`);

    const handleStartBlast = async () => {
        const recipients = parseRecipients();
        if (recipients.length === 0) {
            toast.error("Please provide at least one valid phone number");
            return;
        }

        if (!messageTemplate.trim()) {
            toast.error("Message content cannot be empty");
            return;
        }

        stopRef.current = false;
        pausedRef.current = false;
        setIsBlasting(true);
        setIsPaused(false);
        setStats({ total: recipients.length, sent: 0, failed: 0, current: 0 });
        setLiveFeed([]);

        toast.info(`Starting WhatsApp broadcast to ${recipients.length} recipients...`);

        for (let i = 0; i < recipients.length; i++) {
            if (stopRef.current) break;

            while (pausedRef.current) {
                await new Promise(r => setTimeout(r, 500));
                if (stopRef.current) break;
            }

            const rec = recipients[i];
            const personalized = messageTemplate
                .replace(/{name}/g, rec.name)
                .replace(/{phone}/g, `+${rec.phone}`);

            // Anti-ban delay
            if (i > 0) {
                const jitter = (Math.random() * 2) - 1; // +/- 1s jitter
                const waitTime = Math.max(2, pacingDelay + jitter) * 1000;
                await new Promise(r => setTimeout(r, waitTime));
            }

            try {
                const res = await sendTestMessageAction(workspaceId, rec.phone, personalized);
                if (res.success) {
                    setStats(p => ({ ...p, sent: p.sent + 1, current: i + 1 }));
                    setLiveFeed(prev => [
                        { phone: rec.phone, name: rec.name, status: 'SENT', time: new Date().toLocaleTimeString() },
                        ...prev.slice(0, 40)
                    ]);
                } else {
                    setStats(p => ({ ...p, failed: p.failed + 1, current: i + 1 }));
                    setLiveFeed(prev => [
                        { phone: rec.phone, name: rec.name, status: 'FAILED', error: res.error, time: new Date().toLocaleTimeString() },
                        ...prev.slice(0, 40)
                    ]);
                }
            } catch (err) {
                setStats(p => ({ ...p, failed: p.failed + 1, current: i + 1 }));
                setLiveFeed(prev => [
                    { phone: rec.phone, name: rec.name, status: 'FAILED', error: err.message, time: new Date().toLocaleTimeString() },
                    ...prev.slice(0, 40)
                ]);
            }
        }

        setIsBlasting(false);
        toast.success("Broadcast completed!");
    };

    const handlePause = () => {
        pausedRef.current = !pausedRef.current;
        setIsPaused(pausedRef.current);
    };

    const handleStop = () => {
        stopRef.current = true;
        setIsBlasting(false);
        setIsPaused(false);
        toast.info("Broadcast stopped by user");
    };

    const progressPct = stats.total > 0 ? Math.round((stats.current / stats.total) * 100) : 0;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Zap className="h-5 w-5 text-emerald-500" />
                        Quick CSV / Spreadsheet Blaster
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Instant personalized WhatsApp broadcasts with tag interpolation and anti-ban delay safeguards.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        Anti-Ban Throttled
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left 7 cols: Config & Composer */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Step 1: Recipients list */}
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px]">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-foreground">
                                    1. Recipients Data (Phone, Name)
                                </Label>
                                <span className="text-[11px] text-muted-foreground">
                                    {sampleRecipients.length} valid contacts parsed
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Paste numbers and names (one per line, separated by comma):
                            </p>
                            <Textarea
                                rows={4}
                                value={recipientData}
                                onChange={(e) => setRecipientData(e.target.value)}
                                disabled={isBlasting}
                                className="font-mono text-xs bg-background/50"
                            />
                        </div>
                    </Card>

                    {/* Step 2: Message composer */}
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px]">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-foreground">
                                    2. WhatsApp Message Template
                                </Label>
                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setMessageTemplate(p => p + " {name}")}
                                        className="h-6 text-[10px] px-1.5"
                                    >
                                        + {'{name}'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setMessageTemplate(p => p + " {phone}")}
                                        className="h-6 text-[10px] px-1.5"
                                    >
                                        + {'{phone}'}
                                    </Button>
                                </div>
                            </div>
                            <Textarea
                                rows={4}
                                value={messageTemplate}
                                onChange={(e) => setMessageTemplate(e.target.value)}
                                disabled={isBlasting}
                                className="text-xs bg-background/50"
                            />
                        </div>
                    </Card>

                    {/* Step 3: Pacing slider & Dispatch control */}
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px]">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-foreground">
                                    3. Anti-Ban Pacing Delay: {pacingDelay}s / message
                                </Label>
                                <span className="text-[11px] text-emerald-500 font-medium">
                                    ~{Math.round(sampleRecipients.length * pacingDelay / 60)} min estimated time
                                </span>
                            </div>
                            <input
                                type="range"
                                min={2}
                                max={15}
                                value={pacingDelay}
                                onChange={(e) => setPacingDelay(Number(e.target.value))}
                                disabled={isBlasting}
                                className="w-full accent-emerald-500"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>2s (Aggressive)</span>
                                <span>4-6s (Recommended Safe)</span>
                                <span>15s (Ultra Safe)</span>
                            </div>

                            <div className="pt-2 flex items-center gap-2">
                                {!isBlasting ? (
                                    <Button
                                        onClick={handleStartBlast}
                                        className="flex-1 h-9 text-xs gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                    >
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                        <span>Start Broadcast ({sampleRecipients.length} Contacts)</span>
                                    </Button>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handlePause}
                                            variant="outline"
                                            className="h-9 px-4 text-xs gap-1.5"
                                        >
                                            <Pause className="h-3.5 w-3.5" />
                                            <span>{isPaused ? "Resume" : "Pause"}</span>
                                        </Button>
                                        <Button
                                            onClick={handleStop}
                                            variant="destructive"
                                            className="h-9 px-4 text-xs gap-1.5"
                                        >
                                            <Square className="h-3.5 w-3.5 fill-current" />
                                            <span>Stop Broadcast</span>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right 5 cols: Live WhatsApp Bubble Preview & Stream Feed */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Live WhatsApp Bubble Preview */}
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px]">
                        <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                            <Smartphone className="h-4 w-4 text-emerald-500" />
                            Live WhatsApp Message Preview
                        </h3>
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/30 relative">
                            {/* WhatsApp Outbound Bubble */}
                            <div className="ml-auto max-w-[90%] bg-emerald-600 text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 text-xs shadow-md space-y-1">
                                <p className="leading-relaxed whitespace-pre-wrap">{previewMessage || "Your message preview will appear here..."}</p>
                                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200">
                                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <CheckCircle2 className="h-3 w-3 text-emerald-200" />
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                            Simulating preview for contact: <strong className="text-foreground">{sampleRecipient.name}</strong> (+{sampleRecipient.phone})
                        </p>
                    </Card>

                    {/* Progress Bar & Live Stream Feed */}
                    <Card className="bg-card/40 border-border/40 backdrop-blur-sm p-4 rounded-[16px] space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-foreground">
                                Broadcast Progress ({stats.current} / {stats.total})
                            </h3>
                            <span className="text-xs font-bold text-emerald-500">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-semibold">
                                {stats.sent} Sent
                            </div>
                            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 font-semibold">
                                {stats.failed} Failed
                            </div>
                        </div>

                        {/* Live Feed Items */}
                        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                            {liveFeed.length === 0 ? (
                                <p className="text-[11px] text-muted-foreground text-center py-4">
                                    Activity feed will populate as messages are dispatched.
                                </p>
                            ) : (
                                liveFeed.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-2 rounded bg-muted/30 text-[11px]"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {item.status === 'SENT' ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-3.5 w-3.5 text-rose-500" />
                                            )}
                                            <span className="font-medium text-foreground">{item.name}</span>
                                            <span className="text-muted-foreground font-mono">+{item.phone}</span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
