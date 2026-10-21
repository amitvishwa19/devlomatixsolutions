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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { toast } from 'sonner';
import {
    Mic,
    MicOff,
    Sparkles,
    Loader2,
    FileText
} from 'lucide-react';

import { summarizeVoiceNoteToDcrAction } from '../../_actions/dcr-actions';

export default function AiVoiceNoteModal({
    isOpen,
    onClose,
    workspaceId,
    onRecordCreated
}) {
    const [rawTranscript, setRawTranscript] = useState('');
    const [callType, setCallType] = useState('PHONE_CALL');
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('5');
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recognition, setRecognition] = useState(null);

    // Browser Web Speech Recognition
    const toggleSpeechRecognition = () => {
        if (isRecording) {
            if (recognition) recognition.stop();
            setIsRecording(false);
            return;
        }

        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Web Speech API not supported in this browser. Please type or paste your notes.");
            return;
        }

        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-IN';

        rec.onstart = () => {
            setIsRecording(true);
            toast.success("Microphone active — speak your meeting summary...");
        };

        rec.onresult = (event) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript + ' ';
            }
            setRawTranscript(transcript);
        };

        rec.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsRecording(false);
        };

        rec.onend = () => {
            setIsRecording(false);
        };

        rec.start();
        setRecognition(rec);
    };

    const handleProcessAndSave = async () => {
        if (!rawTranscript.trim()) {
            toast.error("Please dictate or type call notes first.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading("FlowGenix AI analyzing spoken notes & auto-populating DCR log...");
        try {
            const res = await summarizeVoiceNoteToDcrAction(workspaceId, {
                rawTranscript,
                clientName: clientName.trim() || undefined,
                clientPhone: clientPhone.trim() || undefined,
                callType,
                durationMinutes: parseInt(durationMinutes) || 5
            });

            if (res.success && res.data) {
                toast.success(`DCR Log created for ${res.data.aiAnalysis?.clientName || 'Client'}!`, { id: toastId });
                setRawTranscript('');
                setClientName('');
                setClientPhone('');
                if (onRecordCreated) onRecordCreated();
                onClose();
            } else {
                toast.error(res.error || "Failed to process voice note", { id: toastId });
            }
        } catch (err) {
            console.error("Voice note error:", err);
            toast.error("Error processing voice notes", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-card border-border shadow-2xl p-6">
                <DialogHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <DialogTitle className="text-base font-bold text-foreground">
                            AI Voice Note to DCR Log
                        </DialogTitle>
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 ml-auto">
                            FlowGenix Speech Intelligence
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Dictate or paste rapid notes after a field visit or call. AI extracts sentiments, objections, action items, and schedules the follow-up.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Channel & Details Row */}
                    <div className="grid grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">Channel Type</label>
                            <Select value={callType} onValueChange={setCallType}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                                    <SelectItem value="FIELD_VISIT">Field Visit</SelectItem>
                                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                    <SelectItem value="VIDEO_DEMO">Video Demo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">Client / Account</label>
                            <Input
                                placeholder="e.g. Acme Tech"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-muted-foreground">Duration (Mins)</label>
                            <Input
                                type="number"
                                placeholder="5"
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                    </div>

                    {/* Speech / Textarea */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                Spoken Summary / Meeting Notes
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={toggleSpeechRecognition}
                                className={`h-7 px-2.5 text-[11px] gap-1.5 ${isRecording ? 'border-red-500 text-red-500 bg-red-500/10 animate-pulse' : 'text-primary'}`}
                            >
                                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                <span>{isRecording ? 'Stop Recording' : 'Dictate with Mic'}</span>
                            </Button>
                        </div>
                        <Textarea
                            rows={5}
                            value={rawTranscript}
                            onChange={(e) => setRawTranscript(e.target.value)}
                            placeholder="Example: Spoke with Rajesh from GrowthStudio. They love our WhatsApp automation platform but had questions regarding pricing on 50k messages. Agreed to send customized quotation and follow up on Thursday 11 AM..."
                            className="text-xs font-mono leading-relaxed bg-background/80 resize-none border-border"
                        />
                    </div>
                </div>

                <DialogFooter className="flex items-center justify-between w-full pt-2 border-t border-border">
                    <Button type="button" variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleProcessAndSave}
                        disabled={isLoading || !rawTranscript.trim()}
                        className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs"
                    >
                        {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>AI Analyze & Create DCR</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
