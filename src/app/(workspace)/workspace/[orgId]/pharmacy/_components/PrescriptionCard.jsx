import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { User, Stethoscope, Clock, CheckCircle, XCircle, Receipt } from 'lucide-react';

export function PrescriptionCard({ prescription, onDispense, onCancel, onCreateBill }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="badge-warning border">Pending</Badge>;
      case 'dispensed':
        return <Badge className="badge-success border">Dispensed</Badge>;
      case 'cancelled':
        return <Badge className="badge-destructive border">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{prescription.patientName}</h3>
              <p className="text-sm text-muted-foreground">{prescription.patientId}</p>
            </div>
          </div>
          {getStatusBadge(prescription.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 ">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" />
            <span>{prescription.doctorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{prescription.date}</span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Prescribed Medicines</p>
          <ul className="space-y-2">
            {prescription.medicines.map((item, index) => (
              <li
                key={index}
                className="text-sm p-2 rounded-lg bg-secondary/30 flex justify-between items-center"
              >
                <div>
                  <span className="text-foreground">{item.medicineName}</span>
                  <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                </div>
                <span className="text-muted-foreground text-xs">{item.dosage}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-foreground">₹{prescription.totalAmount.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {onCreateBill && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onCreateBill(prescription)}
              >
                <Receipt className="w-4 h-4 mr-1" />
                Bill
              </Button>
            )}
            {prescription.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel?.(prescription.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => onDispense?.(prescription.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Dispense
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
