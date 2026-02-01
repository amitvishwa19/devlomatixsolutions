import * as React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User, Phone, Calendar, Clock, Bed, Activity, FileText,
    ArrowRightLeft, DoorOpen, Sparkles, Wrench, AlertCircle,
    CheckCircle, IndianRupee, Stethoscope
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { getRoomTypeById, getBedStatusById, getFeatureById, getLengthOfStay, formatCurrency, calculateEstimatedBill } from '../utils/utils';


export function BedDetailSheet({ open, onOpenChange, bed, room, onDischarge, onTransfer, onClean, onMaintenance }) {
    if (!bed || !room) return null;

    const roomType = getRoomTypeById(room.type);
    const bedStatus = getBedStatusById(bed.status);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl bg-transparent border-0 p-0">
                <div className="h-full bg-card rounded-l-xl border-l border-y flex flex-col">
                    <SheetHeader className="p-6 border-b">
                        <div className="flex items-start justify-between">
                            <div>
                                <SheetTitle className="text-xl flex items-center gap-2">
                                    <Bed className="h-5 w-5" />
                                    {bed.bedNumber}
                                </SheetTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge className={roomType.color}>{roomType.name}</Badge>
                                    <Badge className={`${bedStatus.bgLight} ${bedStatus.textColor}`}>
                                        {bedStatus.name}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                                <p>{room.roomNumber}</p>
                                <p className="text-xs">{formatCurrency(room.dailyRate)}/day</p>
                            </div>
                        </div>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
                            {/* Patient Info - if occupied */}
                            {bed.patient && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Patient Information
                                            </CardTitle>

                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-lg">{bed.patient.name}</p>
                                                <p className="text-sm text-muted-foreground">{bed.patient.mrn}</p>
                                            </div>
                                            <Badge variant="outline">{bed.patient.gender === 'M' ? 'Male' : 'Female'}, {bed.patient.age}y</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <span>{bed.patient.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                                <span>{bed.patient.condition}</span>
                                            </div>
                                        </div>

                                        {bed.admission && (
                                            <>
                                                <Separator />
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Admitted</p>
                                                        <p className="font-medium">{format(new Date(bed.admission.admittedAt), 'dd MMM yyyy, HH:mm')}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {getLengthOfStay(bed.admission.admittedAt)} days ago
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Attending Doctor</p>
                                                        <p className="font-medium">{bed.admission.admittedBy}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Admission Type</p>
                                                        <Badge variant="outline" className="capitalize">{bed.admission.type}</Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground text-xs">Expected Discharge</p>
                                                        <p className="font-medium">
                                                            {bed.expectedDischarge
                                                                ? format(new Date(bed.expectedDischarge), 'dd MMM yyyy')
                                                                : 'Not scheduled'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">Estimated Bill (Room only)</span>
                                                    </div>
                                                    <span className="font-semibold">{formatCurrency(calculateEstimatedBill(room, bed))}</span>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Reservation Info */}
                            {bed.reservation && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            Reservation Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Patient Name</span>
                                            <span className="font-medium">{bed.reservation.patientName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Expected Arrival</span>
                                            <span className="font-medium">
                                                {format(new Date(bed.reservation.expectedArrival), 'dd MMM, HH:mm')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Reason</span>
                                            <span className="font-medium">{bed.reservation.reason}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Bed Features */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Bed Features & Amenities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {bed.features.map(featureId => {
                                            const feature = getFeatureById(featureId);
                                            return (
                                                <Badge key={featureId} variant="secondary" className="text-xs">
                                                    {feature.name}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                    {room.amenities.length > 0 && (
                                        <div className="mt-3 pt-3 border-t">
                                            <p className="text-xs text-muted-foreground mb-2">Room Amenities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {room.amenities.map((amenity, idx) => (
                                                    <Badge key={idx} variant="outline" className="text-xs">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Housekeeping Status */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        Housekeeping
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge
                                            variant={bed.housekeeping === 'clean' ? 'default' : 'destructive'}
                                            className={bed.housekeeping === 'clean' ? 'bg-green-100 text-green-800' : ''}
                                        >
                                            {bed.housekeeping.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Last Cleaned</span>
                                        <span className="font-medium">
                                            {bed.lastCleaned
                                                ? formatDistanceToNow(new Date(bed.lastCleaned), { addSuffix: true })
                                                : 'Unknown'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </ScrollArea>

                    {/* Action Buttons */}
                    <div className="p-4 border-t bg-muted/30">
                        <div className="grid grid-cols-2 gap-2">
                            {bed.status === 'available' && (
                                <>
                                    <Button variant="outline" onClick={() => onClean?.(bed)}>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Mark for Cleaning
                                    </Button>
                                    <Button variant="outline" onClick={() => onMaintenance?.(bed)}>
                                        <Wrench className="h-4 w-4 mr-2" />
                                        Set Maintenance
                                    </Button>
                                </>
                            )}
                            {(bed.status === 'occupied' || bed.status === 'discharge_pending') && (
                                <>
                                    <Button variant="outline" onClick={() => onTransfer?.(bed)}>
                                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                                        Transfer Patient
                                    </Button>
                                    <Button
                                        variant={bed.status === 'discharge_pending' ? 'default' : 'outline'}
                                        onClick={() => onDischarge?.(bed)}
                                    >
                                        <DoorOpen className="h-4 w-4 mr-2" />
                                        {bed.status === 'discharge_pending' ? 'Complete Discharge' : 'Initiate Discharge'}
                                    </Button>
                                </>
                            )}
                            {bed.status === 'cleaning' && (
                                <Button className="col-span-2" onClick={() => onClean?.(bed)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Clean
                                </Button>
                            )}
                            {bed.status === 'maintenance' && (
                                <Button className="col-span-2" onClick={() => onMaintenance?.(bed)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete Maintenance
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
