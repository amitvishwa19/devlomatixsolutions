"use client";
import { useState } from 'react';
import { Copy, ExternalLink, Globe, Mail, MapPin, Phone, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { scoreLead, gradeColors } from '../lib/leadScoring';
import LeadNotesReminders from '../components/LeadNotesReminders';
import type { Lead } from '../data/mockLeads';

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (id: string, status: Lead['status']) => void;
  onUpdateLead?: (lead: Lead) => void;
}

const statusOptions: { value: Lead['status']; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-primary/20 text-primary' },
  { value: 'contacted', label: 'Contacted', color: 'bg-warning/20 text-warning' },
  { value: 'qualified', label: 'Qualified', color: 'bg-success/20 text-success' },
  { value: 'converted', label: 'Converted', color: 'bg-success/30 text-success' },
];

const LeadDetailSheet = ({ lead, open, onOpenChange, onStatusChange, onUpdateLead }: LeadDetailSheetProps) => {
  const { toast } = useToast();

  if (!lead) return null;

  const score = scoreLead(lead);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
  };

  const fullAddress = [lead.address, lead.city, lead.state, lead.country, lead.pincode]
    .filter(Boolean)
    .join(', ');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-xl">{lead.businessName}</SheetTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{lead.category}</Badge>
            <Badge variant="outline" className={`${gradeColors[score.grade]} font-bold`}>
              Score: {score.total} ({score.grade})
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6 pt-2">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select
              value={lead.status}
              onValueChange={(v) => onStatusChange?.(lead.id, v as Lead['status'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <Star className="h-5 w-5 text-warning fill-warning" />
            <span className="text-lg font-bold">{lead.rating}</span>
            <span className="text-sm text-muted-foreground">({lead.reviews} reviews)</span>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact</h3>
            {lead.phone && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${lead.phone}`} className="text-sm hover:text-primary">{lead.phone}</a>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(lead.phone, 'Phone')}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {lead.email && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${lead.email}`} className="text-sm hover:text-primary">{lead.email}</a>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(lead.email, 'Email')}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {lead.website && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary flex items-center gap-1">
                    {lead.website}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(lead.website, 'Website')}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</h3>
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p>{lead.address}</p>
                  <p className="text-muted-foreground">{lead.city}, {lead.state} {lead.pincode}</p>
                  <p className="text-muted-foreground">{lead.country}</p>
                </div>
              </div>
              {fullAddress && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2 p-0 h-auto text-primary"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank')}
                >
                  <MapPin className="h-3.5 w-3.5 mr-1" /> Open in Google Maps
                </Button>
              )}
            </div>
          </div>

          {/* Notes & Reminders */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Notes & Reminders</h3>
            <LeadNotesReminders
              lead={lead}
              onUpdateLead={(updated) => onUpdateLead?.(updated)}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LeadDetailSheet;
