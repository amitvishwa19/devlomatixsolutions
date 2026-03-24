'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Smartphone, Check, MessageSquare, Loader2, Image as ImageIcon, Video, Music, File, MapPin, Send, Users, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useSession } from 'next-auth/react';

export default function TemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Templates directly from API
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wa/template');
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load templates from the database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Modal & Builder State
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en_US',
    type: 'text',
    body: '',
    footer: '',
    buttons: [''],
    metadata: {
      mediaUrl: '',
      latitude: '',
      longitude: '',
      locationName: '',
      locationAddress: '',
      listButton: 'Select Option',
      listSections: [{ title: 'Options', rows: [{ title: '', description: '' }] }]
    }
  });

  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testingTemplate, setTestingTemplate] = useState(null);
  const [allContacts, setAllContacts] = useState([]);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [isFetchingContacts, setIsFetchingContacts] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.userId || session?.user?.id;

  // Handle template builder open
  const handleOpenBuilder = (template = null) => {
    if (template) {
      setFormData({ ...template });
      setEditingId(template.id);
    } else {
      setFormData({
        name: '',
        category: 'UTILITY',
        language: 'en_US',
        type: 'text',
        body: '',
        footer: '',
        buttons: [''],
        metadata: {
          mediaUrl: '',
          latitude: '',
          longitude: '',
          locationName: '',
          locationAddress: '',
          listButton: 'Select Option',
          listSections: [{ title: 'Options', rows: [{ title: '', description: '' }] }]
        }
      });
      setEditingId(null);
    }
    setIsBuilderOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  // Form Handlers
  const handleSave = async () => {
    // console.log("formData.name", formData.name);
    // console.log("formData.body", formData.body);
    // console.log("formData.category", formData.category);
    // console.log("formData.language", formData.language);
    // console.log("formData.type", formData.type);
    // console.log("formData.footer", formData.footer);
    // console.log("formData.buttons", formData.buttons);
    // console.log("formData.metadata", formData.metadata);


    if (!formData.name || !formData.body) return;
    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch('/api/wa/template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save template");
      }

      toast.success(editingId ? "Template updated!" : "Template created successfully!");
      setIsBuilderOpen(false);
      fetchTemplates();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/wa/template?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete");

      toast.success("Template deleted successfully");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleButtonChange = (index, value) => {
    const newButtons = [...formData.buttons];
    newButtons[index] = value;
    setFormData({ ...formData, buttons: newButtons });
  };

  const addButton = () => {
    if (formData.buttons.length < 3) {
      setFormData({ ...formData, buttons: [...formData.buttons, ''] });
    }
  };

  const removeButton = (index) => {
    const newButtons = formData.buttons.filter((_, i) => i !== index);
    setFormData({ ...formData, buttons: newButtons });
  };

  const fetchContacts = async () => {
    if (!userId) return;
    setIsFetchingContacts(true);
    try {
      const res = await fetch(`/api/wa/contacts?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setAllContacts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFetchingContacts(false);
    }
  };

  const handleSendTest = async () => {
    const manualNumbers = testRecipient.split(',').map((n) => n.trim()).filter((n) => n);
    const contactNumbers = allContacts.
    filter((c) => selectedContactIds.includes(c.id)).
    map((c) => c.phone);

    const allRecipients = Array.from(new Set([...manualNumbers, ...contactNumbers]));

    if (allRecipients.length === 0) {
      toast.error("Please select or enter at least one recipient.");
      return;
    }

    setIsTesting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const recipient of allRecipients) {
        const payload = { to: recipient, text: testingTemplate.body };

        // Map based on type
        if (testingTemplate.type === 'image') payload.image = { url: testingTemplate.metadata?.mediaUrl };
        if (testingTemplate.type === 'video') payload.video = { url: testingTemplate.metadata?.mediaUrl };
        if (testingTemplate.type === 'audio') payload.audio = { url: testingTemplate.metadata?.mediaUrl };
        if (testingTemplate.type === 'document') payload.document = { url: testingTemplate.metadata?.mediaUrl };
        if (testingTemplate.type === 'location') {
          const lat = parseFloat(testingTemplate.metadata?.latitude);
          const lon = parseFloat(testingTemplate.metadata?.longitude);
          if (!isNaN(lat) && !isNaN(lon)) {
            payload.location = {
              degreesLatitude: lat,
              degreesLongitude: lon,
              name: testingTemplate.metadata?.locationName || "location",
              address: testingTemplate.metadata?.locationAddress || "location address"
            };
          }
        }
        if (testingTemplate.type === 'interactive-button') {
          payload.interactive = {
            type: "list",
            body: { text: testingTemplate.body },
            footer: testingTemplate.footer ? { text: testingTemplate.footer } : undefined,
            action: {
              button: "Options",
              sections: [{
                title: "Quick Balance",
                rows: (testingTemplate.buttons || []).map((btn) => ({ id: btn, title: btn }))
              }]
            }
          };
        }
        if (testingTemplate.type === 'interactive-group') {
          payload.interactive = {
            type: "list",
            body: { text: testingTemplate.body },
            footer: testingTemplate.footer ? { text: testingTemplate.footer } : undefined,
            action: {
              button: testingTemplate.metadata?.listButton || "Select Option",
              sections: (testingTemplate.metadata?.listSections || []).map((section) => ({
                title: section.title,
                rows: section.rows.map((row) => ({
                  id: row.title.toLowerCase().replace(/\s+/g, '_'),
                  title: row.title,
                  description: row.description
                }))
              }))
            }
          };
        }

        const res = await fetch('/api/wa/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) successCount++;else
        failCount++;
      }

      if (successCount > 0) {
        toast.success(`Sent to ${successCount} recipients! ${failCount > 0 ? `(${failCount} failed)` : ''}`);
        setIsTestModalOpen(false);
        setTestRecipient('');
        setSelectedContactIds([]);
      } else {
        toast.error("Failed to send to all recipients.");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const openTestModal = (template) => {
    setTestingTemplate(template);
    setIsTestModalOpen(true);
    fetchContacts();
  };

  const toggleContact = (id) => {
    setSelectedContactIds((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredContacts = allContacts.filter((c) =>
  c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
  c.phone.includes(contactSearch)
  );

  const filteredTemplates = templates.filter((t) =>
  t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  t.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">

            {/* Main Content Area */}
            <div className="flex-1 space-y-6 max-w-[1200px] overflow-y-auto transition-all duration-300">
                {/* Header */}
                <div className="flex border border-border items-center justify-between bg-card p-6 rounded-xl shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Message Templates</h2>
                        <p className="text-sm text-muted-foreground mt-1">Create and manage reusable WhatsApp messages.</p>
                    </div>
                    <Button onClick={() => handleOpenBuilder()} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                </div>

                {/* Toolbar */}
                <div className="bg-card p-4 rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center border border-border">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
              placeholder="Search templates..."
              className="pl-9 bg-background border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
                    </div>
                </div>

                {/* Templates Table */}
                <div className="w-full bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-semibold text-gray-600">Template Name</TableHead>
                                <TableHead className="font-semibold text-gray-600">Category</TableHead>
                                <TableHead className="font-semibold text-gray-600">Type</TableHead>
                                <TableHead className="font-semibold text-gray-600">Status</TableHead>
                                <TableHead className="text-right font-semibold text-gray-600">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTemplates.length === 0 ?
              <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <MessageSquare className="h-10 w-10 text-gray-300 mb-3" />
                                            <p>No templates found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow> :

              filteredTemplates.map((template) =>
              <TableRow key={template.id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleOpenBuilder(template)}>
                                        <TableCell className="font-medium text-foreground">{template.name}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                                {template.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{template.type}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.status === 'APPROVED' ? 'bg-green-500/10 text-green-600' :
                  template.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 'bg-muted text-muted-foreground'}`
                  }>
                                                {template.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="text-muted-foreground focus-visible:ring-0">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={(e) => {e.stopPropagation();openTestModal(template);}}>
                                                        <Send className="h-4 w-4 mr-2" /> Send Test
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {e.stopPropagation();handleOpenBuilder(template);}}>
                                                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => {e.stopPropagation();handleDelete(template.id);}} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
              )
              }
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Right Side Builder Panel (Now Sheet Modal) */}
            <Sheet open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                <SheetContent className="w-[620px] sm:max-w-[620px] p-0 flex flex-col gap-0 border-l border-border bg-card shadow-2xl">
                    <div className='flex flex-col h-full'>
                        {/* Panel Header */}
                        <SheetHeader className="px-6 py-4 border-b border-border bg-muted/30 text-left">
                            <SheetTitle className="text-lg font-semibold text-foreground">
                                {editingId ? 'Edit Template' : 'Create Template'}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-muted-foreground">
                                Configure your WhatsApp message template content and interactive elements.
                            </SheetDescription>
                        </SheetHeader>

                        <ScrollArea className='h-[85%]'>
                            {/* Main Form Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-border">

                                {/* Basic Info */}
                                <div className="space-y-4">


                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Template Name</label>
                                        <Input
                      placeholder="e.g. welcome_message_v1"
                      value={formData.name || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, name: value });
                      }}
                      className="bg-background border-border" />
                    
                                        <p className="text-[11px] text-muted-foreground mt-1">Lowercase letters, numbers, and underscores only. Spaces and dashes will be converted.</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Category</label>
                                            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                                <SelectTrigger className="bg-background border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="UTILITY">Utility</SelectItem>
                                                    <SelectItem value="MARKETING">Marketing</SelectItem>
                                                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1.5 block">Language</label>
                                            <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                                                <SelectTrigger className="bg-background border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en_US">English (US)</SelectItem>
                                                    <SelectItem value="en_GB">English (UK)</SelectItem>
                                                    <SelectItem value="es">Spanish</SelectItem>
                                                    <SelectItem value="fr">French</SelectItem>
                                                    <SelectItem value="hi">Hindi</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Message Type</label>
                                        <Select
                      value={formData.type}
                      onValueChange={(v) => {
                        let newMetadata = { ...formData.metadata };
                        if (v === 'interactive-group' && (!newMetadata.listSections || newMetadata.listSections.length === 0)) {
                          newMetadata.listSections = [{ title: 'Options', rows: [{ title: '', description: '' }] }];
                          newMetadata.listButton = 'Select Option';
                        }
                        setFormData({ ...formData, type: v, metadata: newMetadata });
                      }}>
                      
                                            <SelectTrigger className="bg-background border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Standard Text</SelectItem>
                                                    <SelectItem value="image">Image</SelectItem>
                                                    <SelectItem value="video">Video</SelectItem>
                                                    <SelectItem value="audio">Audio</SelectItem>
                                                    <SelectItem value="document">Document / PDF</SelectItem>
                                                    <SelectItem value="location">Location</SelectItem>
                                                    <SelectItem value="interactive-button">Interactive (Buttons)</SelectItem>
                                                    <SelectItem value="interactive-group">Interactive (Group)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>


                                </div>

                                <hr className="border-border" />

                                {/* Conditional Media / Location Inputs */}
                                {['image', 'video', 'audio', 'document'].includes(formData.type) &&
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-sm font-semibold text-foreground block">
                                            {formData.type.charAt(0) + formData.type.slice(1).toLowerCase()} URL
                                        </label>
                                        <Input
                    placeholder={`https://example.com/my-${formData.type.toLowerCase()}.ext`}
                    value={formData.metadata?.mediaUrl || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, mediaUrl: e.target.value }
                    })}
                    className="bg-background border-border" />
                  
                                        <p className="text-[11px] text-muted-foreground">Ensure the link is publicly accessible.</p>
                                    </div>
                }

                                {formData.type === 'location' &&
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-foreground mb-1 block">Latitude</label>
                                                <Input
                        placeholder="e.g. 18.5204"
                        value={formData.metadata?.latitude || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, latitude: e.target.value }
                        })} />
                      
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-foreground mb-1 block">Longitude</label>
                                                <Input
                        placeholder="e.g. 73.8567"
                        value={formData.metadata?.longitude || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, longitude: e.target.value }
                        })} />
                      
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-foreground mb-1 block">Location Name</label>
                                            <Input
                      placeholder="e.g. Central Park"
                      value={formData.metadata?.locationName || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        metadata: { ...formData.metadata, locationName: e.target.value }
                      })} />
                    
                                        </div>
                                    </div>
                }

                                {/* Message Content */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 flex justify-between">
                                            Message Body
                                            <span className="text-xs text-muted-foreground font-normal">Use {"{{1}}"} for variables</span>
                                        </label>
                                        <Textarea
                      placeholder="Hello {{1}}, your order {{2}} is ready..."
                      className="min-h-[120px] resize-none bg-background border-border"
                      value={formData.body || ''}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
                    
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-foreground mb-1.5 block">Footer (Optional)</label>
                                        <Input
                      placeholder="e.g. Reply STOP to unsubscribe"
                      className="text-sm bg-background border-border"
                      value={formData.footer || ''}
                      onChange={(e) => setFormData({ ...formData, footer: e.target.value })} />
                    
                                    </div>

                                    {/* List Configuration (Interactive Group) */}
                                    {formData.type === 'interactive-group' &&
                  <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-foreground">List Button Label</label>
                                                <Input
                        placeholder="e.g. View Menu"
                        value={formData.metadata?.listButton || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, listButton: e.target.value }
                        })}
                        maxLength={20} />
                      
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-foreground">Options Groups</label>
                                                    <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] gap-1 px-2 border"
                          onClick={() => {
                            const newSections = [...(formData.metadata?.listSections || [])];
                            if (newSections.length < 3) {
                              newSections.push({ title: `Group ${newSections.length + 1}`, rows: [{ title: '', description: '' }] });
                              setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                            }
                          }}
                          disabled={(formData.metadata?.listSections || []).length >= 3}>
                          
                                                        <Plus className="w-3 h-3" />
                                                        Add Group
                                                    </Button>
                                                </div>

                                                {(formData.metadata?.listSections || []).map((section, sIdx) =>
                      <div key={sIdx} className="bg-background/50 p-3 rounded-lg border border-border space-y-3 relative group/section">
                                                        <div className="flex items-center gap-2">
                                                            <Input
                            placeholder="Section Title (e.g. Beverages)"
                            className="h-8 font-medium bg-muted/20"
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...formData.metadata.listSections];
                              newSections[sIdx].title = e.target.value;
                              setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                            }}
                            maxLength={24} />
                          
                                                            {formData.metadata.listSections.length > 1 &&
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              const newSections = formData.metadata.listSections.filter((_, i) => i !== sIdx);
                              setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                            }}>
                            
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                          }
                                                        </div>

                                                        <div className="space-y-2 pl-2 border-l-2 border-primary/20">
                                                            {(section.rows || []).map((row, rIdx) =>
                          <div key={rIdx} className="space-y-2 p-3 bg-background border border-border rounded-lg relative group/row">
                                                                    <Input
                              placeholder={`Option Title (e.g. Option ${rIdx + 1})`}
                              className="h-8 text-sm"
                              value={row.title}
                              onChange={(e) => {
                                const newSections = [...formData.metadata.listSections];
                                newSections[sIdx].rows[rIdx].title = e.target.value;
                                setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                              }}
                              maxLength={24} />
                            
                                                                    <Input
                              placeholder="Description (optional)"
                              className="h-7 text-[11px]"
                              value={row.description}
                              onChange={(e) => {
                                const newSections = [...formData.metadata.listSections];
                                newSections[sIdx].rows[rIdx].description = e.target.value;
                                setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                              }}
                              maxLength={72} />
                            
                                                                    {(section.rows.length > 1 || formData.metadata.listSections.length > 1) &&
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/row:opacity-100 transition-opacity"
                              onClick={() => {
                                const newSections = [...formData.metadata.listSections];
                                newSections[sIdx].rows = newSections[sIdx].rows.filter((_, i) => i !== rIdx);
                                setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                              }}>
                              
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                            }
                                                                </div>
                          )}

                                                            {section.rows.length < 10 &&
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[10px] h-7 dashed"
                            onClick={() => {
                              const newSections = [...formData.metadata.listSections];
                              newSections[sIdx].rows.push({ title: '', description: '' });
                              setFormData({ ...formData, metadata: { ...formData.metadata, listSections: newSections } });
                            }}>
                            
                                                                    <Plus className="w-3 h-3" />
                                                                    Add Option
                                                                </Button>
                          }
                                                        </div>
                                                    </div>
                      )}
                                            </div>
                                        </div>
                  }

                                    {/* Interactive Buttons Config */}
                                    {formData.type === 'interactive-button' &&
                  <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
                                            <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                                                Quick Reply Buttons
                                                {formData.buttons.length < 3 &&
                      <Button variant="ghost" size="sm" onClick={addButton} className="px-2 text-xs text-primary bg-primary/10 hover:bg-primary/20">
                                                        <Plus className="w-3 h-3 mr-1" /> Add Button
                                                    </Button>
                      }
                                            </label>

                                            {formData.buttons.map((btn, idx) =>
                    <div key={idx} className="flex items-center gap-2">
                                                    <Input
                        placeholder={`Button ${idx + 1} text`}
                        value={btn || ''}
                        onChange={(e) => handleButtonChange(idx, e.target.value)}
                        className="bg-background border-border"
                        maxLength={20} />
                      
                                                    {formData.buttons.length > 1 &&
                      <Button variant="ghost" size="icon" onClick={() => removeButton(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                      }
                                                </div>
                    )}
                                        </div>
                  }
                                </div>

                                {/* Live Preview UI */}
                                <div className="mt-8 pt-6 border-t border-border">
                                    <div className="bg-muted/30 p-4 border border-border rounded-xl shadow-inner min-h-[250px] flex flex-col max-w-[320px] mx-auto relative overflow-hidden">
                                        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-4 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" /> Preview
                                        </h3>

                                        {/* Message Bubble */}
                                        <div className="relative z-10 bg-background border border-border rounded-xl rounded-tl-none p-0 overflow-hidden shadow-sm max-w-[95%] text-[14.5px] text-foreground break-words whitespace-pre-wrap leading-relaxed mt-2 self-start w-full">

                                            {/* Media Rendering */}
                                            {formData.type === 'image' &&
                      <div className="aspect-video bg-muted/50 flex items-center justify-center border-b border-border">
                                                    {formData.metadata?.mediaUrl ?
                        <img src={formData.metadata.mediaUrl} className="w-full h-full object-cover" alt="preview" onError={(e) => {e.target.style.display = 'none';}} /> :
                        <ImageIcon className="w-8 h-8 text-muted-foreground/40" />}
                                                </div>
                      }
                                            {formData.type === 'video' &&
                      <div className="aspect-video bg-black/80 flex items-center justify-center border-b border-border text-white">
                                                    <Video className="w-10 h-10 opacity-70" />
                                                </div>
                      }
                                            {formData.type === 'audio' &&
                      <div className="p-3 bg-muted/20 border-b border-border flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                                        <Music className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 h-3 bg-muted/50 rounded-full relative">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-primary/40 rounded-full"></div>
                                                    </div>
                                                </div>
                      }
                                            {formData.type === 'document' &&
                      <div className="p-3 bg-muted/20 border-b border-border flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                                                        <File className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <div className="text-sm font-medium truncate">Document.pdf</div>
                                                        <div className="text-[11px] text-muted-foreground">1.2 MB • PDF</div>
                                                    </div>
                                                </div>
                      }
                                            {formData.type === 'location' &&
                      <div className="aspect-video bg-muted/10 border-b border-border relative flex flex-col items-center justify-center p-4 text-center">
                                                    <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-2">
                                                        <MapPin className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-sm font-semibold">{formData.metadata?.locationName || 'Select Location'}</div>
                                                    <div className="text-[11px] text-muted-foreground">Click to view on maps</div>
                                                    <div className="absolute bottom-0 right-0 p-1 opacity-10">
                                                        <Smartphone className="w-16 h-16 rotate-12" />
                                                    </div>
                                                </div>
                      }

                                            <div className="p-3">
                                                {formData.body || <span className="text-muted-foreground italic">Body content...</span>}
                                                {formData.footer && <div className="text-[12px] text-muted-foreground mt-2">{formData.footer}</div>}

                                                <div className="text-[10px] text-muted-foreground text-right mt-1 ml-4 flex justify-end items-center gap-1">
                                                    10:42 AM <Check className="w-3 h-3 text-primary" />
                                                </div>
                                            </div>

                                            {/* Display Interactive Buttons */}
                                            {formData.type === 'interactive-button' && formData.buttons.filter((b) => b).length > 0 &&
                      <div className="mx-0 mb-0 flex flex-col border-t border-border bg-muted/10">
                                                    {formData.buttons.map((btn, idx) => btn ?
                        <div key={idx} className={`py-2.5 text-center text-primary font-medium text-[15px] ${idx > 0 ? 'border-t border-border' : ''}`}>
                                                            {btn}
                                                        </div> :
                        null)}
                                                </div>
                      }

                                            {/* Display List Button */}
                                            {formData.type === 'interactive-group' &&
                      <div className="mx-0 mb-0 border-t border-border bg-muted/10 p-3">
                                                    <div className="flex items-center justify-center gap-2 py-2 w-full bg-background border border-border rounded-lg text-primary text-sm font-medium shadow-sm">
                                                        <MessageSquare className="w-4 h-4" />
                                                        {formData.metadata?.listButton || 'Select Option'}
                                                    </div>
                                                </div>
                      }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <SheetFooter className="p-2 border-t border-border bg-card flex flex-row items-center justify-end gap-3 shrink-0">
                            <Button variant="ghost" onClick={() => openTestModal(formData)} disabled={!formData.body} className="mr-auto text-primary">
                                <Send className="w-4 h-4 mr-2" /> Test
                            </Button>
                            <Button variant="outline" onClick={() => setIsBuilderOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={!formData.name || !formData.body || isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingId ? 'Save Changes' : 'Create Template'}
                            </Button>
                        </SheetFooter>
                    </div>

                </SheetContent>
            </Sheet>

            {/* Test Message Dialog */}
            <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-primary" /> Send Test Message
                        </DialogTitle>
                        <DialogDescription>
                            Send a preview of this template to selected contacts or custom numbers.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-2 space-y-4">
                        {/* Manual Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <Smartphone className="w-4 h-4" /> Manual Numbers
                            </label>
                            <Input
                placeholder="919876543210, 919000000000"
                value={testRecipient || ''}
                onChange={(e) => setTestRecipient(e.target.value)} />
              
                            <p className="text-[10px] text-muted-foreground italic">Comma separated for multiple numbers.</p>
                        </div>

                        {/* Contacts Selection */}
                        <div className="space-y-3 pt-2 border-t border-border">
                            <label className="text-sm font-semibold flex items-center justify-between gap-2">
                                <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Select Contacts</span>
                                {selectedContactIds.length > 0 &&
                <Badge variant="secondary" className="font-normal">
                                        {selectedContactIds.length} Selected
                                    </Badge>
                }
                            </label>

                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                  placeholder="Search contacts..."
                  className="pl-9 h-9 text-sm"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)} />
                
                            </div>

                            <ScrollArea className="h-[200px] border rounded-md p-1 bg-muted/10">
                                {isFetchingContacts ?
                <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                    </div> :
                filteredContacts.length > 0 ?
                <div className="space-y-1">
                                        {filteredContacts.map((contact) =>
                  <div
                    key={contact.id}
                    className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                    onClick={() => toggleContact(contact.id)}>
                    
                                                <Checkbox checked={selectedContactIds.includes(contact.id)} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{contact.name}</p>
                                                    <p className="text-[11px] text-muted-foreground">{contact.phone}</p>
                                                </div>
                                            </div>
                  )}
                                    </div> :

                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs py-10">
                                        <Users className="w-8 h-8 mb-2 opacity-20" />
                                        <p>No contacts found.</p>
                                    </div>
                }
                            </ScrollArea>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsTestModalOpen(false)}>Cancel</Button>
                        <Button
              onClick={handleSendTest}
              disabled={isTesting || selectedContactIds.length === 0 && !testRecipient}
              className="bg-primary hover:bg-primary/90 text-primary-foreground">
              
                            {isTesting ?
              <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </> :

              <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send to {selectedContactIds.length + testRecipient.split(',').filter((n) => n.trim()).length} Recipients
                                </>
              }
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>);

}