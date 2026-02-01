import { AlertCircle, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials, formatPatientDate, getStatusColor } from '../utils/utils';
import { PATIENT_STATUSES, BLOOD_GROUPS } from '../utils/types';

export function PatientTableView({ patients, onPatientClick }) {
    if (patients.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No patients found.</p>
            </div>
        );
    }

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-[250px]">Patient</TableHead>
                        <TableHead>MRN</TableHead>
                        <TableHead>Age/Gender</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead>Allergies</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => {
                        const status = PATIENT_STATUSES.find((s) => s.id === patient.status);
                        const bloodGroup = BLOOD_GROUPS.find((bg) => bg.id === patient.bloodGroup);

                        return (
                            <TableRow
                                key={patient.id}
                                className="cursor-pointer hover:bg-muted/30"
                                onClick={() => onPatientClick?.(patient)}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-sm">
                                            {getInitials(patient.fullName)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{patient.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{patient.email}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">{patient.mrn}</TableCell>
                                <TableCell className="text-sm">
                                    {patient.age} yrs / {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                        {bloodGroup?.label || '-'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{patient.phone}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`text-xs ${getStatusColor(patient.status)}`}>
                                        {status?.label}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatPatientDate(patient.lastVisit)}
                                </TableCell>
                                <TableCell>
                                    {patient.allergies?.length > 0 ? (
                                        <div className="flex items-center gap-1 text-xs text-destructive">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>{patient.allergies.length}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">None</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPatientClick?.(patient); }}>
                                                <Eye className="w-4 h-4 mr-2" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Patient
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
