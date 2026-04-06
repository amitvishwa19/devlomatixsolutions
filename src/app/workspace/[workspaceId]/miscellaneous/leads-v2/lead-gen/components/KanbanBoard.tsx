"use client";
import { useState, useRef, useCallback } from 'react';
import { GripVertical, Star, Phone, Globe, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { scoreLead, gradeColors } from '../lib/leadScoring';
import type { Lead } from '../data/mockLeads';

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (id: string, status: Lead['status']) => void;
  onSelectLead: (lead: Lead) => void;
}

const COLUMNS: { status: Lead['status']; label: string; color: string }[] = [
  { status: 'new', label: 'New', color: 'border-t-blue-500' },
  { status: 'contacted', label: 'Contacted', color: 'border-t-yellow-500' },
  { status: 'qualified', label: 'Qualified', color: 'border-t-emerald-500' },
  { status: 'converted', label: 'Converted', color: 'border-t-purple-500' },
];

const KanbanBoard = ({ leads, onStatusChange, onSelectLead }: KanbanBoardProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Lead['status'] | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: Lead['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = (e: React.DragEvent, status: Lead['status']) => {
    e.preventDefault();
    if (draggedId) {
      onStatusChange(draggedId, status);
    }
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-fade-in">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.status);
        const isDragOver = dragOverCol === col.status;

        return (
          <div
            key={col.status}
            className={`glass-card rounded-xl border-t-4 ${col.color} transition-all ${
              isDragOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.status)}
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">{col.label}</h3>
              <Badge variant="secondary" className="text-xs">{colLeads.length}</Badge>
            </div>
            <div className="p-2 space-y-2 min-h-[200px] max-h-[60vh] overflow-y-auto">
              {colLeads.map((lead) => {
                const score = scoreLead(lead);
                return (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectLead(lead)}
                    className={`p-3 rounded-lg bg-background border border-border cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all group ${
                      draggedId === lead.id ? 'opacity-40' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-medium text-foreground text-sm truncate">{lead.businessName}</h4>
                          <Badge variant="outline" className={`${gradeColors[score.grade]} text-[10px] px-1.5 py-0 shrink-0`}>
                            {score.grade}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{lead.category}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-warning fill-warning" />
                            <span>{lead.rating}</span>
                          </div>
                          {lead.phone && <Phone className="h-3 w-3" />}
                          {lead.email && <Mail className="h-3 w-3 text-emerald-400" />}
                          {lead.website && <Globe className="h-3 w-3" />}
                        </div>
                        {lead.reminders && lead.reminders.some((r) => !r.completed) && (
                          <div className="mt-1.5">
                            <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
                              ⏰ {lead.reminders.filter((r) => !r.completed).length} reminder(s)
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {colLeads.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
