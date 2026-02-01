import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  RotateCcw, Plus, FileText, TrendingUp, TrendingDown, Package,
  AlertTriangle, CheckCircle, Clock, Filter, Download, Search,
  ArrowUpDown, User, Calendar, ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';


const adjustmentSchema = z.object({
  medicineId: z.string().min(1, 'Medicine is required'),
  type: z.enum(['return', 'adjustment_add', 'adjustment_remove', 'damage', 'theft', 'expired']),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  reference: z.string().optional(),
  authorizedBy: z.string().min(1, 'Authorized by is required'),
});

const ADJUSTMENT_TYPES = [
  { value: 'return', label: 'Customer Return', icon: RotateCcw, color: 'blue' },
  { value: 'adjustment_add', label: 'Stock Addition', icon: TrendingUp, color: 'emerald' },
  { value: 'adjustment_remove', label: 'Stock Removal', icon: TrendingDown, color: 'amber' },
  { value: 'damage', label: 'Damaged Goods', icon: AlertTriangle, color: 'red' },
  { value: 'theft', label: 'Theft/Loss', icon: AlertTriangle, color: 'red' },
  { value: 'expired', label: 'Expired Write-off', icon: Clock, color: 'orange' },
];

export function ReturnAdjustmentManager({ inventory, onUpdateInventory }) {
  const [activeTab, setActiveTab] = React.useState('adjustments');
  const [adjustments, setAdjustments] = React.useState([
    { id: 'adj-001', medicineId: 'med-001', medicineName: 'Paracetamol 500mg', type: 'return', quantity: 10, reason: 'Customer returned unopened pack - changed prescription', reference: 'RET-2024-001', authorizedBy: 'Dr. Patel', createdAt: new Date(Date.now() - 86400000), status: 'approved' },
    { id: 'adj-002', medicineId: 'med-004', medicineName: 'Amlodipine 5mg', type: 'damage', quantity: 5, reason: 'Damaged during storage - moisture exposure', reference: 'DMG-2024-001', authorizedBy: 'Pharmacist Singh', createdAt: new Date(Date.now() - 172800000), status: 'approved' },
    { id: 'adj-003', medicineId: 'med-011', medicineName: 'Pantoprazole 40mg', type: 'expired', quantity: 20, reason: 'Batch expired - write off per policy', reference: 'EXP-2024-001', authorizedBy: 'Dr. Sharma', createdAt: new Date(Date.now() - 259200000), status: 'approved' },
    { id: 'adj-004', medicineId: 'med-003', medicineName: 'Metformin 500mg', type: 'adjustment_add', quantity: 50, reason: 'Physical count correction - additional stock found', reference: 'ADJ-2024-001', authorizedBy: 'Pharmacist Gupta', createdAt: new Date(Date.now() - 345600000), status: 'pending' },
  ]);
  const [showNewAdjustment, setShowNewAdjustment] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      medicineId: '',
      type: 'return',
      quantity: 1,
      reason: '',
      reference: '',
      authorizedBy: '',
    },
  });

  const showValidationToast = useFormValidationToast();
  const selectedType = watch('type');
  const selectedMedicineId = watch('medicineId');

  const selectedMedicine = React.useMemo(() =>
    inventory.find(i => i.id === selectedMedicineId),
    [inventory, selectedMedicineId]
  );

  // Stats
  const stats = React.useMemo(() => {
    const returns = adjustments.filter(a => a.type === 'return');
    const damages = adjustments.filter(a => a.type === 'damage' || a.type === 'expired');
    const additions = adjustments.filter(a => a.type === 'adjustment_add');
    const removals = adjustments.filter(a => a.type === 'adjustment_remove' || a.type === 'theft');
    const pending = adjustments.filter(a => a.status === 'pending');

    return {
      totalReturns: returns.reduce((sum, r) => sum + r.quantity, 0),
      totalDamages: damages.reduce((sum, d) => sum + d.quantity, 0),
      totalAdditions: additions.reduce((sum, a) => sum + a.quantity, 0),
      totalRemovals: removals.reduce((sum, r) => sum + r.quantity, 0),
      pendingCount: pending.length,
    };
  }, [adjustments]);

  // Filtered adjustments
  const filteredAdjustments = React.useMemo(() => {
    return adjustments.filter(adj => {
      const matchesSearch = !searchQuery ||
        adj.medicineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adj.reference?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || adj.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || adj.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [adjustments, searchQuery, typeFilter, statusFilter]);

  const onSubmit = (data) => {
    console.log('Adjustment data:', data);

    const medicine = inventory.find(i => i.id === data.medicineId);
    const newAdjustment = {
      id: `adj-${Date.now()}`,
      ...data,
      medicineName: medicine?.name || 'Unknown',
      createdAt: new Date(),
      status: 'pending',
    };

    setAdjustments(prev => [newAdjustment, ...prev]);

    // Update inventory based on type
    if (onUpdateInventory) {
      const quantityChange = ['return', 'adjustment_add'].includes(data.type)
        ? data.quantity
        : -data.quantity;

      onUpdateInventory(prev => prev.map(item =>
        item.id === data.medicineId
          ? { ...item, quantity: Math.max(0, item.quantity + quantityChange) }
          : item
      ));
    }

    reset();
    setShowNewAdjustment(false);
  };

  const onError = (errors) => {
    showValidationToast(errors);
  };

  const handleApprove = (id) => {
    setAdjustments(prev => prev.map(adj =>
      adj.id === id ? { ...adj, status: 'approved' } : adj
    ));
  };

  const handleReject = (id) => {
    setAdjustments(prev => prev.map(adj =>
      adj.id === id ? { ...adj, status: 'rejected' } : adj
    ));
  };

  const getTypeConfig = (type) => {
    return ADJUSTMENT_TYPES.find(t => t.value === type) || ADJUSTMENT_TYPES[0];
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <RotateCcw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalReturns}</p>
                <p className="text-xs text-muted-foreground">Returns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDamages}</p>
                <p className="text-xs text-muted-foreground">Damages/Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAdditions}</p>
                <p className="text-xs text-muted-foreground">Additions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <TrendingDown className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRemovals}</p>
                <p className="text-xs text-muted-foreground">Removals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats.pendingCount > 0 ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Returns & Stock Adjustments
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Audit Log
              </Button>
              <Sheet open={showNewAdjustment} onOpenChange={setShowNewAdjustment}>
                <SheetTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Adjustment
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg bg-transparent border-0 p-0">
                  <div className="bg-card rounded-xl border shadow-lg m-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <SheetHeader className="p-6 pb-4">
                      <SheetTitle>New Stock Adjustment</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="px-6 pb-6 space-y-4">
                      {/* Medicine Select */}
                      <div className="space-y-2">
                        <Label>Medicine *</Label>
                        <Select
                          value={selectedMedicineId}
                          onValueChange={(val) => setValue('medicineId', val)}
                        >
                          <SelectTrigger className={errors.medicineId ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select medicine" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.map(item => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.quantity} in stock)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.medicineId && <p className="text-xs text-red-500">{errors.medicineId.message}</p>}
                      </div>

                      {/* Adjustment Type */}
                      <div className="space-y-2">
                        <Label>Adjustment Type *</Label>
                        <Select
                          value={selectedType}
                          onValueChange={(val) => setValue('type', val)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ADJUSTMENT_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity */}
                      <div className="space-y-2">
                        <Label>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          max={selectedMedicine?.quantity || 999}
                          {...register('quantity', { valueAsNumber: true })}
                          className={errors.quantity ? 'border-red-500' : ''}
                        />
                        {selectedMedicine && (
                          <p className="text-xs text-muted-foreground">
                            Current stock: {selectedMedicine.quantity} {selectedMedicine.unit}
                          </p>
                        )}
                        {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
                      </div>

                      {/* Reference Number */}
                      <div className="space-y-2">
                        <Label>Reference Number</Label>
                        <Input
                          placeholder="e.g., RET-2024-001"
                          {...register('reference')}
                        />
                      </div>

                      {/* Reason */}
                      <div className="space-y-2">
                        <Label>Reason *</Label>
                        <Textarea
                          placeholder="Provide detailed reason for this adjustment..."
                          rows={3}
                          {...register('reason')}
                          className={errors.reason ? 'border-red-500' : ''}
                        />
                        {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
                      </div>

                      {/* Authorized By */}
                      <div className="space-y-2">
                        <Label>Authorized By *</Label>
                        <Input
                          placeholder="Name of authorizing person"
                          {...register('authorizedBy')}
                          className={errors.authorizedBy ? 'border-red-500' : ''}
                        />
                        {errors.authorizedBy && <p className="text-xs text-red-500">{errors.authorizedBy.message}</p>}
                      </div>

                      {/* Submit */}
                      <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowNewAdjustment(false)} className="flex-1">
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Adjustment
                        </Button>
                      </div>
                    </form>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by medicine or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ADJUSTMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Adjustments Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Authorized By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.map((adj) => {
                  const typeConfig = getTypeConfig(adj.type);
                  const TypeIcon = typeConfig.icon;

                  return (
                    <TableRow key={adj.id}>
                      <TableCell className="text-sm">
                        {format(new Date(adj.createdAt), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {adj.reference || '-'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{adj.medicineName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${['return', 'adjustment_add'].includes(adj.type)
                            ? 'text-emerald-600'
                            : 'text-red-600'
                          }`}>
                          {['return', 'adjustment_add'].includes(adj.type) ? '+' : '-'}{adj.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{adj.authorizedBy}</TableCell>
                      <TableCell>{getStatusBadge(adj.status)}</TableCell>
                      <TableCell className="text-right">
                        {adj.status === 'pending' && (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-600 hover:text-emerald-700"
                              onClick={() => handleApprove(adj.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleReject(adj.id)}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredAdjustments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No adjustments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Showing {filteredAdjustments.length} of {adjustments.length} adjustments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
