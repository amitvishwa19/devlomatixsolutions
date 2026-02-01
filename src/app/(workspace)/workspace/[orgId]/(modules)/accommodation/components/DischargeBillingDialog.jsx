import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DoorOpen, IndianRupee, FileText, Sparkles, 
  Printer, Send, CheckCircle, AlertTriangle, Receipt
} from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { DISCHARGE_TYPES } from '../utils/types';
import { getRoomTypeById, formatCurrency, getLengthOfStay } from '../utils/utils';

// GST rates for different room types
const GST_RATES = {
  icu: 0.05, // 5% GST
  private: 0.12, // 12% GST
  semi_private: 0.12,
  general_ward: 0, // Exempt
  pediatric: 0.05,
  maternity: 0.05,
  emergency: 0,
  isolation: 0.05,
  operation_theater: 0.18, // 18% GST
  recovery: 0.12,
};

export function DischargeBillingDialog({ 
  open, 
  onOpenChange, 
  bed, 
  room, 
  onDischarge,
  onGenerateInvoice 
}) {
  const [dischargeType, setDischargeType] = React.useState('normal');
  const [notes, setNotes] = React.useState('');
  const [confirmBilling, setConfirmBilling] = React.useState(false);
  const [confirmDocuments, setConfirmDocuments] = React.useState(false);
  const [scheduleCleanup, setScheduleCleanup] = React.useState(true);
  const [additionalCharges, setAdditionalCharges] = React.useState([]);
  const [discountPercent, setDiscountPercent] = React.useState(0);
  const [discountReason, setDiscountReason] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [generateInvoice, setGenerateInvoice] = React.useState(true);

  // Calculate billing
  const billing = React.useMemo(() => {
    if (!bed || !room || !bed.admission) return null;

    const admissionDate = new Date(bed.admission.admittedAt);
    const dischargeDate = new Date();
    const days = Math.max(1, differenceInDays(dischargeDate, admissionDate) || 1);
    const hours = differenceInHours(dischargeDate, admissionDate) % 24;
    
    // Room charges
    const dailyRate = room.dailyRate;
    const roomCharges = days * dailyRate;
    
    // Calculate partial day charges (if hours > 12, count as full day)
    const partialDayCharge = hours > 12 ? dailyRate : hours > 0 ? dailyRate * 0.5 : 0;
    
    // GST
    const gstRate = GST_RATES[room.type] || 0;
    const subtotalRoom = roomCharges + partialDayCharge;
    const roomGst = subtotalRoom * gstRate;
    
    // Additional charges
    const additionalTotal = additionalCharges.reduce((sum, c) => sum + c.amount, 0);
    const additionalGst = additionalCharges.reduce((sum, c) => sum + (c.amount * (c.gstRate || 0)), 0);
    
    // Subtotal before discount
    const subtotal = subtotalRoom + additionalTotal;
    const totalGst = roomGst + additionalGst;
    
    // Discount
    const discountAmount = (subtotal * discountPercent) / 100;
    
    // Deposit already paid
    const depositPaid = bed.admission.depositPaid || 0;
    
    // Grand total
    const grandTotal = subtotal + totalGst - discountAmount;
    const balanceDue = grandTotal - depositPaid;

    return {
      admissionDate,
      dischargeDate,
      days,
      hours,
      dailyRate,
      roomCharges,
      partialDayCharge,
      subtotalRoom,
      gstRate,
      roomGst,
      additionalCharges: additionalTotal,
      additionalGst,
      subtotal,
      totalGst,
      discountPercent,
      discountAmount,
      depositPaid,
      grandTotal,
      balanceDue,
    };
  }, [bed, room, additionalCharges, discountPercent]);

  const addCharge = () => {
    setAdditionalCharges([
      ...additionalCharges,
      { id: Date.now(), description: '', amount: 0, gstRate: 0.18 }
    ]);
  };

  const updateCharge = (id, field, value) => {
    setAdditionalCharges(additionalCharges.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const removeCharge = (id) => {
    setAdditionalCharges(additionalCharges.filter(c => c.id !== id));
  };

  const handleSubmit = () => {
    const dischargeData = {
      bed,
      room,
      dischargeType,
      notes,
      scheduleCleanup,
      dischargedAt: new Date(),
      billing: generateInvoice ? {
        ...billing,
        additionalCharges,
        discountReason,
        paymentMethod,
        invoiceNumber: `INV-${Date.now()}`,
      } : null,
    };

    onDischarge?.(dischargeData);
    
    if (generateInvoice && billing) {
      onGenerateInvoice?.({
        patientName: bed.patient?.name,
        patientMRN: bed.patient?.mrn,
        patientPhone: bed.patient?.phone,
        roomNumber: room.roomNumber,
        bedNumber: bed.bedNumber,
        roomType: room.type,
        ...billing,
        additionalCharges,
        discountReason,
        paymentMethod,
        status: billing.balanceDue <= 0 ? 'paid' : 'pending',
      });
    }

    onOpenChange(false);
  };

  if (!bed || !room || !billing) return null;

  const roomType = getRoomTypeById(room.type);
  const canComplete = confirmBilling && confirmDocuments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Discharge & Billing
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="space-y-4 py-2 pr-4">
            {/* Patient & Room Info */}
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-semibold">{bed.patient?.name}</p>
                    <p className="text-xs text-muted-foreground">{bed.patient?.mrn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Room/Bed</p>
                    <div className="flex items-center gap-2">
                      <Badge className={roomType.color}>{bed.bedNumber}</Badge>
                      <span className="text-sm">{roomType.name}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admitted</p>
                    <p className="text-sm">{format(billing.admissionDate, 'dd MMM yyyy, HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-sm">{billing.days} days, {billing.hours} hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Charges */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Room Charges
              </h4>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Daily Rate × {billing.days} days</span>
                    <span>{formatCurrency(billing.roomCharges)}</span>
                  </div>
                  {billing.partialDayCharge > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Partial Day ({billing.hours} hours)</span>
                      <span>{formatCurrency(billing.partialDayCharge)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatCurrency(billing.subtotalRoom)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>GST ({(billing.gstRate * 100).toFixed(0)}%)</span>
                    <span>{formatCurrency(billing.roomGst)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Charges */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Additional Charges</h4>
                <Button size="sm" variant="outline" onClick={addCharge} className="h-7 text-xs">
                  Add Charge
                </Button>
              </div>
              {additionalCharges.length > 0 && (
                <Card>
                  <CardContent className="p-3 space-y-2">
                    {additionalCharges.map((charge) => (
                      <div key={charge.id} className="flex items-center gap-2">
                        <Input
                          placeholder="Description"
                          value={charge.description}
                          onChange={(e) => updateCharge(charge.id, 'description', e.target.value)}
                          className="flex-1 h-8 text-sm"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={charge.amount || ''}
                          onChange={(e) => updateCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-24 h-8 text-sm"
                        />
                        <Select
                          value={String(charge.gstRate)}
                          onValueChange={(v) => updateCharge(charge.id, 'gstRate', parseFloat(v))}
                        >
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="0.05">5%</SelectItem>
                            <SelectItem value="0.12">12%</SelectItem>
                            <SelectItem value="0.18">18%</SelectItem>
                            <SelectItem value="0.28">28%</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={() => removeCharge(charge.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Discount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Discount (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Discount Reason</Label>
                <Input
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="If applicable..."
                  className="h-9"
                />
              </div>
            </div>

            {/* Bill Summary */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Room Charges</span>
                  <span>{formatCurrency(billing.subtotalRoom)}</span>
                </div>
                {billing.additionalCharges > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Additional Charges</span>
                    <span>{formatCurrency(billing.additionalCharges)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Total GST</span>
                  <span>{formatCurrency(billing.totalGst)}</span>
                </div>
                {billing.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({discountPercent}%)</span>
                    <span>-{formatCurrency(billing.discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Grand Total</span>
                  <span>{formatCurrency(billing.grandTotal)}</span>
                </div>
                {billing.depositPaid > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Deposit Paid</span>
                    <span>-{formatCurrency(billing.depositPaid)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-primary">
                  <span>Balance Due</span>
                  <span>{formatCurrency(billing.balanceDue)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="neft">NEFT/RTGS</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Discharge Type</Label>
                <Select value={dischargeType} onValueChange={setDischargeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCHARGE_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {dischargeType === 'against_advice' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Patient is leaving against medical advice. Ensure documentation is complete.
                </span>
              </div>
            )}

            {/* Discharge Notes */}
            <div className="space-y-2">
              <Label className="text-sm">Discharge Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Discharge summary, follow-up instructions..."
                rows={2}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Discharge Checklist</p>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="billing" checked={confirmBilling} onCheckedChange={setConfirmBilling} />
                <label htmlFor="billing" className="text-sm flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5" />
                  Billing completed / settled
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="documents" checked={confirmDocuments} onCheckedChange={setConfirmDocuments} />
                <label htmlFor="documents" className="text-sm flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" />
                  Discharge summary provided to patient
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="cleanup" checked={scheduleCleanup} onCheckedChange={setScheduleCleanup} />
                <label htmlFor="cleanup" className="text-sm flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  Schedule bed for cleaning
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="invoice" checked={generateInvoice} onCheckedChange={setGenerateInvoice} />
                <label htmlFor="invoice" className="text-sm flex items-center gap-2">
                  <Receipt className="h-3.5 w-3.5" />
                  Generate invoice in Invoice module
                </label>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canComplete}
            variant={dischargeType === 'against_advice' ? 'destructive' : 'default'}
          >
            <DoorOpen className="h-4 w-4 mr-2" />
            Complete Discharge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
