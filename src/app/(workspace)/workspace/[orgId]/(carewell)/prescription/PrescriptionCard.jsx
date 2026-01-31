import { format } from 'date-fns';
import { Pill, User, Stethoscope, RefreshCw, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusConfig, getFrequencyShortLabel } from './utils';

export function PrescriptionCard({ prescription, onClick }) {
  const statusConfig = getStatusConfig(prescription.status);

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(prescription)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{prescription.patientName}</p>
            <p className="text-xs text-muted-foreground">{prescription.patientMrn}</p>
          </div>
        </div>
        <Badge className={statusConfig.color} variant="outline">
          {statusConfig.label}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Stethoscope className="w-3.5 h-3.5" />
          <span className="truncate">{prescription.doctor}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{format(new Date(prescription.prescribedDate), 'dd MMM yyyy')}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
        {prescription.diagnosis}
      </p>

      <div className="border-t border-border pt-3">
        <p className="text-xs text-muted-foreground mb-2">
          {prescription.medicines.length} medicine{prescription.medicines.length > 1 ? 's' : ''}
        </p>
        <div className="flex flex-wrap gap-1">
          {prescription.medicines.slice(0, 3).map((med, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {med.name} {med.dosage}
            </Badge>
          ))}
          {prescription.medicines.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{prescription.medicines.length - 3} more
            </Badge>
          )}
        </div>
      </div>

      {prescription.refillsRemaining > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3" />
          <span>{prescription.refillsRemaining} refill{prescription.refillsRemaining > 1 ? 's' : ''} remaining</span>
        </div>
      )}
    </Card>
  );
}
