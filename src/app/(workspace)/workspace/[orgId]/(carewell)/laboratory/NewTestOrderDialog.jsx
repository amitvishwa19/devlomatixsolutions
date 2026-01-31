import React, { useState, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, FlaskConical, Search } from 'lucide-react';
import { COMMON_TESTS, TEST_CATEGORIES, PRIORITY_LEVELS } from './types';
import { formatCurrency } from './utils';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';

const schema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  patientMrn: z.string().min(1, 'MRN is required'),
  patientAge: z.string().min(1, 'Age is required'),
  patientGender: z.string().min(1, 'Gender is required'),
  doctorName: z.string().min(1, 'Ordering doctor is required'),
  priority: z.string().min(1, 'Priority is required'),
  notes: z.string().optional(),
});

export function NewTestOrderDialog({ open, onOpenChange, onSubmit }) {
  const { toast } = useToast();
  const [selectedTests, setSelectedTests] = useState([]);
  const [testSearch, setTestSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 'routine',
    },
  });

  useFormValidationToast(errors);

  const filteredTests = COMMON_TESTS.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(testSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddTest = useCallback((test) => {
    if (!selectedTests.find((t) => t.id === test.id)) {
      setSelectedTests((prev) => [...prev, test]);
    }
  }, [selectedTests]);

  const handleRemoveTest = useCallback((testId) => {
    setSelectedTests((prev) => prev.filter((t) => t.id !== testId));
  }, []);

  const totalAmount = selectedTests.reduce((sum, test) => sum + test.price, 0);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      reset();
      setSelectedTests([]);
      setTestSearch('');
      setCategoryFilter('all');
    }
    onOpenChange(isOpen);
  };

  const onFormSubmit = (data) => {
    console.log('Form data:', data);
    
    if (selectedTests.length === 0) {
      toast({
        title: 'No tests selected',
        description: 'Please select at least one test to order.',
        variant: 'destructive',
      });
      return;
    }

    const newOrder = {
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      patient: {
        id: `p-${Date.now()}`,
        name: data.patientName,
        mrn: data.patientMrn,
        age: parseInt(data.patientAge),
        gender: data.patientGender,
      },
      orderedBy: {
        id: `d-${Date.now()}`,
        name: data.doctorName,
        department: 'General',
      },
      tests: selectedTests.map((t) => ({ ...t, results: null })),
      status: 'ordered',
      priority: data.priority,
      orderedAt: new Date(),
      sampleCollectedAt: null,
      completedAt: null,
      collectedBy: null,
      verifiedBy: null,
      notes: data.notes || '',
      tags: [],
      categories: [],
    };

    onSubmit?.(newOrder);
    reset();
    setSelectedTests([]);
    onOpenChange(false);
    
    toast({
      title: 'Test order created',
      description: `Order ${newOrder.orderNumber} has been created successfully.`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[900px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-1 p-4 pb-2 border-b">
            <SheetTitle>New Lab Test Order</SheetTitle>
          </SheetHeader>

          <form id="new-test-order-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Patient & Order Info */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Patient Information
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input id="patientName" {...register('patientName')} placeholder="Enter patient name" />
                    </div>
                    <div>
                      <Label htmlFor="patientMrn">MRN *</Label>
                      <Input id="patientMrn" {...register('patientMrn')} placeholder="MRN-XXXX-XXXX" />
                    </div>
                    <div>
                      <Label htmlFor="patientAge">Age *</Label>
                      <Input id="patientAge" type="number" {...register('patientAge')} placeholder="Age" />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="patientGender">Gender *</Label>
                      <Select onValueChange={(v) => register('patientGender').onChange({ target: { value: v } })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide pt-4">
                    Order Details
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="doctorName">Ordering Doctor *</Label>
                      <Input id="doctorName" {...register('doctorName')} placeholder="Dr. Name" />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority *</Label>
                      <Select defaultValue="routine" onValueChange={(v) => register('priority').onChange({ target: { value: v } })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_LEVELS.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Clinical Notes</Label>
                      <Textarea id="notes" {...register('notes')} placeholder="Enter clinical notes..." rows={3} />
                    </div>
                  </div>
                </div>

                {/* Right Column - Test Selection */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Select Tests
                  </h3>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tests..."
                        value={testSearch}
                        onChange={(e) => setTestSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {TEST_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="h-[200px] border rounded-lg p-2 overflow-y-auto">
                    <div className="space-y-1">
                      {filteredTests.map((test) => {
                        const isSelected = selectedTests.some((t) => t.id === test.id);
                        return (
                          <div
                            key={test.id}
                            className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                              isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                            }`}
                            onClick={() => isSelected ? handleRemoveTest(test.id) : handleAddTest(test)}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox checked={isSelected} />
                              <div>
                                <p className="text-sm font-medium">{test.name}</p>
                                <p className="text-xs text-muted-foreground">{test.category}</p>
                              </div>
                            </div>
                            <span className="text-sm">{formatCurrency(test.price)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Tests */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Selected Tests ({selectedTests.length})</h4>
                      <span className="font-bold">{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedTests.map((test) => (
                        <Badge key={test.id} variant="secondary" className="gap-1">
                          <FlaskConical className="w-3 h-3" />
                          {test.name}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveTest(test.id);
                            }}
                          />
                        </Badge>
                      ))}
                      {selectedTests.length === 0 && (
                        <p className="text-sm text-muted-foreground">No tests selected</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-1" />
                Create Order
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
