'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  PhoneCall,
  Clock,
  Building2,
  Calendar,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { createDcrRecordAction } from '../../_actions/dcr-actions';

const OUTCOMES = [
  { value: 'HOT_LEAD', label: '🔥 Hot Lead / High Interest' },
  { value: 'PROPOSAL_SENT', label: '📄 Proposal / Quote Requested' },
  { value: 'FOLLOWUP_SCHEDULED', label: '⏰ Follow-up Scheduled' },
  { value: 'WON', label: '🏆 Deal Closed / Won' },
  { value: 'GATEKEEPER', label: '⏳ No Answer / Gatekeeper' },
  { value: 'NOT_INTERESTED', label: '❌ Not Interested' }
];

export default function PostCallSummaryDialog({
  isOpen,
  onClose,
  workspaceId,
  record
}) {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState('');
  const [outcome, setOutcome] = useState('FOLLOWUP_SCHEDULED');
  const [nextAction, setNextAction] = useState('Follow up as discussed during the call');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [dealValue, setDealValue] = useState('');

  if (!isOpen || !record) return null;

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins > 0 ? `${mins}m ` : ''}${rem}s`;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!conversation.trim()) {
      toast.error('Please enter discussion notes to log this call.');
      return;
    }

    setLoading(true);
    try {
      const res = await createDcrRecordAction(workspaceId, {
        clientName: record.targetName || 'Direct Client',
        contactPerson: record.targetName || 'Contact',
        callType: record.callType === 'video' ? 'VIDEO_DEMO' : 'PHONE_CALL',
        callPurpose: `WebRTC ${record.callType === 'video' ? 'Video' : 'Voice'} Call`,
        conversation: conversation.trim(),
        outcome,
        nextFollowUpDate: nextFollowUpDate || null,
        nextFollowUpAction: nextAction.trim(),
        dealValue: dealValue ? parseFloat(dealValue) : 0,
        durationMinutes: Math.max(1, Math.round((record.duration || 60) / 60)),
        createTask: !!nextFollowUpDate
      });

      if (res.success) {
        toast.success('Call recorded directly to CRM Activity Center!');
        onClose();
      } else {
        toast.error(res.error || 'Failed to save call log');
      }
    } catch (err) {
      toast.error('Error saving call log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-6 bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            Call Summary & CRM Activity Log
          </DialogTitle>
          <DialogDescription>
            Call with <strong>{record.targetName}</strong> ended ({formatDuration(record.duration || 0)}). Log discussion notes to keep your pipeline up to date.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <Label className="text-xs font-semibold mb-1.5 block">
              Key Discussion Points & Outcomes *
            </Label>
            <Textarea
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Summarize client requirements, questions asked, commitments made..."
              className="min-h-[90px] text-xs leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Call Outcome</Label>
              <Select value={outcome} onValueChange={setOutcome}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  {OUTCOMES.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Deal Potential (₹)
              </Label>
              <Input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="e.g. 75000"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold flex items-center gap-1 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" /> Next Follow-up
              </Label>
              <Input
                type="datetime-local"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1.5 block">Next Action</Label>
              <Input
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="e.g. Send proposal & quote"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} size="sm">
              Skip Logging
            </Button>
            <Button type="submit" disabled={loading} size="sm" className="gap-1.5 font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save to Activity Center
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
