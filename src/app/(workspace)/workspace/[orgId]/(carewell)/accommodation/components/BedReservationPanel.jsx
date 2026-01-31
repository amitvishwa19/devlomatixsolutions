import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, Plus, Clock, User, Bed, CheckCircle, 
  X, Phone, AlertCircle, CalendarCheck, Edit, Trash2
} from 'lucide-react';
import { format, formatDistanceToNow, addDays, isBefore, isAfter, isSameDay } from 'date-fns';
import { ROOM_TYPES, ADMISSION_TYPES } from '../types';
import { getRoomTypeById, formatCurrency } from '../utils';

export function BedReservationPanel({ 
  reservations, 
  rooms, 
  onAdd, 
  onCancel, 
  onConfirm, 
  onEdit,
  onConvertToAdmission 
}) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('upcoming');
  const [newReservation, setNewReservation] = React.useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    preferredRoomType: '',
    specificBedId: '',
    expectedArrival: null,
    expectedDuration: 3,
    admissionType: 'elective',
    diagnosis: '',
    doctor: '',
    notes: '',
    depositAmount: 0,
    depositPaid: false,
  });

  // Get available beds for selected room type
  const availableBeds = React.useMemo(() => {
    const beds = [];
    rooms.forEach(room => {
      if (newReservation.preferredRoomType && room.type !== newReservation.preferredRoomType) return;
      room.beds.forEach(bed => {
        if (bed.status === 'available' || bed.status === 'reserved') {
          // Check if bed is not already reserved for the selected date
          const conflicting = reservations.some(r => 
            r.specificBedId === bed.id && 
            r.status === 'confirmed' &&
            newReservation.expectedArrival &&
            isSameDay(new Date(r.expectedArrival), new Date(newReservation.expectedArrival))
          );
          if (!conflicting || bed.status === 'available') {
            beds.push({ bed, room, roomType: getRoomTypeById(room.type) });
          }
        }
      });
    });
    return beds;
  }, [rooms, reservations, newReservation.preferredRoomType, newReservation.expectedArrival]);

  // Categorize reservations
  const categorized = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      today: reservations.filter(r => 
        r.status !== 'cancelled' && 
        r.status !== 'completed' &&
        isSameDay(new Date(r.expectedArrival), today)
      ),
      upcoming: reservations.filter(r => 
        r.status !== 'cancelled' && 
        r.status !== 'completed' &&
        isAfter(new Date(r.expectedArrival), today) &&
        !isSameDay(new Date(r.expectedArrival), today)
      ),
      past: reservations.filter(r => 
        r.status === 'completed' || 
        r.status === 'cancelled' ||
        (r.status !== 'admitted' && isBefore(new Date(r.expectedArrival), today))
      ),
    };
  }, [reservations]);

  const handleAdd = () => {
    const selectedBed = availableBeds.find(b => b.bed.id === newReservation.specificBedId);
    onAdd?.({
      ...newReservation,
      id: `res_${Date.now()}`,
      status: 'confirmed',
      createdAt: new Date(),
      bedNumber: selectedBed?.bed.bedNumber,
      roomNumber: selectedBed?.room.roomNumber,
      roomType: selectedBed?.room.type,
      dailyRate: selectedBed?.room.dailyRate || 0,
    });
    resetForm();
    setAddDialogOpen(false);
  };

  const resetForm = () => {
    setNewReservation({
      patientName: '',
      patientPhone: '',
      patientEmail: '',
      preferredRoomType: '',
      specificBedId: '',
      expectedArrival: null,
      expectedDuration: 3,
      admissionType: 'elective',
      diagnosis: '',
      doctor: '',
      notes: '',
      depositAmount: 0,
      depositPaid: false,
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'admitted':
        return <Badge className="bg-green-100 text-green-800">Admitted</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'no_show':
        return <Badge className="bg-gray-100 text-gray-800">No Show</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderReservationCard = (reservation) => {
    const roomType = getRoomTypeById(reservation.roomType);
    const isToday = isSameDay(new Date(reservation.expectedArrival), new Date());
    const isPast = isBefore(new Date(reservation.expectedArrival), new Date()) && !isToday;

    return (
      <Card 
        key={reservation.id} 
        className={`${isToday ? 'border-primary bg-primary/5' : ''} ${isPast && reservation.status === 'confirmed' ? 'border-amber-300 bg-amber-50/50' : ''}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{reservation.patientName}</span>
                {getStatusBadge(reservation.status)}
                {isToday && reservation.status === 'confirmed' && (
                  <Badge variant="outline" className="text-primary border-primary">Today</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{reservation.patientPhone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{format(new Date(reservation.expectedArrival), 'dd MMM yyyy, HH:mm')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bed className="h-3.5 w-3.5 text-muted-foreground" />
                  <Badge className={`${roomType.color} text-xs`}>{reservation.bedNumber}</Badge>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{reservation.expectedDuration} days expected</span>
                </div>
              </div>

              {reservation.diagnosis && (
                <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                  {reservation.diagnosis}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                <span>Dr. {reservation.doctor}</span>
                <span>•</span>
                <span className="capitalize">{reservation.admissionType}</span>
                {reservation.depositAmount > 0 && (
                  <>
                    <span>•</span>
                    <span className={reservation.depositPaid ? 'text-green-600' : 'text-amber-600'}>
                      Deposit: {formatCurrency(reservation.depositAmount)} 
                      {reservation.depositPaid ? ' (Paid)' : ' (Pending)'}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {reservation.status === 'confirmed' && (
                <>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={() => onConvertToAdmission?.(reservation)}
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    Admit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={() => onCancel?.(reservation.id)}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                </>
              )}
              {reservation.status === 'pending' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8"
                  onClick={() => onConfirm?.(reservation.id)}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Confirm
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <CalendarCheck className="h-5 w-5" />
          Bed Reservations
        </h3>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New Reservation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{categorized.today.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Today's Arrivals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{categorized.upcoming.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                {reservations.filter(r => r.status === 'admitted').length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Converted</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">
                {reservations.filter(r => r.depositPaid === false && r.status === 'confirmed').length}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Pending Deposit</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">
            Today ({categorized.today.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({categorized.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({categorized.past.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-4">
          <ScrollArea className="h-[calc(100vh-500px)]">
            <div className="space-y-3 pr-4">
              {categorized.today.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No arrivals scheduled for today</p>
                </div>
              ) : (
                categorized.today.map(renderReservationCard)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <ScrollArea className="h-[calc(100vh-500px)]">
            <div className="space-y-3 pr-4">
              {categorized.upcoming.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No upcoming reservations</p>
                </div>
              ) : (
                categorized.upcoming
                  .sort((a, b) => new Date(a.expectedArrival) - new Date(b.expectedArrival))
                  .map(renderReservationCard)
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <ScrollArea className="h-[calc(100vh-500px)]">
            <div className="space-y-3 pr-4">
              {categorized.past.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <CalendarCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No past reservations</p>
                </div>
              ) : (
                categorized.past.slice(0, 20).map(renderReservationCard)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Add Reservation Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              New Bed Reservation
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[65vh]">
            <div className="space-y-4 py-4 pr-4">
              {/* Patient Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Patient Name *</Label>
                    <Input
                      value={newReservation.patientName}
                      onChange={(e) => setNewReservation({ ...newReservation, patientName: e.target.value })}
                      placeholder="Full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number *</Label>
                    <Input
                      value={newReservation.patientPhone}
                      onChange={(e) => setNewReservation({ ...newReservation, patientPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Email (Optional)</Label>
                    <Input
                      type="email"
                      value={newReservation.patientEmail}
                      onChange={(e) => setNewReservation({ ...newReservation, patientEmail: e.target.value })}
                      placeholder="patient@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Room & Bed Selection */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Room & Bed Selection</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room Type *</Label>
                    <Select
                      value={newReservation.preferredRoomType}
                      onValueChange={(v) => setNewReservation({ ...newReservation, preferredRoomType: v, specificBedId: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Specific Bed *</Label>
                    <Select
                      value={newReservation.specificBedId}
                      onValueChange={(v) => setNewReservation({ ...newReservation, specificBedId: v })}
                      disabled={!newReservation.preferredRoomType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bed" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBeds.map(({ bed, room, roomType }) => (
                          <SelectItem key={bed.id} value={bed.id}>
                            {bed.bedNumber} - {formatCurrency(room.dailyRate)}/day
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Schedule</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expected Arrival *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {newReservation.expectedArrival 
                            ? format(newReservation.expectedArrival, 'PPP') 
                            : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newReservation.expectedArrival}
                          onSelect={(date) => setNewReservation({ ...newReservation, expectedArrival: date })}
                          disabled={(date) => isBefore(date, new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Duration (days)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newReservation.expectedDuration}
                      onChange={(e) => setNewReservation({ ...newReservation, expectedDuration: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Medical Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Admission Type</Label>
                    <Select
                      value={newReservation.admissionType}
                      onValueChange={(v) => setNewReservation({ ...newReservation, admissionType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ADMISSION_TYPES.map(type => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Attending Doctor</Label>
                    <Input
                      value={newReservation.doctor}
                      onChange={(e) => setNewReservation({ ...newReservation, doctor: e.target.value })}
                      placeholder="Dr. Name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Diagnosis / Reason for Admission</Label>
                  <Textarea
                    value={newReservation.diagnosis}
                    onChange={(e) => setNewReservation({ ...newReservation, diagnosis: e.target.value })}
                    placeholder="Brief description..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Deposit */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Deposit (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Deposit Amount</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newReservation.depositAmount}
                      onChange={(e) => setNewReservation({ ...newReservation, depositAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Status</Label>
                    <Select
                      value={newReservation.depositPaid ? 'paid' : 'pending'}
                      onValueChange={(v) => setNewReservation({ ...newReservation, depositPaid: v === 'paid' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={newReservation.notes}
                  onChange={(e) => setNewReservation({ ...newReservation, notes: e.target.value })}
                  placeholder="Special requirements, allergies, etc..."
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAdd} 
              disabled={!newReservation.patientName || !newReservation.patientPhone || !newReservation.specificBedId || !newReservation.expectedArrival}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Create Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
