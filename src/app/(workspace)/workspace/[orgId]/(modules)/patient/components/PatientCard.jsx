import { Phone, Mail, MapPin, Calendar, AlertCircle, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getInitials, formatPatientDate, getStatusColor } from '../utils/utils';
import { PATIENT_STATUSES, BLOOD_GROUPS } from '../utils/types';
import { AssignedTags } from '../../taxonomy/components';


export function PatientCard({ patient, onClick }) {
    const status = PATIENT_STATUSES.find((s) => s.id === patient.status);
    const bloodGroup = BLOOD_GROUPS.find((bg) => bg.id === patient.bloodGroup);

    return (
        <Card
            className="border border-border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onClick?.(patient)}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg shrink-0">
                        {getInitials(patient.fullName)}
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-foreground truncate">{patient.fullName}</h3>
                                <p className="text-xs text-muted-foreground">{patient.mrn}</p>
                            </div>
                            <Badge variant="outline" className={`shrink-0 ${getStatusColor(patient.status)}`}>
                                {status?.label}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{patient.age} yrs, {patient.gender === 'male' ? 'M' : patient.gender === 'female' ? 'F' : 'O'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Droplets className="w-3 h-3" />
                                <span>{bloodGroup?.label || '-'}</span>
                            </div>
                            <div className="flex items-center gap-1 truncate">
                                <Phone className="w-3 h-3 shrink-0" />
                                <span className="truncate">{patient.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>Last: {formatPatientDate(patient.lastVisit)}</span>
                            </div>
                        </div>

                        {/* Tags */}
                        {(patient.tags?.length > 0 || patient.categories?.length > 0) && (
                            <AssignedTags tagIds={patient.tags} categoryIds={patient.categories} compact />
                        )}

                        {/* Allergies Warning */}
                        {patient.allergies?.length > 0 && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                                <AlertCircle className="w-3 h-3" />
                                <span>{patient.allergies.length} known allergies</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
