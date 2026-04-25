'use client';

import React from 'react';
import { 
    Send, 
    X, 
    Search, 
    Users, 
    Check, 
    Phone, 
    Loader2 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter, 
    DialogDescription 
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function TestTemplateDialog({
    isOpen,
    onClose,
    template,
    onSend,
    isTesting,
    contacts = [],
    isFetchingContacts,
    testRecipient,
    setTestRecipient,
    selectedContactIds,
    setSelectedContactIds,
    contactSearch,
    setContactSearch,
    detectedVariables,
    variableMappings,
    setVariableMappings,
    testNumbers = [],
    mediaUrl,
    setMediaUrl
}) {
    if (!template) return null;

    const filteredContacts = contacts.filter((c) =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.phone.includes(contactSearch)
    );

    const toggleContact = (id) => {
        setSelectedContactIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleTestNumber = (num) => {
        const currentNumbers = testRecipient.split(',').map(n => n.trim()).filter(n => n);
        if (currentNumbers.includes(num)) {
            setTestRecipient(currentNumbers.filter(n => n !== num).join(', '));
        } else {
            setTestRecipient([...currentNumbers, num].join(', '));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden bg-card border-border">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-primary" />
                        Send Test Message
                    </DialogTitle>
                    <DialogDescription>
                        Test your template by sending it to selected contacts or manual numbers.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-2">
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Template: {template.name}</span>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="text-[9px] h-4 px-1">{template.category}</Badge>
                                <Badge variant="outline" className="text-[9px] h-4 px-1">{template.language}</Badge>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 italic font-medium">
                            "{template.body}"
                        </p>
                    </div>
                </div>

                <div className="p-6 py-4 space-y-6">
                    {/* Media URL Section */}
                    {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(template.type?.toUpperCase()) && (
                        <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                {template.type} Header Required
                            </h4>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-foreground opacity-70">
                                    Provide {template.type} URL or ID
                                </label>
                                <Input
                                    placeholder={`https://... or Meta Media ID`}
                                    value={mediaUrl || ''}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    className="h-9 bg-background text-sm border-primary/20 focus-visible:ring-primary/30"
                                />
                                <p className="text-[9px] text-muted-foreground">
                                    This template requires an {template.type.toLowerCase()} header. Enter a public link or an internal ID.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Variable Mapping Section */}
                    {detectedVariables.length > 0 && (
                        <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                                Variable Mapping ({"{{n}}"})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {detectedVariables.map((v) => (
                                    <div key={v} className="space-y-1.5">
                                        <label className="text-[11px] font-bold text-foreground opacity-70">
                                            Variable {"{{"}{v}{"}}"}
                                        </label>
                                        <Input
                                            placeholder={`Value for {{${v}}}`}
                                            value={variableMappings[v] || ''}
                                            onChange={(e) => setVariableMappings({ ...variableMappings, [v]: e.target.value })}
                                            className="h-9 bg-background text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recipient Selection */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">Manual Numbers</label>
                            <Input
                                placeholder="Enter numbers separated by comma (e.g. 91987..., 9188...)"
                                value={testRecipient}
                                onChange={(e) => setTestRecipient(e.target.value)}
                                className="bg-background border-border"
                            />
                            {testNumbers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase py-1">Saved Test Numbers:</span>
                                    {testNumbers.map((num) => {
                                        const isActive = testRecipient.split(',').map(n => n.trim()).includes(num);
                                        return (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => toggleTestNumber(num)}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all border ${
                                                    isActive 
                                                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                                                        : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/30 hover:bg-muted'
                                                }`}
                                            >
                                                <Phone className="w-2.5 h-2.5" />
                                                {num}
                                                {isActive && <Check className="w-2.5 h-2.5" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    Select Contacts
                                </label>
                                <span className="text-[10px] font-bold text-primary uppercase">
                                    {selectedContactIds.length} Selected
                                </span>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search contacts..."
                                    className="pl-9 h-9 text-sm bg-background/50 border-border"
                                    value={contactSearch}
                                    onChange={(e) => setContactSearch(e.target.value)}
                                />
                            </div>

                            <div className="h-[200px] overflow-hidden border border-border rounded-xl bg-background/30">
                                <ScrollArea className="h-full">
                                    {isFetchingContacts ? (
                                        <div className="flex items-center justify-center h-full gap-2 text-xs text-muted-foreground">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Fetching CRM contacts...
                                        </div>
                                    ) : filteredContacts.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full gap-1 p-4 text-center grayscale opacity-60">
                                            <Users className="w-8 h-8 text-muted-foreground/20" />
                                            <p className="text-[11px] text-muted-foreground">No contacts found</p>
                                        </div>
                                    ) : (
                                        <div className="p-2 space-y-1">
                                            {filteredContacts.map((contact) => (
                                                <div
                                                    key={contact.id}
                                                    className={`group flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${
                                                        selectedContactIds.includes(contact.id)
                                                            ? 'bg-primary/5 border-primary/20'
                                                            : 'hover:bg-muted/30 border-transparent'
                                                    }`}
                                                    onClick={() => toggleContact(contact.id)}
                                                >
                                                    <Checkbox
                                                        checked={selectedContactIds.includes(contact.id)}
                                                        className="pointer-events-none"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-xs font-bold truncate ${selectedContactIds.includes(contact.id) ? 'text-primary' : 'text-foreground'}`}>
                                                            {contact.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 opacity-50">
                                                            <Phone className="w-2.5 h-2.5" />
                                                            <span className="text-[10px] font-mono">{contact.phone}</span>
                                                        </div>
                                                    </div>
                                                    {selectedContactIds.includes(contact.id) && (
                                                        <Check className="w-3.5 h-3.5 text-primary" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t border-border mt-0">
                    <Button variant="ghost" onClick={onClose} disabled={isTesting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSend}
                        className="bg-primary hover:bg-primary/90 min-w-[120px] font-bold shadow-lg shadow-primary/20"
                        disabled={isTesting}
                    >
                        {isTesting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Test Message
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
