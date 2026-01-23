import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Download, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

const statusStyles = {
  paid: "bg-success/10 text-success border-success/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
};

const BillViewDialog = ({ open, onOpenChange, bill }) => {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    // Helper functions
    const centerText = (text, yPos, size = 12) => {
      doc.setFontSize(size);
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, yPos);
    };

    const addField = (label, value, x, yPos) => {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(label, x, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value || "N/A", x, yPos + 4);
    };

    // Header - Hospital Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 153);
    centerText("APOLLO SPECIALITY HOSPITAL", y);
    
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    centerText("14th Cross Road, 212, Sri Nitturu Srinivasarao Rd, Jayanagar, Bengaluru - 560011", y);
    
    y += 5;
    doc.setFontSize(9);
    centerText("Contact: 408374 | Email: info@apollohospital.com", y);

    // Invoice Title & Number
    y += 12;
    doc.setDrawColor(0, 102, 153);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("TAX INVOICE", margin, y);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice No: ${bill.id}`, pageWidth - margin - 50, y);
    
    y += 6;
    doc.setFontSize(9);
    doc.text(`Date: ${bill.dischargeDate}`, pageWidth - margin - 50, y);

    // Patient Information Box
    y += 10;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 45, 2, 2, 'F');
    
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 102, 153);
    doc.text("PATIENT INFORMATION", margin + 5, y);
    
    y += 8;
    doc.setTextColor(0, 0, 0);
    
    // Row 1
    addField("Patient Name:", bill.patient, margin + 5, y);
    addField("Patient Issue:", bill.patientIssue, margin + 65, y);
    addField("Age:", bill.age, margin + 130, y);
    
    // Row 2
    y += 14;
    addField("Guardian Name:", bill.guardianName, margin + 5, y);
    addField("Mobile:", bill.mobile, margin + 65, y);
    addField("Insurance:", bill.insuranceAvailable, margin + 130, y);
    
    // Row 3
    y += 14;
    addField("Admit Date:", bill.admitDate, margin + 5, y);
    addField("Discharge Date:", bill.dischargeDate, margin + 65, y);
    addField("Room:", bill.roomCategory, margin + 130, y);

    // Consultant Information
    y += 18;
    doc.setFillColor(240, 248, 255);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 14, 2, 2, 'F');
    
    y += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Consulting Doctor: ${bill.consultant}`, margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.text(`(${bill.consultantSpecialty})`, margin + 60, y);

    // Services Table Header
    y += 14;
    doc.setFillColor(0, 102, 153);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("S.No", margin + 5, y + 5.5);
    doc.text("Service Description", margin + 20, y + 5.5);
    doc.text("Unit Price", margin + 110, y + 5.5);
    doc.text("Amount", margin + 145, y + 5.5);

    // Services Table Body
    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    bill.services.forEach((service, index) => {
      y += 8;
      doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 248);
      doc.rect(margin, y - 5, pageWidth - margin * 2, 8, 'F');
      
      doc.text(`${index + 1}`, margin + 5, y);
      doc.text(service.name.substring(0, 45), margin + 20, y);
      doc.text(`₹ ${service.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + 110, y);
      doc.text(`₹ ${service.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + 145, y);
    });

    // Table border
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y - 5 - (bill.services.length * 8), pageWidth - margin * 2, bill.services.length * 8 + 8, 'S');

    // Payment & Tax Summary
    y += 15;
    doc.setDrawColor(0, 102, 153);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 12;
    
    // Left side - Payment method
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Payment Details", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Method: ${bill.paymentMethod}`, margin, y + 6);
    doc.text(`Status: ${bill.status.toUpperCase()}`, margin, y + 12);

    // Right side - Amount breakdown
    const rightX = pageWidth - margin - 60;
    doc.setFontSize(9);
    doc.text("Subtotal:", rightX, y);
    doc.text(`₹ ${(bill.totalAmount - bill.cgst - bill.sgst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightX + 40, y);
    
    y += 6;
    doc.text(`CGST (9%):`, rightX, y);
    doc.text(`₹ ${bill.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightX + 40, y);
    
    y += 6;
    doc.text(`SGST (9%):`, rightX, y);
    doc.text(`₹ ${bill.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightX + 40, y);
    
    y += 8;
    doc.setDrawColor(0, 102, 153);
    doc.line(rightX - 5, y - 2, pageWidth - margin, y - 2);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 102, 153);
    doc.text("TOTAL:", rightX, y + 4);
    doc.text(`₹ ${bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, rightX + 40, y + 4);

    // Remark Section
    y += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(255, 250, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, 'F');
    
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Remarks:", margin + 5, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const remarkLines = doc.splitTextToSize(bill.remark, pageWidth - margin * 2 - 10);
    doc.text(remarkLines.slice(0, 2), margin + 5, y + 5);

    // Footer
    y += 25;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    
    y += 8;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    centerText("This is a computer-generated invoice and does not require a signature.", y);
    
    y += 5;
    centerText(`Generated on: ${new Date().toLocaleString('en-IN')}`, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 102, 153);
    centerText("Thank you for choosing Apollo Speciality Hospital!", y);

    // Save the PDF
    doc.save(`Invoice_${bill.id}.pdf`);
    
    toast.success("PDF Downloaded", {
      description: `Invoice ${bill.id} has been saved successfully`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Actions */}
        <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold font-heading">Invoice Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button size="sm" onClick={generatePDF} className="gap-2 bg-primary hover:bg-primary/90">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6 space-y-6 print:p-0">
          {/* Hospital Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Apollo Speciality Hospital</h1>
              <p className="text-sm text-muted-foreground">Invoice No: {bill.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">+</span>
              </div>
              <span className="text-lg font-bold text-primary">HOSPITAL</span>
            </div>
          </div>

          {/* Hospital Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-foreground mb-1">Hospital details:</p>
              <p className="text-muted-foreground leading-relaxed">
                Apollo Group constitutes the best hospital in India with over 10,000 beds across 73 hospitals, 
                5000+ pharmacies, over 300 clinics, 1100+ diagnostic centres and 200+ Telemedicine units.
                <br />Contact Details: 408374
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">Apollo Speciality Hospital</p>
              <p className="text-muted-foreground leading-relaxed">
                14th Cross Road, 212, Sri Nitturu Srinivasarao Rd,<br />
                near Madhavan Park Circle, Jayanagar 3rd Block,<br />
                Jayanagar, Bengaluru, Karnataka 560011
              </p>
            </div>
          </div>

          <div className="text-sm">
            <span className="font-semibold">Discharge Date:</span>
            <span className="ml-2 text-muted-foreground">{bill.dischargeDate}</span>
          </div>

          <Separator />

          {/* Patient Information */}
          <div>
            <h3 className="font-semibold text-foreground border-b-2 border-foreground pb-1 mb-4">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Patient Name:</p>
                  <p className="text-muted-foreground">{bill.patient}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Guardian Name:</p>
                  <p className="text-muted-foreground">{bill.guardianName}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Insurance Avl:</p>
                  <p className="text-muted-foreground">{bill.insuranceAvailable}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Consultant:</p>
                  <p className="text-muted-foreground">{bill.consultant}</p>
                  <p className="text-muted-foreground text-xs">{bill.consultantSpecialty}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Patient Issue:</p>
                  <p className="text-muted-foreground">{bill.patientIssue}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Admit Date:</p>
                  <p className="text-muted-foreground">{bill.admitDate}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Age:</p>
                  <p className="text-muted-foreground">{bill.age}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Room Category:</p>
                  <p className="text-muted-foreground">{bill.roomCategory}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-foreground">Address:</p>
                  <p className="text-muted-foreground leading-relaxed">{bill.address}</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Mobile:</p>
                  <p className="text-muted-foreground">{bill.mobile}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-semibold border-b border-border">Details</th>
                  <th className="text-right p-3 font-semibold border-b border-border">Price</th>
                  <th className="text-right p-3 font-semibold border-b border-border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.services.map((service, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="p-3 text-muted-foreground">{service.name}</td>
                    <td className="p-3 text-right text-muted-foreground">₹{service.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-medium">₹{service.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment & Tax Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm space-y-1">
              <p className="font-semibold text-foreground">Pay By</p>
              <p className="text-muted-foreground">{bill.paymentMethod}</p>
              <p className="text-muted-foreground">Amount: ₹ {bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="text-sm text-right space-y-1">
              <p><span className="font-semibold">Tax:</span> <span className="text-muted-foreground">{bill.taxPercent} %</span></p>
              <p><span className="text-muted-foreground">CGST 9 % -</span> <span className="font-medium">₹ {bill.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
              <p><span className="text-muted-foreground">SGST 9 % -</span> <span className="font-medium">₹ {bill.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
              <p><span className="font-semibold">Taxable Amount:</span> <span className="font-medium">₹ {bill.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p>
              <p className="text-base font-bold text-primary">Total Amount: ₹ {bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <Separator />

          {/* Remark Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
            <div className="text-sm">
              <p className="font-semibold text-foreground mb-2">Remark:</p>
              <p className="text-muted-foreground leading-relaxed text-xs">
                {bill.remark}
              </p>
            </div>
            <div className="text-sm text-right">
              <p className="font-semibold text-foreground">{bill.consultant}</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {bill.hospitalNote}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center pt-2">
            <Badge 
              variant="outline" 
              className={cn("capitalize text-sm px-4 py-1", statusStyles[bill.status])}
            >
              {bill.status}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillViewDialog;
