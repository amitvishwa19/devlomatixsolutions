// @ts-nocheck
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Send,
  Megaphone,

  FileText,
  Image as ImageIcon } from
'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from 'next/navigation';

export default function BulkSenderPage() {
  const { data: session } = useSession();
  const userId = session?.user?.userId || session?.user?.id;
  const router = useRouter();

  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);

  // Form State
  const [editForm, setEditForm] = useState({
    name: '',
    status: 'RUNNING', // Default to running for immediate push
    templateId: '',
    template: '',
    phone: '', // Manual entered phone logic
    messageType: 'text',
    scheduledAt: '',
    mediaUrl: '',
    intBody: '',
    intFooter: '',
    intButton: 'Choose Option',
    intSections: JSON.stringify([{ title: 'Options', rows: [{ title: 'Option 1', id: 'opt1' }] }], null, 2)
  });

  // Dialog state
  const [contactSelectorOpen, setContactSelectorOpen] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);
  const [recipientType, setRecipientType] = useState('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/wa/templates');
      const data = await res.json();
      if (res.ok) setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to load templates', err);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/wa/contacts?userId=${userId}`);
      const data = await res.json();
      if (res.ok) setContacts(data || []);
    } catch (err) {
      console.error('Failed to load contacts', err);
    }
  }, [userId]);

  const fetchGroups = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/wa/groups?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchTemplates();
    fetchContacts();
    fetchGroups();
  }, [fetchTemplates, fetchContacts, fetchGroups]);

  const handleSend = async () => {
    if (!editForm.name.trim()) {
      toast.error('Broadcast name is required');
      return;
    }

    if (editForm.messageType === 'interactive') {
      if (!editForm.intBody.trim()) {
        toast.error('Message body is required');
        return;
      }
    } else if (editForm.messageType === 'text') {
      if (!editForm.template.trim()) {
        toast.error('Message content is required');
        return;
      }
    } else if (editForm.messageType === 'image' || editForm.messageType === 'document') {
      if (!editForm.mediaUrl.trim()) {
        toast.error(`${editForm.messageType === 'image' ? 'Image' : 'Document'} URL is required`);
        return;
      }
    }

    if (editForm.scheduledAt) {
      const scheduledDate = new Date(editForm.scheduledAt);
      if (isNaN(scheduledDate.getTime())) {
        toast.error('Invalid scheduled time format');
        return;
      }
    }

    const recipients = editForm.phone ?
    editForm.phone.
    split('\n').
    map((line) => {
      const parts = line.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length === 0) return null;
      const phone = parts[0];
      const variables = {};
      for (let i = 1; i < parts.length; i++) {
        variables[`v${i}`] = parts[i];
      }
      return { phone, variables };
    }).
    filter(Boolean) :
    [];

    if (recipients.length === 0 && selectedGroupIds.length === 0) {
      toast.error('Please select or enter at least one recipient');
      return;
    }

    setIsSending(true);
    const toastId = toast.loading('Sending Broadcast...');

    try {
      const buildTemplate = () => {
        if (editForm.messageType === 'interactive') {
          let sections;
          try {sections = JSON.parse(editForm.intSections);} catch {sections = [];}
          return {
            text: editForm.intBody,
            interactive: { body: editForm.intBody, footer: editForm.intFooter, buttonText: editForm.intButton, sections }
          };
        }
        const t = { text: editForm.template };
        if (editForm.messageType === 'image') t.image = { url: editForm.mediaUrl };
        if (editForm.messageType === 'document') t.document = { url: editForm.mediaUrl };
        return t;
      };

      const payload = {
        name: editForm.name,
        status: editForm.scheduledAt ? 'SCHEDULED' : 'RUNNING',
        messageTemplate: buildTemplate(),
        templateId: editForm.templateId === 'custom' ? null : editForm.templateId || null,
        messageType: editForm.messageType,
        scheduledAt: editForm.scheduledAt || null,
        recipients,
        groupIds: selectedGroupIds
      };

      const res = await fetch('/api/wa/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to send broadcast');
      }

      toast.success(editForm.scheduledAt ? 'Broadcast Scheduled Successfully' : 'Broadcast Sent Successfully', { id: toastId });

      // Navigate away to campaigns page to see the created broadcast
      setTimeout(() => {
        router.push(`/workspace/${session?.user?.id || session?.user?.userId || ''}/wa/campaigns`);
      }, 1000);

    } catch (err) {
      console.error('Failed to send broadcast', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send broadcast', { id: toastId });
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto w-full p-4 lg:p-8">
            <div className="max-w-4xl mx-auto w-full">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent flex items-center gap-3">
                        <Send className="w-8 h-8 text-primary" />
                        Bulk Sender
                    </h1>
                    <p className="text-muted-foreground mt-2">Broadcast messages instantly or schedule them for a later time.</p>
                </div>

                <div className="bg-card border rounded-2xl shadow-sm p-6 lg:p-8 space-y-8">
                    {/* Setup Section */}
                    <div className="space-y-6">
                         <div className="border-b pb-4 mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-muted-foreground" />
                                1. Details & Recipients
                            </h2>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Broadcast Name *</label>
                                <Input
                  placeholder="e.g., Year End Sale Announcment"
                  value={editForm.name}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-background border-border/50 focus-visible:ring-primary/20" />
                
                                <p className="text-xs text-muted-foreground">Internal name to identify this broadcast.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Schedule (Optional)</label>
                                <Input
                  type="datetime-local"
                  value={editForm.scheduledAt}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                  className="bg-background border-border/50 text-muted-foreground" />
                
                                <p className="text-xs text-muted-foreground">Leave empty to send immediately.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-foreground">Phone Numbers</label>
                                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContactSelectorOpen(true)}
                  className="h-8 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                  
                                    <Users className="w-3.5 h-3.5 mr-1.5" />
                                    Select Contacts / Groups
                                </Button>
                            </div>
                            
                            <Textarea
                value={editForm.phone}
                rows={4}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter one number per line: 1234567890, John&#10;Or choose from your contacts using the button above."
                className="bg-background min-h-[140px] font-mono text-xs border-border/50 p-4" />
              
                             <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
                                <span>Format: <code className="bg-background px-1.5 py-0.5 rounded border">PhoneNumber, Var1, Var2</code></span>
                                <span>Total Numbers: {editForm.phone ? editForm.phone.split('\n').filter((l) => l.trim()).length : 0} | Selected Groups: {selectedGroupIds.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="space-y-6 pt-6 border-t border-border/40">
                        <div className="border-b pb-4 mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-muted-foreground" />
                                2. Message Content
                            </h2>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">From Template (Optional)</label>
                                <Select
                  value={editForm.templateId}
                  onValueChange={(val) => {
                    const selected = templates.find((t) => t.id === val);
                    if (selected) {
                      let msgType = selected.type.toLowerCase();
                      if (selected.type === 'INTERACTIVE') {
                        msgType = 'interactive-button';
                      } else if (selected.type === 'LIST') {
                        msgType = 'interactive-group';
                      }
                      setEditForm((prev) => ({
                        ...prev,
                        templateId: selected.id,
                        messageType: msgType,
                        template: selected.body,
                        intBody: selected.body,
                        intFooter: selected.footer || '',
                        intButton: selected.type === 'LIST' ? selected.metadata?.listButton || 'Select' : selected.buttons?.[0] || 'Options',
                        intSections: selected.type === 'LIST' ?
                        JSON.stringify(selected.metadata?.listSections || [], null, 2) :
                        JSON.stringify([{ title: 'Options', rows: (selected.buttons || []).map((b) => ({ title: b, id: b })) }], null, 2),
                        mediaUrl: selected.metadata?.mediaUrl || ''
                      }));
                    }
                  }}>
                  
                                    <SelectTrigger className="bg-background border-border/50">
                                        <SelectValue placeholder="Build custom message or choose template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Custom Message</SelectItem>
                                        {templates.map((t) =>
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Message Format</label>
                                <Select
                  value={editForm.messageType.includes('interactive') ? 'interactive' : editForm.messageType}
                  onValueChange={(val) => setEditForm((prev) => ({ ...prev, messageType: val }))}>
                  
                                    <SelectTrigger className="w-full bg-background border-border/50">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Standard Text</SelectItem>
                                        <SelectItem value="image">Image Message</SelectItem>
                                        <SelectItem value="document">Document Message</SelectItem>
                                        <SelectItem value="interactive">Interactive / Buttons</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                         {(editForm.messageType === 'image' || editForm.messageType === 'document') &&
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                    {editForm.messageType === 'image' ? 'Image URL' : 'Document URL'}
                                </label>
                                <Input
                value={editForm.mediaUrl}
                onChange={(e) => setEditForm((prev) => ({ ...prev, mediaUrl: e.target.value }))}
                placeholder="https://example.com/file.jpg"
                className="bg-background border-border/50" />
              
                            </div>
            }

                        {editForm.messageType.includes('interactive') ?
            <div className="space-y-5 animate-in fade-in duration-300 bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm">
                                <p className="text-sm font-semibold text-foreground border-b border-border/50 pb-2">Interactive Setup</p>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Main Body</label>
                                    <Textarea
                  value={editForm.intBody}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, intBody: e.target.value }))}
                  placeholder="Hello {{v1}}, check out these options..."
                  className="bg-background min-h-[100px] resize-y text-sm border-border/50" />
                
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Footer Text</label>
                                        <Input
                    value={editForm.intFooter}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, intFooter: e.target.value }))}
                    placeholder="Optional note"
                    className="bg-background border-border/50" />
                  
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Trigger Button Text</label>
                                        <Input
                    value={editForm.intButton}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, intButton: e.target.value }))}
                    placeholder="View Options"
                    className="bg-background border-border/50" />
                  
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground flex justify-between items-center">
                                        List Data (JSON)
                                    </label>
                                    <Textarea
                  value={editForm.intSections}
                  rows={5}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, intSections: e.target.value }))}
                  className="bg-foreground/5 hover:bg-foreground/10 transition-colors focus:bg-background min-h-[120px] font-mono text-xs resize-y border-border/50"
                  placeholder='[{"title": "Options", "rows": [{"title": "Option 1", "id": "opt1"}]}]' />
                
                                </div>
                            </div> :

            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Message Body</label>
                                <Textarea
                value={editForm.template}
                rows={6}
                onChange={(e) => setEditForm((prev) => ({ ...prev, template: e.target.value }))}
                placeholder="Hello {{v1}}, your custom message..."
                className="bg-background min-h-[120px] border-border/50 shadow-inner" />
              
                            </div>
            }
                    </div>

                    
                    {/* Actions */}
                    <div className="pt-6 border-t border-border/40 flex justify-end">
                        <Button
              size="lg"
              onClick={handleSend}
              disabled={isSending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[200px] font-semibold text-base shadow-md hover:shadow-lg transition-all">
              
                            {isSending ?
              <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Processing...
                                </span> :

              <span className="flex items-center gap-2">
                                    <Send className="w-5 h-5" />
                                    {editForm.scheduledAt ? 'Schedule Broadcast' : 'Send Now'}
                                </span>
              }
                        </Button>
                    </div>
                </div>
            </div>

             {/* Contact Selector Dialog (Reused from Campaigns) */}
             <Dialog open={contactSelectorOpen} onOpenChange={setContactSelectorOpen}>
                <DialogContent className="max-w-xl bg-card border border-border/50 rounded-2xl p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 border-b border-border bg-muted/10">
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            Select Broadcast Recipients
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs value={recipientType} onValueChange={setRecipientType} className="w-full">
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="contacts">Individual Contacts</TabsTrigger>
                                <TabsTrigger value="groups">Contact Groups</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="contacts">
                            <div className="px-6 py-2">
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                    placeholder="Search contacts..."
                    className="pl-9 bg-background"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} />
                  
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <div className="space-y-2">
                                        {contacts.filter((c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.phone.includes(searchTerm)
                    ).length === 0 ?
                    <div className="p-12 text-center text-muted-foreground">
                                                <Users className="w-12 h-12 mx-auto opacity-20 mb-4" />
                                                <p>No contacts found.</p>
                                            </div> :

                    contacts.filter((c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    c.phone.includes(searchTerm)
                    ).map((contact) =>
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedContactIds.includes(contact.id) ?
                      'border-primary bg-primary/5' :
                      'border-border/50 hover:bg-muted/50'}`
                      }
                      onClick={() => {
                        setSelectedContactIds((prev) =>
                        prev.includes(contact.id) ?
                        prev.filter((id) => id !== contact.id) :
                        [...prev, contact.id]
                        );
                      }}>
                      
                                                    <Checkbox checked={selectedContactIds.includes(contact.id)} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{contact.name}</p>
                                                        <p className="text-xs text-muted-foreground">{contact.phone}</p>
                                                    </div>
                                                </div>
                    )
                    }
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="groups">
                            <div className="px-6 py-2">
                                <ScrollArea className="h-[340px]">
                                    <div className="space-y-2">
                                        {groups.length === 0 ?
                    <div className="p-12 text-center text-muted-foreground">
                                                <Users className="w-12 h-12 mx-auto opacity-20 mb-4" />
                                                <p>No groups found. Create groups in the Contacts page.</p>
                                            </div> :

                    groups.map((group) =>
                    <div
                      key={group.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${selectedGroupIds.includes(group.id) ?
                      'border-primary bg-primary/5' :
                      'border-border/50 hover:bg-muted/50'}`
                      }
                      onClick={() => {
                        setSelectedGroupIds((prev) =>
                        prev.includes(group.id) ?
                        prev.filter((id) => id !== group.id) :
                        [...prev, group.id]
                        );
                      }}>
                      
                                                    <Checkbox checked={selectedGroupIds.includes(group.id)} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className="font-semibold text-sm truncate">{group.name}</p>
                                                            <Badge variant="secondary" className="text-[10px]">
                                                                {group._count?.contacts || 0} contacts
                                                            </Badge>
                                                        </div>
                                                        {group.description &&
                        <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                        }
                                                    </div>
                                                </div>
                    )
                    }
                                    </div>
                                </ScrollArea>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="p-6 border-t border-border bg-muted/10">
                        <Button variant="outline" onClick={() => {
              setContactSelectorOpen(false);
              // We don't wipe selectedGroupIds on cancel to preserve user state before confirm
              setSelectedContactIds([]);
            }}>
                            Cancel
                        </Button>
                        <Button
              onClick={() => {
                if (recipientType === 'contacts') {
                  const selected = contacts.filter((c) => selectedContactIds.includes(c.id));
                  const phoneString = selected.map((c) => `${c.phone}, ${c.name}`).join('\n');
                  setEditForm((prev) => ({
                    ...prev,
                    phone: prev.phone ? `${prev.phone}\n${phoneString}` : phoneString
                  }));
                  // Clear so it isn't carried over, we mapped to string
                  setSelectedContactIds([]);
                }
                // If groups, we rely on selectedGroupIds state
                setContactSelectorOpen(false);
              }}
              className="bg-primary hover:bg-primary/90 min-w-[120px]">
              
                            {recipientType === 'contacts' ?
              `Add ${selectedContactIds.length} Contacts` :
              `Target ${selectedGroupIds.length} Groups`
              }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>);

}