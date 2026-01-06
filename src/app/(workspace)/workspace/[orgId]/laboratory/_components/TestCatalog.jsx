import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Plus,
  Search,
  Edit2,
  TestTube,
  DollarSign,
  Clock,
  Beaker,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { labTests as initialTests } from '../_data/mockLabData';

const categories = ['Hematology', 'Chemistry', 'Endocrine', 'Urinalysis', 'Coagulation', 'Microbiology', 'Immunology'];

export function TestCatalog() {
  const [tests, setTests] = useState(initialTests);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);

  const [formData, setFormData] = useState({
    testCode: '',
    testName: '',
    category: '',
    price: 0,
    specimenType: 'Blood',
    turnaroundTime: '',
    instructions: '',
    isActive: true,
    parameters: [],
  });
  const [newParameter, setNewParameter] = useState({
    name: '',
    unit: '',
    normalRangeMin: undefined,
    normalRangeMax: undefined,
  });

  const filteredTests = tests.filter(test => {
    const matchesSearch =
      test.testCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || test.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenDialog = (test) => {
    if (test) {
      setEditingTest(test);
      setFormData(test);
    } else {
      setEditingTest(null);
      setFormData({
        testCode: '',
        testName: '',
        category: '',
        price: 0,
        specimenType: 'Blood',
        turnaroundTime: '',
        instructions: '',
        isActive: true,
        parameters: [],
      });
    }
    setIsDialogOpen(true);
  };

  const handleAddParameter = () => {
    if (!newParameter.name) return;
    const param = {
      id: `param-${Date.now()}`,
      name: newParameter.name,
      unit: newParameter.unit || '',
      normalRangeMin: newParameter.normalRangeMin,
      normalRangeMax: newParameter.normalRangeMax,
    };
    setFormData(prev => ({
      ...prev,
      parameters: [...(prev.parameters || []), param],
    }));
    setNewParameter({ name: '', unit: '', normalRangeMin: undefined, normalRangeMax: undefined });
  };

  const handleRemoveParameter = (paramId) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters?.filter(p => p.id !== paramId) || [],
    }));
  };

  const handleSaveTest = () => {
    if (!formData.testCode || !formData.testName || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    if (editingTest) {
      setTests(prev => prev.map(t =>
        t.id === editingTest.id ? { ...t, ...formData } : t
      ));
      toast.success('Test updated successfully');
    } else {
      const newTest = {
        ...formData,
        id: String(Date.now()),
      };
      setTests(prev => [...prev, newTest]);
      toast.success('Test added to catalog');
    }
    setIsDialogOpen(false);
  };

  const handleToggleActive = (testId) => {
    setTests(prev => prev.map(t =>
      t.id === testId ? { ...t, isActive: !t.isActive } : t
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">


        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2" variant="default" size='sm'>
          <Plus className="h-4 w-4" />
          Add Test
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] bg-input border-border">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead>Test Code</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Specimen</TableHead>
              <TableHead>TAT</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTests.map((test) => (
              <TableRow key={test.id} className="border-border">
                <TableCell className="font-mono font-medium text-primary">{test.testCode}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{test.testName}</p>
                    <p className="text-xs text-muted-foreground">
                      {test.parameters?.length || 0} parameters
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{test.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <TestTube className="h-3.5 w-3.5 text-muted-foreground" />
                    {test.specimenType}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {test.turnaroundTime}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-success" />
                    <span className="font-medium">{test.price?.toFixed(2)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={test.isActive}
                    onCheckedChange={() => handleToggleActive(test.id)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(test)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTest ? 'Edit Test' : 'Add New Test'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test Code *</Label>
                <Input
                  value={formData.testCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, testCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g., CBC"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Test Name *</Label>
              <Input
                value={formData.testName}
                onChange={(e) => setFormData(prev => ({ ...prev, testName: e.target.value }))}
                placeholder="e.g., Complete Blood Count"
                className="bg-input border-border"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Specimen Type</Label>
                <Select value={formData.specimenType} onValueChange={(v) => setFormData(prev => ({ ...prev, specimenType: v }))}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Blood">Blood</SelectItem>
                    <SelectItem value="Urine">Urine</SelectItem>
                    <SelectItem value="Stool">Stool</SelectItem>
                    <SelectItem value="Swab">Swab</SelectItem>
                    <SelectItem value="Tissue">Tissue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Turnaround Time</Label>
                <Input
                  value={formData.turnaroundTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, turnaroundTime: e.target.value }))}
                  placeholder="e.g., 4 hours"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="Special instructions for specimen collection..."
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Test Parameters</Label>

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newParameter.name}
                    onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Parameter name"
                    className="bg-input border-border h-9"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs">Unit</Label>
                  <Input
                    value={newParameter.unit}
                    onChange={(e) => setNewParameter(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="Unit"
                    className="bg-input border-border h-9"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs">Min</Label>
                  <Input
                    type="number"
                    value={newParameter.normalRangeMin ?? ''}
                    onChange={(e) => setNewParameter(prev => ({ ...prev, normalRangeMin: parseFloat(e.target.value) || undefined }))}
                    className="bg-input border-border h-9"
                  />
                </div>
                <div className="w-20 space-y-1">
                  <Label className="text-xs">Max</Label>
                  <Input
                    type="number"
                    value={newParameter.normalRangeMax ?? ''}
                    onChange={(e) => setNewParameter(prev => ({ ...prev, normalRangeMax: parseFloat(e.target.value) || undefined }))}
                    className="bg-input border-border h-9"
                  />
                </div>
                <Button type="button" onClick={handleAddParameter} size="sm" variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.parameters && formData.parameters.length > 0 && (
                <div className="space-y-2">
                  {formData.parameters.map((param) => (
                    <div key={param.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{param.name}</span>
                        <span className="text-sm text-muted-foreground">{param.unit}</span>
                        <span className="text-sm text-muted-foreground">
                          Range: {param.normalRangeMin ?? '-'} - {param.normalRangeMax ?? '-'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveParameter(param.id)}
                        className="h-7 w-7"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTest} variant="glow">
                {editingTest ? 'Update Test' : 'Add Test'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
