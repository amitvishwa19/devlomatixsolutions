import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, AlertTriangle, Trash2, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ALLERGY_SEVERITY, COMMON_ALLERGIES } from '../types';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';

// Zod schema for allergy form
const allergySchema = z.object({
  name: z.string().min(1, 'Allergen name is required').max(100, 'Name too long'),
  severity: z.string().default('moderate'),
  reaction: z.string().max(200, 'Reaction description too long').optional(),
  notes: z.string().max(300, 'Notes too long').optional(),
});

export function AllergiesTab({ patient, onUpdatePatient }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(allergySchema),
    defaultValues: {
      name: '',
      severity: 'moderate',
      reaction: '',
      notes: '',
    },
  });

  const allergies = patient?.allergies || [];

  const onSubmit = (data) => {
    console.log('Allergy Form Data:', data);

    if (allergies.some(a => a.name.toLowerCase() === data.name.toLowerCase())) {
      toast({ title: 'Duplicate allergy', description: 'This allergy is already recorded.', variant: 'destructive' });
      return;
    }

    const allergy = {
      id: `allergy-${Date.now()}`,
      name: data.name,
      severity: data.severity,
      reaction: data.reaction || '',
      notes: data.notes || '',
      recordedAt: new Date(),
    };

    const updatedPatient = {
      ...patient,
      allergies: [...(patient.allergies || []), allergy],
    };

    onUpdatePatient?.(updatedPatient);
    toast({ 
      title: 'Allergy added', 
      description: `${data.name} has been added to allergies.`,
      variant: data.severity === 'severe' ? 'destructive' : 'default'
    });
    
    form.reset();
    setShowAddDialog(false);
  };

  const handleDeleteAllergy = (allergyId) => {
    const updatedPatient = {
      ...patient,
      allergies: patient.allergies.filter(a => a.id !== allergyId),
    };
    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Allergy removed', description: 'Allergy has been removed from records.' });
  };

  const handleUpdateSeverity = (allergyId, newSeverity) => {
    const updatedPatient = {
      ...patient,
      allergies: patient.allergies.map(a => 
        a.id === allergyId ? { ...a, severity: newSeverity } : a
      ),
    };
    onUpdatePatient?.(updatedPatient);
    console.log('Allergy Severity Updated:', { allergyId, newSeverity });
    toast({ title: 'Severity updated', description: 'Allergy severity has been updated.' });
  };

  const getSeverityInfo = (severityId) => ALLERGY_SEVERITY.find(s => s.id === severityId);
  const severeAllergies = allergies.filter(a => a.severity === 'severe');
  const severity = form.watch('severity');

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold">Known Allergies</h4>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-3 h-3" />
          Add Allergy
        </Button>
      </div>

      {severeAllergies.length > 0 && (
        <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h5 className="font-semibold text-sm text-destructive">Severe Allergies - Critical Alert</h5>
          </div>
          <div className="flex flex-wrap gap-2">
            {severeAllergies.map((allergy) => (
              <Badge key={allergy.id || allergy.name} variant="destructive" className="text-sm py-1 px-3">
                {allergy.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {allergies.length > 0 ? (
        <div className="space-y-3">
          {allergies.map((allergy) => {
            const severityInfo = getSeverityInfo(allergy.severity);
            return (
              <div key={allergy.id || allergy.name} className={`p-4 rounded-lg border ${allergy.severity === 'severe' ? 'bg-destructive/5 border-destructive/20' : 'bg-secondary/30 border-border'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${allergy.severity === 'severe' ? 'bg-destructive/20' : allergy.severity === 'moderate' ? 'bg-orange-100 dark:bg-orange-950' : 'bg-amber-100 dark:bg-amber-950'}`}>
                      <AlertTriangle className={`w-4 h-4 ${allergy.severity === 'severe' ? 'text-destructive' : allergy.severity === 'moderate' ? 'text-orange-600' : 'text-amber-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{allergy.name}</p>
                      {allergy.reaction && <p className="text-xs text-muted-foreground mt-1">Reaction: {allergy.reaction}</p>}
                      {allergy.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{allergy.notes}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={allergy.severity} onValueChange={(val) => handleUpdateSeverity(allergy.id, val)}>
                      <SelectTrigger className={`h-7 w-auto text-xs ${severityInfo?.color}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALLERGY_SEVERITY.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteAllergy(allergy.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <Check className="w-10 h-10 mx-auto text-green-600 mb-2" />
          <p className="text-sm font-medium text-green-700 dark:text-green-400">No Known Drug Allergies (NKDA)</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Add Allergy" to record any known allergies</p>
        </div>
      )}

      {allergies.length === 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Quick add common allergies:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.slice(0, 6).map((allergen) => (
              <Button key={allergen} variant="outline" size="sm" className="text-xs h-7" onClick={() => { form.setValue('name', allergen); setShowAddDialog(true); }}>
                + {allergen}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Add Allergy
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Allergen Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Penicillin, Peanuts" {...field} list="common-allergies" />
                  </FormControl>
                  <datalist id="common-allergies">{COMMON_ALLERGIES.map(a => <option key={a} value={a} />)}</datalist>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="severity" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Severity</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ALLERGY_SEVERITY.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${s.id === 'severe' ? 'bg-red-500' : s.id === 'moderate' ? 'bg-orange-500' : 'bg-amber-500'}`} />
                            {s.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="reaction" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Reaction Type</FormLabel>
                  <FormControl><Input placeholder="e.g., Anaphylaxis, Skin rash" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Additional Notes</FormLabel>
                  <FormControl><Textarea placeholder="Any additional details..." {...field} rows={2} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              {severity === 'severe' && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                  <p className="text-xs text-destructive">Severe allergies will be prominently displayed in patient records.</p>
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit" className="gap-2"><Save className="w-4 h-4" />Add Allergy</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
