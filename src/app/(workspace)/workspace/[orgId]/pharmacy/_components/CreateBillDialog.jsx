import { useState } from 'react';
import { mockMedicines } from '@/features/pharmacy/data/mockData';
import { jsPDF } from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Receipt, Download, CreditCard, Banknote, Shield, Plus, Trash2, FileDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function CreateBillDialog({
  prescription,
  open,
  onOpenChange,
  onBillCreated,
}) {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState('');
  const [items, setItems] = useState(() => 
    prescription.medicines.map((med) => {
      const medicine = mockMedicines.find(m => m.id === med.medicineId);
      const unitPrice = medicine?.sellingPrice || (prescription.totalAmount / prescription.medicines.length / med.quantity);
      return {
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        quantity: med.quantity,
        unitPrice,
        total: unitPrice * med.quantity,
      };
    })
  );
  const [selectedMedicine, setSelectedMedicine] = useState('');

  const taxRate = 0.05;
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * taxRate;
  const grandTotal = taxableAmount + taxAmount;
  const change = parseFloat(amountPaid || '0') - grandTotal;

  const billNumber = `BILL-${Date.now().toString().slice(-8)}`;

  const handleAddMedicine = () => {
    if (!selectedMedicine) return;
    
    const medicine = mockMedicines.find(m => m.id === selectedMedicine);
    if (!medicine) return;

    const existingIndex = items.findIndex(item => item.medicineId === selectedMedicine);
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
    setSelectedMedicine('');
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

  // Pharmacy branding info - customize these values
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
    doc.setFillColor(37, 99, 235); // Primary blue color
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
    doc.roundedRect(20, y - 5, pageWidth - 40, 28, 3, 3, 'FD');
    
    doc.text(`Bill Number: ${billNumber}`, 25, y + 2);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 25, y + 2, { align: 'right' });
    y += 10;
    doc.text(`Prescription ID: ${prescription.id}`, 25, y + 2);
    y += 10;
    doc.text(`Patient: ${prescription.patientName} (${prescription.patientId})`, 25, y + 2);
    y += 20;
    
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
    
    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    // Thank you message
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing ' + pharmacyInfo.name + '!', pageWidth / 2, footerY + 2, { align: 'center' });
    
    // Footer info
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
      prescriptionId: prescription.id,
      patientName: prescription.patientName,
      patientId: prescription.patientId,
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
    onOpenChange(false);
  };

  const availableMedicines = mockMedicines.filter(
    m => m.status !== 'out-of-stock' && !items.find(item => item.medicineId === m.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Create Bill
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Header */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bill Number:</span>
              <span className="font-mono font-semibold text-primary">{billNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Prescription ID:</span>
              <span className="font-mono">{prescription.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Patient:</span>
              <span>{prescription.patientName} ({prescription.patientId})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Add Medicine */}
          <div className="flex gap-2">
            <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select medicine to add" />
              </SelectTrigger>
              <SelectContent>
                {availableMedicines.map((medicine) => (
                  <SelectItem key={medicine.id} value={medicine.id}>
                    {medicine.name} - ₹{medicine.sellingPrice.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddMedicine} disabled={!selectedMedicine}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

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
              {parseFloat(amountPaid || '0') >= grandTotal && (
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
              <Download className="w-4 h-4 mr-2" />
              Generate Bill
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
