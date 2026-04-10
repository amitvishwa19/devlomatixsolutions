'use client';

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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BotModal({ isOpen, onClose, onSave, bot = null }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (bot) {
            setName(bot.name || '');
            setDescription(bot.description || '');
        } else {
            setName('');
            setDescription('');
        }
    }, [bot, isOpen]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name) {
            toast.error("Bot name is required");
            return;
        }

        setLoading(true);
        try {
            const url = bot ? `/api/wa/bot-flow/${bot.id}` : '/api/wa/bot-flow';
            const method = bot ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });

            const result = await response.json();

            if (result.success) {
                toast.success(bot ? "Bot updated" : "Bot created");
                onSave(result.data);
                onClose();
            } else {
                toast.error(result.error || "Failed to save bot");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
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
