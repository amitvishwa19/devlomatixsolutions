import { useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Edit, Copy, Trash2, Clock, IndianRupee, Building2, Users, Calendar,
  Shield, AlertCircle, FileText, Package, Printer, Percent, CheckCircle2
} from 'lucide-react';
import { formatCurrency, formatDuration, formatDate, getStatusConfig, getCategoryConfig, calculatePriceWithTax } from '../utils/utils';
import { TAX_CATEGORIES, INSURANCE_CATEGORIES, BILLING_TYPES, SERVICE_TYPES, SERVICE_CATEGORIES } from '../utils/types';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockServices } from '../utils/mockData';

export function ServiceDetailSheet({ service, open, onOpenChange, onEdit, onDuplicate, onDelete }) {
  const [allServices] = useLocalStorage('hms_services', mockServices);

  // Get included services if this is a package - must be before any early returns
  const includedServices = useMemo(() => {
    if (!service?.isPackage || !service?.packageServices) return [];
    return allServices.filter(s => service.packageServices.includes(s.id));
  }, [service, allServices]);

  const packageStats = useMemo(() => {
    if (!service?.isPackage) return null;
    const totalValue = includedServices.reduce((sum, s) => sum + s.basePrice, 0);
    const discount = totalValue - (service?.basePrice || 0);
    const discountPercent = totalValue > 0 ? Math.round((discount / totalValue) * 100) : 0;
    return { totalValue, discount, discountPercent };
  }, [service, includedServices]);

  // Early return AFTER all hooks
  if (!service) return null;

  const statusConfig = getStatusConfig(service.status);
  const categoryConfig = getCategoryConfig(service.category);
  const taxCategory = TAX_CATEGORIES.find(t => t.id === service.taxCategory);
  const insuranceCategory = INSURANCE_CATEGORIES.find(i => i.id === service.insuranceCategory);
  const billingType = BILLING_TYPES.find(b => b.id === service.billingType);
  const serviceType = SERVICE_TYPES.find(s => s.id === service.serviceType);
  const priceDetails = calculatePriceWithTax(service.basePrice, service.taxCategory);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 bg-transparent border-none overflow-y-auto">
        <div className="bg-card rounded-xl border border-border min-w-[620px] m-4">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={statusConfig.color}>
                    {statusConfig.name}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {categoryConfig.name}
                  </Badge>
                  {service.isPackage && (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Package className="w-3 h-3 mr-1" />
                      Package
                    </Badge>
                  )}
                  {service.isEmergency && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Emergency
                    </Badge>
                  )}
                </div>
                <SheetHeader className="text-left p-0">
                  <SheetTitle className="text-xl">{service.name}</SheetTitle>
                  <SheetDescription className="text-sm">
                    Code: {service.code} | HSN: {service.hsnCode}
                  </SheetDescription>
                </SheetHeader>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <IndianRupee className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="font-bold text-foreground">{formatCurrency(service.basePrice)}</p>
                <p className="text-xs text-muted-foreground">Base Price</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="font-bold text-foreground">{formatDuration(service.duration, service.durationUnit)}</p>
                <p className="text-xs text-muted-foreground">Duration</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="font-bold text-foreground">{service.usageCount?.toLocaleString('en-IN') || 0}</p>
                <p className="text-xs text-muted-foreground">Total Uses</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Building2 className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="font-bold text-foreground capitalize">{service.department}</p>
                <p className="text-xs text-muted-foreground">Department</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue={service.isPackage ? "package" : "details"} className="w-full">
              <TabsList className={`grid w-full ${service.isPackage ? 'grid-cols-4' : 'grid-cols-3'}`}>
                <TabsTrigger value="details">Details</TabsTrigger>
                {service.isPackage && (
                  <TabsTrigger value="package" className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Package ({includedServices.length})
                  </TabsTrigger>
                )}
                <TabsTrigger value="pricing">Pricing & Tax</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-4">
                {/* Description */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {service.description || 'No description available.'}
                    </p>
                    {service.notes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{service.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Service Configuration */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Service Type</p>
                        <p className="font-medium">{serviceType?.name || service.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Billing Type</p>
                        <p className="font-medium">{billingType?.name || service.billingType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Requires Appointment</p>
                        <p className="font-medium">{service.requiresAppointment ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Emergency Service</p>
                        <p className="font-medium">{service.isEmergency ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">{formatDate(service.createdAt)}</span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Updated:</span>
                        <span className="font-medium">{formatDate(service.updatedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Package Tab */}
              {service.isPackage && (
                <TabsContent value="package" className="mt-4 space-y-4">
                  {/* Package Savings */}
                  {packageStats && (
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-foreground">{includedServices.length}</p>
                            <p className="text-xs text-muted-foreground">Services Included</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(packageStats.totalValue)}</p>
                            <p className="text-xs text-muted-foreground">Individual Value</p>
                          </div>
                          <div>
                            <div className="flex items-center justify-center gap-1">
                              <Percent className="w-4 h-4 text-green-600" />
                              <p className="text-2xl font-bold text-green-600">{packageStats.discountPercent}%</p>
                            </div>
                            <p className="text-xs text-muted-foreground">Savings ({formatCurrency(packageStats.discount)})</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Included Services List */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Included Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[250px]">
                        <div className="space-y-2">
                          {includedServices.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No services configured for this package
                            </p>
                          ) : (
                            includedServices.map((svc) => {
                              const svcCategory = SERVICE_CATEGORIES.find(c => c.id === svc.category);
                              return (
                                <div
                                  key={svc.id}
                                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    <div>
                                      <p className="text-sm font-medium">{svc.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {svc.code} • {svcCategory?.name || svc.category}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-sm font-medium text-muted-foreground">
                                    {formatCurrency(svc.basePrice)}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="pricing" className="mt-4 space-y-4">
                {/* Price Breakdown */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Price Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Base Price</span>
                        <span className="font-medium">{formatCurrency(priceDetails.basePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Tax ({taxCategory?.name || 'Exempt'})
                        </span>
                        <span className="font-medium">{formatCurrency(priceDetails.taxAmount)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-base font-bold">
                        <span>Total Price</span>
                        <span className="text-primary">{formatCurrency(priceDetails.totalPrice)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax & Compliance */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Tax & Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">HSN/SAC Code</p>
                        <p className="font-mono font-medium">{service.hsnCode}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Tax Category</p>
                        <p className="font-medium">{taxCategory?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Insurance Coverage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge
                      variant="outline"
                      className={
                        service.insuranceCategory === 'covered'
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : service.insuranceCategory === 'partial'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }
                    >
                      {insuranceCategory?.name || 'Not Specified'}
                    </Badge>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Service Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Appointment Required</p>
                          <p className="text-xs text-muted-foreground">
                            Service requires prior appointment booking
                          </p>
                        </div>
                        <Badge variant={service.requiresAppointment ? 'default' : 'secondary'}>
                          {service.requiresAppointment ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Emergency Service</p>
                          <p className="text-xs text-muted-foreground">
                            Available for emergency situations
                          </p>
                        </div>
                        <Badge variant={service.isEmergency ? 'destructive' : 'secondary'}>
                          {service.isEmergency ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Package Service</p>
                          <p className="text-xs text-muted-foreground">
                            This is a bundled package of multiple services
                          </p>
                        </div>
                        <Badge variant={service.isPackage ? 'default' : 'secondary'}>
                          {service.isPackage ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onDuplicate?.(service)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={() => onDelete?.(service)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button size="sm" onClick={() => onEdit?.(service)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
