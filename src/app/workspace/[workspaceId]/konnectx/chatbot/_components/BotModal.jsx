'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { saveBot } from "../_actions/save-bot";
import { toast } from "sonner";

const extractBotConfig = (bot) => {
    const nodes = Array.isArray(bot?.nodes) ? bot.nodes : [];
    const trigger = nodes.find((node) => node.type === 'triggerNode');
    const reply = nodes.find((node) => node.type === 'messageNode' && !node.data?.isFallback);
    const fallback = nodes.find((node) => node.data?.isFallback);

    return {
        triggerKeywords: trigger?.data?.keywords || 'hello, hi, start',
        responseText: reply?.data?.text || 'Hello! Thanks for messaging us. How can we help you today?',
        fallbackText: fallback?.data?.text || '',
    };
};

export function BotModal({ isOpen, onClose, onSave, workspaceId, bot = null }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [active, setActive] = useState(true);
    const [triggerKeywords, setTriggerKeywords] = useState('hello, hi, start');
    const [responseText, setResponseText] = useState('Hello! Thanks for messaging us. How can we help you today?');
    const [fallbackText, setFallbackText] = useState('');

    useEffect(() => {
        if (bot) {
            const config = extractBotConfig(bot);
            setName(bot.name || '');
            setDescription(bot.description || '');
            setActive(Boolean(bot.active));
            setTriggerKeywords(config.triggerKeywords);
            setResponseText(config.responseText);
            setFallbackText(config.fallbackText);
        } else {
            setName('');
            setDescription('');
            setActive(true);
            setTriggerKeywords('hello, hi, start');
            setResponseText('Hello! Thanks for messaging us. How can we help you today?');
            setFallbackText('');
        }
    }, [bot, isOpen]);

    const { execute, isLoading: loading } = useAction(saveBot, {
        onSuccess: (data) => {
            toast.success(bot ? "Bot updated" : "Bot created");
            onSave(data.bot);
            onClose();
        },
        onError: (err) => toast.error(err || "Failed to save bot")
    });

    const handleSave = (e) => {
        e.preventDefault();
        if (!name) { toast.error("Bot name is required"); return; }
        if (!triggerKeywords.trim()) { toast.error("At least one trigger keyword is required"); return; }
        if (!responseText.trim()) { toast.error("Auto reply message is required"); return; }
        execute({
            workspaceId,
            id: bot?.id,
            name,
            description,
            active,
            triggerKeywords,
            responseText,
            fallbackText
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[620px] bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {bot ? 'Edit Chatbot' : 'Create New Chatbot'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSave} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Bot Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g. Customer Support"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background border-border"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Briefly describe what this bot does..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-background border-border min-h-[100px]"
                        />
                    </div>
                    <div className="rounded-md border border-border bg-background/40 p-4 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <Label className="text-sm">Auto Reply Active</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Incoming WhatsApp messages will trigger this bot when it is active.
                                </p>
                            </div>
                            <Switch checked={active} onCheckedChange={setActive} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="triggerKeywords">Trigger Keywords</Label>
                            <Input
                                id="triggerKeywords"
                                placeholder="hello, price, support"
                                value={triggerKeywords}
                                onChange={(e) => setTriggerKeywords(e.target.value)}
                                className="bg-background border-border"
                            />
                            <p className="text-xs text-muted-foreground">
                                Comma separated. The bot replies when incoming text contains one of these keywords.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responseText">Auto Reply Message</Label>
                            <Textarea
                                id="responseText"
                                placeholder="Type the message sent automatically..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                className="bg-background border-border min-h-[110px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fallbackText">Fallback Reply</Label>
                            <Textarea
                                id="fallbackText"
                                placeholder="Optional reply when no active bot keyword matches..."
                                value={fallbackText}
                                onChange={(e) => setFallbackText(e.target.value)}
                                className="bg-background border-border min-h-[80px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {bot ? 'Update Bot' : 'Create Bot'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
