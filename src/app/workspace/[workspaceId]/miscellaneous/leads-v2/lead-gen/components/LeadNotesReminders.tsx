"use client";
import { useState } from 'react';
import { Plus, Trash2, Check, Clock, StickyNote, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { Lead, LeadNote, LeadReminder } from '../data/mockLeads';

interface LeadNotesRemindersProps {
  lead: Lead;
  onUpdateLead: (updated: Lead) => void;
}

const LeadNotesReminders = ({ lead, onUpdateLead }: LeadNotesRemindersProps) => {
  const [noteText, setNoteText] = useState('');
  const [reminderText, setReminderText] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [activeSection, setActiveSection] = useState<'notes' | 'reminders'>('notes');

  const notes = lead.notes || [];
  const reminders = lead.reminders || [];

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: LeadNote = {
      id: crypto.randomUUID(),
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    onUpdateLead({ ...lead, notes: [newNote, ...notes] });
    setNoteText('');
  };

  const deleteNote = (id: string) => {
    onUpdateLead({ ...lead, notes: notes.filter((n) => n.id !== id) });
  };

  const addReminder = () => {
    if (!reminderText.trim() || !reminderDate) return;
    const newReminder: LeadReminder = {
      id: crypto.randomUUID(),
      text: reminderText.trim(),
      dueDate: reminderDate,
      completed: false,
    };
    onUpdateLead({ ...lead, reminders: [newReminder, ...reminders] });
    setReminderText('');
    setReminderDate('');
  };

  const toggleReminder = (id: string) => {
    onUpdateLead({
      ...lead,
      reminders: reminders.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      ),
    });
  };

  const deleteReminder = (id: string) => {
    onUpdateLead({ ...lead, reminders: reminders.filter((r) => r.id !== id) });
  };

  const isOverdue = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex gap-1 p-0.5 bg-secondary/50 rounded-md">
        <button
          onClick={() => setActiveSection('notes')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            activeSection === 'notes'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <StickyNote className="h-3 w-3" />
          Notes ({notes.length})
        </button>
        <button
          onClick={() => setActiveSection('reminders')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            activeSection === 'reminders'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Bell className="h-3 w-3" />
          Reminders ({reminders.filter((r) => !r.completed).length})
        </button>
      </div>

      {/* Notes Section */}
      {activeSection === 'notes' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Textarea
              placeholder="Add a note about this lead..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[60px] text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote();
              }}
            />
            <Button size="sm" onClick={addNote} disabled={!noteText.trim()} className="w-full text-xs">
              <Plus className="h-3 w-3 mr-1" /> Add Note
            </Button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="p-3 rounded-lg bg-secondary/30 group">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.text}</p>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {notes.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No notes yet</p>
            )}
          </div>
        </div>
      )}

      {/* Reminders Section */}
      {activeSection === 'reminders' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Input
              placeholder="Follow up about..."
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="text-sm flex-1"
              />
              <Button size="sm" onClick={addReminder} disabled={!reminderText.trim() || !reminderDate} className="text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {reminders.map((reminder) => {
              const overdue = !reminder.completed && isOverdue(reminder.dueDate);
              return (
                <div
                  key={reminder.id}
                  className={`p-3 rounded-lg group flex items-start gap-2 ${
                    reminder.completed
                      ? 'bg-secondary/20 opacity-60'
                      : overdue
                      ? 'bg-destructive/10 border border-destructive/20'
                      : 'bg-secondary/30'
                  }`}
                >
                  <Checkbox
                    checked={reminder.completed}
                    onCheckedChange={() => toggleReminder(reminder.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${reminder.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {reminder.text}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className={`text-[10px] ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {overdue ? 'Overdue: ' : ''}{new Date(reminder.dueDate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              );
            })}
            {reminders.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No reminders yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadNotesReminders;
