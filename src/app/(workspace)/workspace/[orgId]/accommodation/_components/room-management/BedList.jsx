import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Bed as BedIcon,
    User,
    Calendar,
    Edit,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusLabels = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    maintenance: 'Maintenance',
};

const statusVariants = {
    available: 'available',
    occupied: 'occupied',
    reserved: 'reserved',
    maintenance: 'maintenance',
};

export function BedList({ beds, onEditBed, onChangeBedStatus }) {
    if (beds.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <BedIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No beds in this room yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {beds.map((bed, index) => (
                <div
                    key={bed.id}
                    className="bed-item animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-background">
                            <BedIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Bed {bed.bedNumber}</span>
                                <Badge variant={statusVariants[bed.status]}>
                                    {statusLabels[bed.status]}
                                </Badge>
                            </div>

                            {bed.patient && (
                                <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        {bed.patient.name}
                                    </span>
                                    {bed.admissionDate && (
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Admitted: {new Date(bed.admissionDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            )}

                            {bed.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Note: {bed.notes}
                                </p>
                            )}
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditBed(bed)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Bed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onChangeBedStatus(bed, 'available')}
                                disabled={bed.status === 'available'}
                            >
                                Mark Available
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onChangeBedStatus(bed, 'occupied')}
                                disabled={bed.status === 'occupied'}
                            >
                                Mark Occupied
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onChangeBedStatus(bed, 'maintenance')}
                                disabled={bed.status === 'maintenance'}
                            >
                                Mark Maintenance
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ))}
        </div>
    );
}
