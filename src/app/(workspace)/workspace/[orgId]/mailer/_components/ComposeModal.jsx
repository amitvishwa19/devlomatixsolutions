import { useState, useEffect, useRef } from 'react';
import { X, Send, AlertCircle, AlertTriangle, Minus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from './RichTextEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import supabase from '@/supabase/client';


export function ComposeModal({ isOpen, onClose, onSend, onSaveDraft, replyTo, editingDraft }) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Initialize form when modal opens or editingDraft/replyTo changes
  useEffect(() => {
    if (isOpen) {
      if (editingDraft) {
        setRecipientEmail(editingDraft.recipientEmail || '');
        setSubject(editingDraft.subject);
        setBody(editingDraft.body);
        setPriority(editingDraft.priority);
      } else if (replyTo) {
        setRecipientEmail(replyTo.sender_email || '');
        setSubject(replyTo.subject.startsWith('Re:') ? replyTo.subject : `Re: ${replyTo.subject}`);
        setBody('');
        setPriority('normal');
      } else {
        setRecipientEmail('');
        setSubject('');
        setBody('');
        setPriority('normal');
      }
      setHasUnsavedChanges(false);
    }
  }, [isOpen, editingDraft, replyTo]);

  // Fetch email suggestions from profiles table
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (recipientEmail.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .ilike('email', `%${recipientEmail}%`)
          .limit(10);

        if (error) throw error;
        setSuggestions(data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [recipientEmail]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-save draft after 3 seconds of inactivity
  useEffect(() => {
    if (!isOpen || (!subject && !body)) return;

    setHasUnsavedChanges(true);

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (subject.trim() || body.trim()) {
        onSaveDraft(selectedRecipient, subject, body, priority);
        setHasUnsavedChanges(false);
      }
    }, 3000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [subject, body, recipientEmail, priority]);

  const handleSelectSuggestion = (profile) => {
    setRecipientEmail(profile.email);
    setShowSuggestions(false);
  };

  const handleSend = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(recipientEmail) && subject.trim() && body.trim()) {
      // Clear auto-save timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      onSend([{ email: recipientEmail }], subject, body, priority);
      handleClose();
    }
  };

  const handleSaveDraftManual = () => {
    if (subject.trim() || body.trim()) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      onSaveDraft(recipientEmail, subject, body, priority);
      setHasUnsavedChanges(false);
      toast.success('Draft saved');
    }
  };

  const handleClose = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    // Auto-save on close if there are unsaved changes
    if (hasUnsavedChanges && (subject.trim() || body.trim())) {
      onSaveDraft(recipientEmail, subject, body, priority);
    }
    setRecipientEmail('');
    setSubject('');
    setBody('');
    setPriority('normal');
    setHasUnsavedChanges(false);
    setSuggestions([]);
    setShowSuggestions(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] h-[90vh] max-w-[90vw] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-semibold">
                {editingDraft ? 'Edit Draft' : replyTo ? 'Reply to Message' : 'New Message'}
              </DialogTitle>
              {hasUnsavedChanges && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  Unsaved
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSaveDraftManual}>
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Minus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* To Field */}
          <div className="space-y-2 relative" ref={suggestionsRef}>
            <label className="text-sm font-medium text-foreground">To</label>
            <Input
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter email address..."
              className="bg-background"
              type="email"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelectSuggestion(profile)}
                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex flex-col"
                  >
                    <span className="text-sm font-medium">{profile.email}</span>
                    {profile.full_name && (
                      <span className="text-xs text-muted-foreground">{profile.full_name}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {showSuggestions && isLoadingSuggestions && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg p-2 text-sm text-muted-foreground">
                Loading...
              </div>
            )}
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Subject</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="bg-background"
            />
          </div>

          {/* Priority Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Priority</label>
            <div className="flex gap-2">
              {['normal', 'high', 'urgent'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    priority === p
                      ? p === 'urgent'
                        ? "bg-urgent text-urgent-foreground"
                        : p === 'high'
                          ? "bg-warning text-warning-foreground"
                          : "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {p === 'urgent' && <AlertCircle className="w-4 h-4" />}
                  {p === 'high' && <AlertTriangle className="w-4 h-4" />}
                  <span className="capitalize">{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Field */}
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <label className="text-sm font-medium text-foreground">Message</label>
            <div className="flex-1">
              <RichTextEditor
                value={body}
                onChange={setBody}
                placeholder="Write your message..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Discard
            </Button>
            <span className="text-xs text-muted-foreground">
              Auto-saves after 3s
            </span>
          </div>
          <Button
            onClick={handleSend}
            disabled={!recipientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail) || !subject.trim() || !body.trim()}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            Send Message
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}