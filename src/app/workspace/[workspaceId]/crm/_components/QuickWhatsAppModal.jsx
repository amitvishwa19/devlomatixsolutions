'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  Send,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  User,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { sendWhatsAppFromCrmAction } from '../_actions/crm-bridge-actions';

const TEMPLATES = [
  {
    id: 'intro',
    title: '👋 Introduction & Discovery Pitch',
    text: (name, company) =>
      `Hi ${name || 'there'}! 👋\n\nI'm reaching out from Devlomatix regarding solutions for ${company || 'your business'}. We would love to share a quick 10-minute walkthrough on how we streamline operations.\n\nCould we connect briefly this week? Let me know what time works best for you!`
  },
  {
    id: 'followup',
    title: '⏰ Post-Call Follow-up & Next Steps',
    text: (name) =>
      `Hi ${name || 'there'}! 👋\n\nThank you for connecting with us today. As discussed during our call, we are aligning the deliverables and timeline.\n\nPlease let me know if you have any questions or need anything adjusted before we proceed.`
  },
  {
    id: 'quotation',
    title: '📄 Formal Quotation / Scope Ready',
    text: (name) =>
      `Dear ${name || 'Valued Client'},\n\nWe have prepared your customized quotation and scope of work. You can review the deliverables and pricing schedule at your convenience.\n\nLooking forward to your thoughts and moving this forward!`
  },
  {
    id: 'payment',
    title: '💳 Payment & Milestone Reminder',
    text: (name) =>
      `Hi ${name || 'there'},\n\nThis is a gentle reminder regarding the invoice for our recent milestone. Please verify the invoice details and let us know once remittance is initiated.\n\nThank you for your partnership!`
  }
];

export default function QuickWhatsAppModal({
  isOpen,
  onClose,
  workspaceId,
  contact,
  deal
}) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const recipientName = contact?.name || deal?.title || 'Client';
  const recipientPhone = contact?.phone || deal?.contact?.phone || '';
  const cleanPhone = recipientPhone ? recipientPhone.replace(/[^0-9]/g, '') : '';

  useEffect(() => {
    if (isOpen) {
      const defaultTmpl = TEMPLATES[1].text(recipientName, deal?.title);
      setMessage(defaultTmpl);
    }
  }, [isOpen, recipientName, deal?.title]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmpl) => {
    setMessage(tmpl.text(recipientName, deal?.title));
  };

  const handleSendViaApi = async () => {
    if (!cleanPhone) {
      toast.error('Recipient does not have a valid phone number.');
      return;
    }
    if (!message.trim()) {
      toast.error('Please enter a message.');
      return;
    }

    setIsSending(true);
    try {
      const res = await sendWhatsAppFromCrmAction(workspaceId, {
        contactId: contact?.id || null,
        dealId: deal?.id || null,
        phone: cleanPhone,
        message: message.trim()
      });

      if (res.success) {
        toast.success('WhatsApp message logged & dispatched via KonnectX!');
        onClose();
      } else {
        toast.error(res.error || 'Failed to dispatch via KonnectX');
      }
    } catch {
      toast.error('Failed to send WhatsApp message');
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenWhatsAppWeb = () => {
    if (!cleanPhone) {
      toast.error('No phone number available.');
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.success('Opened in WhatsApp Web / App');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-foreground">
            <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 text-[#25D366] flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <span>WhatsApp Outbound Outreach</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
            <span>Recipient:</span>
            <strong className="text-foreground">{recipientName}</strong>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">({recipientPhone || 'No Phone'})</span>
          </DialogDescription>
        </DialogHeader>

        {/* Quick Sales Template Pills */}
        <div className="space-y-2 pt-1">
          <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Select Quick Message Template
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl)}
                className="text-left p-2 rounded-xl border border-border/80 bg-background hover:bg-muted/50 text-[11px] font-medium text-foreground transition-all hover:border-[#25D366]/40"
              >
                {tmpl.title}
              </button>
            ))}
          </div>
        </div>

        {/* Message Editor */}
        <div className="space-y-1.5 pt-2">
          <Label className="text-xs font-semibold">Message Text</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Type your WhatsApp message here..."
            className="text-xs leading-relaxed resize-none bg-background font-sans"
          />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between pt-3 gap-2 border-t border-border mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenWhatsAppWeb}
            className="text-xs gap-1.5 text-foreground hover:border-[#25D366]"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Open WhatsApp Web</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSendViaApi}
              disabled={isSending || !message.trim() || !cleanPhone}
              className="text-xs bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold gap-1.5 shadow-md shadow-[#25D366]/20"
            >
              {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send via KonnectX API</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
