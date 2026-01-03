import { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Receipt, CreditCard, Banknote, Shield, Plus, Trash2, FileDown, User, ScanBarcode, Calendar, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BarcodeScanner } from './BarcodeScanner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockAppointments, mockMedicines, mockPatients } from '../_data/mockData';

// Mock prescriptions for quick bill selection
const mockPrescriptionsLocal = [
  { id: 'rx1', patientName: 'Rajesh Kumar', doctor: 'Dr. Arun Joshi', date: '2024-01-14', medicines: ['Paracetamol 500mg', 'Amoxicillin 250mg'] },
  { id: 'rx2', patientName: 'Priya Sharma', doctor: 'Dr. Meera Iyer', date: '2024-01-13', medicines: ['Ibuprofen 400mg'] },
  { id: 'rx3', patientName: 'Sunita Gupta', doctor: 'Dr. Arun Joshi', date: '2024-01-12', medicines: ['Cetirizine 10mg', 'Paracetamol 500mg'] },
];

export function QuickBillDialog({
  open,
  onOpenChange,
  onBillCreated,
}) {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [items, setItems] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const taxRate = 0.05;
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = taxableAmount + taxAmount;
  const change = parseFloat(amountPaid || '0') - grandTotal;

  const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

  const handlePatientChange = (patientId) => {
    setSelectedPatientId(patientId);
    const patient = mockPatients.find(p => p.id === patientId);
    if (patient) {
      setCustomerName(patient.name);
      setCustomerPhone(patient.phone);
      toast({
        title: 'Patient Selected',
        description: `${patient.name} has been selected.`,
      });
    }
  };

  const handleAppointmentChange = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    const appointment = mockAppointments.find(a => a.id === appointmentId);
    if (appointment) {
      const patient = mockPatients.find(p => p.name === appointment.patientName);
      if (patient) {
        setCustomerName(patient.name);
        setCustomerPhone(patient.phone);
      } else {
        setCustomerName(appointment.patientName);
      }
      toast({
        title: 'Appointment Selected',
        description: `Appointment for ${appointment.patientName} selected.`,
      });
    }
  };

  const handlePrescriptionChange = (prescriptionId) => {
    setSelectedPrescriptionId(prescriptionId);
    const prescription = mockPrescriptionsLocal.find(p => p.id === prescriptionId);
    if (prescription) {
      const patient = mockPatients.find(p => p.name === prescription.patientName);
      if (patient) {
        setCustomerName(patient.name);
        setCustomerPhone(patient.phone);
      } else {
        setCustomerName(prescription.patientName);
      }

      // Auto-add medicines from prescription
      prescription.medicines.forEach(medName => {
        const medicine = mockMedicines.find(m => m.name.toLowerCase().includes(medName.toLowerCase().split(' ')[0]));
        if (medicine && medicine.status !== 'out-of-stock') {
          addMedicineToCart(medicine);
        }
      });

      toast({
        title: 'Prescription Selected',
        description: `Prescription for ${prescription.patientName} loaded with ${prescription.medicines.length} items.`,
      });
    }
  };

  const addMedicineToCart = (medicine) => {
    const existingIndex = items.findIndex(item => item.medicineId === medicine.id);
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].total = updatedItems[existingIndex].quantity * updatedItems[existingIndex].unitPrice;
      setItems(updatedItems);
    } else {
      setItems([...items, {
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity: 1,
        unitPrice: medicine.sellingPrice,
        total: medicine.sellingPrice,
      }]);
    }
  };

  const handleAddMedicine = () => {
    if (!selectedMedicine) return;

    const medicine = mockMedicines.find(m => m.id === selectedMedicine);
    if (!medicine) return;

    addMedicineToCart(medicine);
    setSelectedMedicine('');
  };

  const handleBarcodeScan = (barcode) => {
    const medicine = mockMedicines.find(m => m.barcode === barcode);
    if (medicine) {
      if (medicine.status === 'out-of-stock') {
        toast({
          title: 'Out of Stock',
          description: `${medicine.name} is currently out of stock.`,
          variant: 'destructive',
        });
        return;
      }
      addMedicineToCart(medicine);
      toast({
        title: 'Medicine Added',
        description: `${medicine.name} added to bill.`,
      });
    } else {
      toast({
        title: 'Not Found',
        description: `No medicine found with barcode: ${barcode}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = newQuantity * updatedItems[index].unitPrice;
    setItems(updatedItems);
  };

  // Pharmacy branding info
  const pharmacyInfo = {
    name: 'Shree Ganesh Medical Store',
    tagline: 'Aapki Sehat, Hamari Zimmedari',
    address: '45, MG Road, Andheri West',
    city: 'Mumbai, Maharashtra 400058',
    phone: '+91 22 2634 5678',
    email: 'info@shreeganeshmedical.in',
    license: 'MH-PHM-2024-001234',
  };

  const handleDownloadPDF = () => {
    if (items.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add at least one medicine to download the bill.',
        variant: 'destructive',
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header with pharmacy branding
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Pharmacy name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(pharmacyInfo.name, 20, 18);

    // Tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(pharmacyInfo.tagline, 20, 26);

    // Contact info on the right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(pharmacyInfo.address, pageWidth - 20, 12, { align: 'right' });
    doc.text(pharmacyInfo.city, pageWidth - 20, 18, { align: 'right' });
    doc.text(`Phone: ${pharmacyInfo.phone}`, pageWidth - 20, 24, { align: 'right' });
    doc.text(`Email: ${pharmacyInfo.email}`, pageWidth - 20, 30, { align: 'right' });
    doc.text(`License: ${pharmacyInfo.license}`, pageWidth - 20, 36, { align: 'right' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Bill title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE / BILL', pageWidth / 2, 58, { align: 'center' });

    // Bill info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let y = 70;

    // Bill details box
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y - 5, pageWidth - 40, 22, 3, 3, 'FD');

    doc.text(`Bill Number: ${billNumber}`, 25, y + 2);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 25, y + 2, { align: 'right' });
    y += 10;
    doc.text(`Customer: ${customerName || 'Walk-in Customer'}`, 25, y + 2);
    if (customerPhone) {
      doc.text(`Phone: ${customerPhone}`, pageWidth - 25, y + 2, { align: 'right' });
    }
    y += 15;

    // Table header
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(37, 99, 235);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
    doc.text('Medicine', 25, y);
    doc.text('Qty', 100, y);
    doc.text('Unit Price', 125, y);
    doc.text('Total', pageWidth - 25, y, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    items.forEach((item) => {
      doc.text(item.medicineName.substring(0, 35), 25, y);
      doc.text(item.quantity.toString(), 100, y);
      doc.text(`Rs.${item.unitPrice.toFixed(2)}`, 125, y);
      doc.text(`Rs.${item.total.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });
      y += 8;
    });

    // Line separator
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Totals
    doc.text(`Subtotal:`, 120, y);
    doc.text(`Rs.${subtotal.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });
    y += 7;

    if (discount > 0) {
      doc.setTextColor(34, 197, 94);
      doc.text(`Discount (${discount}%):`, 120, y);
      doc.text(`-Rs.${discountAmount.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += 7;
    }

    doc.text(`Tax (5%):`, 120, y);
    doc.text(`Rs.${taxAmount.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });
    y += 10;

    // Grand total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Grand Total:`, 120, y);
    doc.text(`Rs.${grandTotal.toFixed(2)}`, pageWidth - 25, y, { align: 'right' });
    y += 15;

    // Payment info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`, 20, y);

    if (paymentMethod === 'cash' && parseFloat(amountPaid || '0') >= grandTotal) {
      y += 7;
      doc.text(`Amount Paid: Rs.${parseFloat(amountPaid).toFixed(2)}`, 20, y);
      y += 7;
      doc.text(`Change: Rs.${Math.max(0, change).toFixed(2)}`, 20, y);
    }

    // Footer section
    const footerY = doc.internal.pageSize.getHeight() - 35;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing ' + pharmacyInfo.name + '!', pageWidth / 2, footerY + 2, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated invoice. No signature required.', pageWidth / 2, footerY + 10, { align: 'center' });
    doc.text(`${pharmacyInfo.phone} | ${pharmacyInfo.email}`, pageWidth / 2, footerY + 16, { align: 'center' });

    // Save PDF
    doc.save(`${billNumber}.pdf`);

    toast({
      title: 'PDF Downloaded',
      description: `Bill ${billNumber} has been downloaded.`,
    });
  };

  const handleCreateBill = () => {
    if (items.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add at least one medicine to the bill.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'cash' && parseFloat(amountPaid || '0') < grandTotal) {
      toast({
        title: 'Insufficient Payment',
        description: 'Amount paid must be equal to or greater than the total.',
        variant: 'destructive',
      });
      return;
    }

    const billData = {
      billNumber,
      customerName: customerName || 'Walk-in Customer',
      customerPhone,
      date: new Date().toISOString(),
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      grandTotal,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : grandTotal,
      change: paymentMethod === 'cash' ? Math.max(0, change) : 0,
    };

    onBillCreated?.(billData);
    toast({
      title: 'Bill Created Successfully',
      description: `Bill ${billNumber} has been generated.`,
    });

    // Reset form
    setItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    setAmountPaid('');
    setPaymentMethod('cash');
    onOpenChange(false);
  };

  const availableMedicines = mockMedicines.filter(
    m => m.status !== 'out-of-stock'
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Quick Bill
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Source Selection - Tabs with Select Components */}
            <Tabs defaultValue="patient" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patient" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Patient
                </TabsTrigger>
                <TabsTrigger value="appointment" className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Appointment
                </TabsTrigger>
                <TabsTrigger value="prescription" className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  Prescription
                </TabsTrigger>
              </TabsList>

              <TabsContent value="patient" className="mt-4">
                <Select value={selectedPatientId} onValueChange={handlePatientChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPatients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex flex-col items-start">
                          <span>{patient.name}</span>
                          <span className="text-xs text-muted-foreground">{patient.phone}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="appointment" className="mt-4">
                <Select value={selectedAppointmentId} onValueChange={handleAppointmentChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an appointment" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAppointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        <div className="flex flex-col items-start">
                          <span>{appointment.patientName}</span>
                          <span className="text-xs text-muted-foreground">{appointment.time} • {appointment.doctorName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="prescription" className="mt-4">
                <Select value={selectedPrescriptionId} onValueChange={handlePrescriptionChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a prescription" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockPrescriptionsLocal.map((prescription) => (
                      <SelectItem key={prescription.id} value={prescription.id}>
                        <div className="flex flex-col items-start">
                          <span>{prescription.patientName}</span>
                          <span className="text-xs text-muted-foreground">{prescription.doctor} • {prescription.medicines.length} items</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>
            </Tabs>

            {/* Customer Info */}
            <div className="bg-secondary/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Customer Information
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone (Optional)</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bill Number:</span>
                <span className="font-mono font-semibold text-primary">{billNumber}</span>
              </div>
            </div>

            {/* Add Medicine */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setScannerOpen(true)}
                className="flex-shrink-0"
              >
                <ScanBarcode className="w-4 h-4 mr-1" />
                Scan
              </Button>
              <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select medicine to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableMedicines.map((medicine) => (
                    <SelectItem key={medicine.id} value={medicine.id}>
                      {medicine.name} - ₹{medicine.sellingPrice.toFixed(2)} (Stock: {medicine.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddMedicine} disabled={!selectedMedicine}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Barcode Scanner */}
            <BarcodeScanner
              open={scannerOpen}
              onOpenChange={setScannerOpen}
              onScan={handleBarcodeScan}
            />

            {/* Items Table */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Items</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Medicine</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Unit Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                      <th className="text-center p-3 font-medium w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-muted-foreground">
                          No items added. Select a medicine above to add.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={index} className="border-t border-border">
                          <td className="p-3">{item.medicineName}</td>
                          <td className="p-3 text-center">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-center mx-auto"
                            />
                          </td>
                          <td className="p-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                          <td className="p-3 text-right">₹{item.total.toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteItem(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Discount */}
            <div className="flex items-center gap-4">
              <Label htmlFor="discount" className="w-24">Discount %</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-24"
              />
            </div>

            {/* Totals */}
            <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Discount ({discount}%):</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (5%):</span>
                <span>₹{taxAmount.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total:</span>
                <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote className="w-4 h-4" />
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="w-4 h-4" />
                  Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'insurance' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                  onClick={() => setPaymentMethod('insurance')}
                >
                  <Shield className="w-4 h-4" />
                  Insurance
                </Button>
              </div>
            </div>

            {/* Amount Paid (for cash) */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <Label htmlFor="amountPaid" className="w-24">Amount Paid</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    step="0.01"
                    min={0}
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={grandTotal.toFixed(2)}
                    className="flex-1"
                  />
                </div>
                {parseFloat(amountPaid || '0') >= grandTotal && items.length > 0 && (
                  <div className="flex justify-between text-lg font-semibold bg-green-500/10 text-green-400 rounded-lg p-3">
                    <span>Change:</span>
                    <span>₹{Math.max(0, change).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleDownloadPDF} className="flex-1">
                <FileDown className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleCreateBill} className="flex-1">
                <Receipt className="w-4 h-4 mr-2" />
                Complete Sale
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
