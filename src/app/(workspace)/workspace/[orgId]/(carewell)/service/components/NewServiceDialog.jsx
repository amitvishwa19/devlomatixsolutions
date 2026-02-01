import { useState, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Package, Search, IndianRupee, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '@/carewell/hooks/useFormValidationToast';
import {
  SERVICE_CATEGORIES,
  SERVICE_STATUSES,
  DEPARTMENTS,
  SERVICE_TYPES,
  BILLING_TYPES,
  TAX_CATEGORIES,
  INSURANCE_CATEGORIES,
  DURATION_UNITS
} from '../utils/types';
import { generateServiceCode, formatCurrency } from '../utils/utils';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockServices } from '../utils/mockData';

const serviceSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  billingType: z.string().min(1, 'Billing type is required'),
  basePrice: z.number().min(0, 'Price must be positive'),
  taxCategory: z.string().min(1, 'Tax category is required'),
  hsnCode: z.string().min(4, 'HSN code must be at least 4 digits').max(8, 'HSN code must be at most 8 digits'),
  duration: z.number().min(1, 'Duration is required'),
  durationUnit: z.string().min(1, 'Duration unit is required'),
  status: z.string().min(1, 'Status is required'),
  insuranceCategory: z.string().optional(),
  requiresAppointment: z.boolean(),
  isEmergency: z.boolean(),
  isPackage: z.boolean(),
  packageServices: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export function NewServiceDialog({ open, onOpenChange, onAdd, editService, totalServices = 0 }) {
  const { toast } = useToast();
  const { showValidationErrors } = useFormValidationToast();
  const isEditing = !!editService;
  const [serviceSearch, setServiceSearch] = useState('');

  // Get all available services for package selection
  const [allServices] = useLocalStorage('hms_services', mockServices);

  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: editService?.name || '',
      description: editService?.description || '',
      category: editService?.category || '',
      department: editService?.department || '',
      serviceType: editService?.serviceType || 'both',
      billingType: editService?.billingType || 'fixed',
      basePrice: editService?.basePrice || 0,
      taxCategory: editService?.taxCategory || 'exempt',
      hsnCode: editService?.hsnCode || '9993',
      duration: editService?.duration || 30,
      durationUnit: editService?.durationUnit || 'minutes',
      status: editService?.status || 'active',
      insuranceCategory: editService?.insuranceCategory || 'varies',
      requiresAppointment: editService?.requiresAppointment ?? true,
      isEmergency: editService?.isEmergency ?? false,
      isPackage: editService?.isPackage ?? false,
      packageServices: editService?.packageServices || [],
      notes: editService?.notes || '',
    },
  });

  const isPackage = useWatch({ control: form.control, name: 'isPackage' });
  const selectedPackageServices = useWatch({ control: form.control, name: 'packageServices' }) || [];

  // Filter services that can be added to package (exclude current service if editing, exclude other packages)
  const availableServices = useMemo(() => {
    return allServices.filter(s =>
      s.id !== editService?.id &&
      !s.isPackage &&
      s.status === 'active' &&
      (serviceSearch === '' ||
        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(serviceSearch.toLowerCase()))
    );
  }, [allServices, editService?.id, serviceSearch]);

  // Calculate package totals
  const packageStats = useMemo(() => {
    const includedServices = allServices.filter(s => selectedPackageServices.includes(s.id));
    const totalValue = includedServices.reduce((sum, s) => sum + s.basePrice, 0);
    return {
      count: includedServices.length,
      totalValue,
      services: includedServices,
    };
  }, [allServices, selectedPackageServices]);

  const onSubmit = (data) => {
    console.log('Service form data:', data);

    const newService = {
      id: editService?.id || `SVC-${String(totalServices + 1).padStart(4, '0')}`,
      code: editService?.code || generateServiceCode(data.category, totalServices + 1),
      ...data,
      // If it's a package, set billing type to package
      billingType: data.isPackage ? 'package' : data.billingType,
      usageCount: editService?.usageCount || 0,
      createdAt: editService?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onAdd(newService);
    form.reset();
    setServiceSearch('');
    onOpenChange(false);

    toast({
      title: isEditing ? 'Service Updated' : 'Service Added',
      description: `${data.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
    });
  };

  const handleToggleService = (serviceId) => {
    const current = form.getValues('packageServices') || [];
    if (current.includes(serviceId)) {
      form.setValue('packageServices', current.filter(id => id !== serviceId));
    } else {
      form.setValue('packageServices', [...current, serviceId]);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[720px] p-0 bg-transparent border-none overflow-hidden flex flex-col">
        <div className="bg-card rounded-l-xl border-l border-y border-border m-4 mr-0 flex flex-col h-[calc(100vh-2rem)] overflow-hidden">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <SheetTitle className="text-xl">{isEditing ? 'Edit Service' : 'Add New Service'}</SheetTitle>
            <SheetDescription>
              {isEditing ? 'Update service details' : 'Create a new service for billing and appointments'}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form id="service-form" onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="flex flex-col flex-1 overflow-hidden">
              <Tabs defaultValue="basic" className="flex flex-col flex-1 overflow-hidden">
                <div className="px-6 pt-4">
                  <TabsList className={`grid w-full bg-muted/50 ${isPackage ? 'grid-cols-4' : 'grid-cols-3'}`}>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing & Tax</TabsTrigger>
                    {isPackage && (
                      <TabsTrigger value="package" className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Package Items
                        {selectedPackageServices.length > 0 && (
                          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                            {selectedPackageServices.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <TabsContent value="basic" className="space-y-4 mt-0">
                    {/* Package Toggle - Prominent at top */}
                    <FormField
                      control={form.control}
                      name="isPackage"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-primary" />
                            <div>
                              <FormLabel className="text-base cursor-pointer">Create as Package</FormLabel>
                              <p className="text-sm text-muted-foreground">
                                Bundle multiple services into a single package (e.g., Health Checkup)
                              </p>
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Service Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Name *</FormLabel>
                          <FormControl>
                            <Input placeholder={isPackage ? "e.g., Full Health Checkup Package" : "e.g., General Consultation"} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the service..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      {/* Category */}
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SERVICE_CATEGORIES.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Department */}
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Department *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DEPARTMENTS.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Service Type */}
                      <FormField
                        control={form.control}
                        name="serviceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SERVICE_TYPES.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SERVICE_STATUSES.map((status) => (
                                  <SelectItem key={status.id} value={status.id}>
                                    {status.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Duration */}
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Duration Unit */}
                      <FormField
                        control={form.control}
                        name="durationUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration Unit *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {DURATION_UNITS.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id}>
                                    {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Base Price */}
                      <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Base Price (₹) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                step={0.01}
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Billing Type */}
                      <FormField
                        control={form.control}
                        name="billingType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select billing type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BILLING_TYPES.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* HSN Code */}
                      <FormField
                        control={form.control}
                        name="hsnCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HSN/SAC Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 9993" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tax Category */}
                      <FormField
                        control={form.control}
                        name="taxCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Category *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tax category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TAX_CATEGORIES.map((tax) => (
                                  <SelectItem key={tax.id} value={tax.id}>
                                    {tax.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Insurance Category */}
                    <FormField
                      control={form.control}
                      name="insuranceCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Coverage</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select insurance category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {INSURANCE_CATEGORIES.map((ins) => (
                                <SelectItem key={ins.id} value={ins.id}>
                                  {ins.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Package Items Tab */}
                  {isPackage && (
                    <TabsContent value="package" className="space-y-4 mt-0">
                      {/* Package Summary */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-primary">{packageStats.count}</p>
                          <p className="text-xs text-muted-foreground">Services Included</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-foreground">{formatCurrency(packageStats.totalValue)}</p>
                          <p className="text-xs text-muted-foreground">Individual Value</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">
                            {packageStats.totalValue > 0
                              ? `${Math.round(((packageStats.totalValue - form.getValues('basePrice')) / packageStats.totalValue) * 100)}%`
                              : '0%'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">Discount</p>
                        </div>
                      </div>

                      {/* Search Services */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search services to add..."
                          value={serviceSearch}
                          onChange={(e) => setServiceSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      {/* Selected Services */}
                      {selectedPackageServices.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Selected Services ({selectedPackageServices.length})</Label>
                          <div className="flex flex-wrap gap-2">
                            {packageStats.services.map((service) => (
                              <Badge
                                key={service.id}
                                variant="secondary"
                                className="flex items-center gap-1 pr-1"
                              >
                                {service.name}
                                <span className="text-muted-foreground ml-1">
                                  {formatCurrency(service.basePrice)}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 hover:bg-destructive/20"
                                  onClick={() => handleToggleService(service.id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Available Services */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Available Services</Label>
                        <ScrollArea className="h-[200px] border border-border rounded-lg">
                          <div className="p-2 space-y-1">
                            {availableServices.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No services found
                              </p>
                            ) : (
                              availableServices.map((service) => {
                                const isSelected = selectedPackageServices.includes(service.id);
                                return (
                                  <div
                                    key={service.id}
                                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected
                                      ? 'bg-primary/10 border border-primary/30'
                                      : 'hover:bg-muted/50'
                                      }`}
                                    onClick={() => handleToggleService(service.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={() => handleToggleService(service.id)}
                                      />
                                      <div>
                                        <p className="text-sm font-medium">{service.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {service.code} • {SERVICE_CATEGORIES.find(c => c.id === service.category)?.name}
                                        </p>
                                      </div>
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                      {formatCurrency(service.basePrice)}
                                    </span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="settings" className="space-y-4 mt-0">
                    {/* Requires Appointment */}
                    <FormField
                      control={form.control}
                      name="requiresAppointment"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                          <div>
                            <FormLabel className="text-base">Requires Appointment</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              This service requires prior appointment booking
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Emergency Service */}
                    <FormField
                      control={form.control}
                      name="isEmergency"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
                          <div>
                            <FormLabel className="text-base">Emergency Service</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Available for emergency situations 24/7
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Internal Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes for staff..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </div>
              </Tabs>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Update Service' : 'Add Service'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
