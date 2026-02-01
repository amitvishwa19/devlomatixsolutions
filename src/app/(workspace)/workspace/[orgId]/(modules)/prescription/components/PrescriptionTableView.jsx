import { format } from 'date-fns';
import { Pill, MoreHorizontal, Eye, Printer, RefreshCw, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getStatusConfig } from '../utils/utils';

export function PrescriptionTableView({ prescriptions, onSelectPrescription, onDeletePrescription }) {
  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No prescriptions found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Medicines</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Refills</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prescriptions.map((rx) => {
            const statusConfig = getStatusConfig(rx.status);
            return (
              <TableRow
                key={rx.id}
                className="cursor-pointer"
                onClick={() => onSelectPrescription?.(rx)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{rx.patientName}</p>
                      <p className="text-xs text-muted-foreground">{rx.patientMrn}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{rx.doctor}</TableCell>
                <TableCell className="text-sm max-w-[200px] truncate">{rx.diagnosis}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {rx.medicines.slice(0, 2).map((med, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {med.name}
                      </Badge>
                    ))}
                    {rx.medicines.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{rx.medicines.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {format(new Date(rx.prescribedDate), 'dd MMM yyyy')}
                </TableCell>
                <TableCell>
                  <Badge className={statusConfig.color} variant="outline">
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-center">
                  {rx.refillsRemaining > 0 ? (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <RefreshCw className="w-3 h-3" />
                      {rx.refillsRemaining}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onSelectPrescription?.(rx);
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePrescription?.(rx.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
