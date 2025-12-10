import { StatusBadge } from './StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Search, Filter, FileX, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format } from 'date-fns';


export function PrescriptionList({ prescriptions, onView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      const matchesSearch =
        prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [prescriptions, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by ID, patient, doctor, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="dispensed">Dispensed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredPrescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted mb-4">
            <FileX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-1">No prescriptions found</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first prescription to get started'}
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Prescription ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell className="font-medium text-primary">
                    {prescription.prescriptionNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{prescription.patient.name}</p>
                      <p className="text-xs text-muted-foreground">{prescription.patient.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{prescription.doctor.name}</p>
                      <p className="text-xs text-muted-foreground">{prescription.doctor.specialization}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {prescription.diagnosis}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {prescription.medications.length} item{prescription.medications.length !== 1 ? 's' : ''}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={prescription.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(prescription)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
