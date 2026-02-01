import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, ArrowRightLeft, Search, Bed, AlertCircle } from 'lucide-react';
import { FLOORS, WINGS, ROOM_TYPES } from '../utils/types';
import { getRoomTypeById, getBedStatusById, formatCurrency } from '../utils/utils';

export function TransferPatientDialog({ open, onOpenChange, bed, room, allRooms, onTransfer }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterFloor, setFilterFloor] = React.useState('all');
  const [filterWing, setFilterWing] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');
  const [selectedBed, setSelectedBed] = React.useState(null);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [reason, setReason] = React.useState('');

  const availableBeds = React.useMemo(() => {
    const beds = [];
    allRooms.forEach(r => {
      if (r.id === room?.id) return; // Exclude current room
      
      r.beds.forEach(b => {
        if (b.status === 'available') {
          // Apply filters
          if (filterFloor !== 'all' && r.floor !== filterFloor) return;
          if (filterWing !== 'all' && r.wing !== filterWing) return;
          if (filterType !== 'all' && r.type !== filterType) return;
          
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!b.bedNumber.toLowerCase().includes(query) &&
                !r.roomNumber.toLowerCase().includes(query)) return;
          }
          
          beds.push({ bed: b, room: r });
        }
      });
    });
    return beds;
  }, [allRooms, room, filterFloor, filterWing, filterType, searchQuery]);

  const handleSubmit = () => {
    if (!selectedBed || !selectedRoom) return;

    onTransfer?.({
      fromBed: bed,
      fromRoom: room,
      toBed: selectedBed,
      toRoom: selectedRoom,
      reason,
      transferredAt: new Date(),
    });

    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSearchQuery('');
    setFilterFloor('all');
    setFilterWing('all');
    setFilterType('all');
    setSelectedBed(null);
    setSelectedRoom(null);
    setReason('');
  };

  if (!bed || !room) return null;

  const roomType = getRoomTypeById(room.type);

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Patient
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Bed Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Current Location</p>
            <div className="flex items-center gap-2">
              <Badge className={roomType.color}>{bed.bedNumber}</Badge>
              <span className="text-sm font-medium">{bed.patient?.name}</span>
              <span className="text-xs text-muted-foreground">({bed.patient?.mrn})</span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Floor</Label>
              <Select value={filterFloor} onValueChange={setFilterFloor}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  {FLOORS.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Wing</Label>
              <Select value={filterWing} onValueChange={setFilterWing}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wings</SelectItem>
                  {WINGS.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Room Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ROOM_TYPES.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Room/Bed..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-9"
                />
              </div>
            </div>
          </div>

          {/* Available Beds */}
          <div className="space-y-2">
            <Label>Select Destination Bed ({availableBeds.length} available)</Label>
            <ScrollArea className="h-48 border rounded-lg">
              {availableBeds.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No available beds match your criteria</p>
                </div>
              ) : (
                <div className="divide-y">
                  {availableBeds.map(({ bed: b, room: r }) => {
                    const rType = getRoomTypeById(r.type);
                    const isSelected = selectedBed?.id === b.id;
                    return (
                      <div
                        key={b.id}
                        className={`p-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          setSelectedBed(b);
                          setSelectedRoom(r);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-green-500 flex items-center justify-center text-white">
                              <Bed className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{b.bedNumber}</p>
                              <p className="text-xs text-muted-foreground">{rType.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(r.dailyRate)}/day</p>
                            <p className="text-xs text-muted-foreground">
                              {FLOORS.find(f => f.id === r.floor)?.name}, {WINGS.find(w => w.id === r.wing)?.name}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Selected Destination */}
          {selectedBed && selectedRoom && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Badge className={roomType.color}>{bed.bedNumber}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">From</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
                <div className="text-center">
                  <Badge className={getRoomTypeById(selectedRoom.type).color}>
                    {selectedBed.bedNumber}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">To</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason for Transfer</Label>
            <Textarea
              placeholder="Enter reason for transfer..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedBed || !reason.trim()}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transfer Patient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
