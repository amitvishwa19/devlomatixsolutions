import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Bed, Plus, Trash2, AlertTriangle, User, Settings, 
  CheckCircle, XCircle, Wrench, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { BED_STATUSES, BED_FEATURES } from '../utils/types';
import { getBedStatusById } from '../utils/utils';

export function BedManagementDialog({ open, onOpenChange, room, onSave }) {
  const [beds, setBeds] = React.useState([]);
  const [newBedLabel, setNewBedLabel] = React.useState('');
  const [hasChanges, setHasChanges] = React.useState(false);

  // Initialize beds when room changes
  React.useEffect(() => {
    if (room) {
      setBeds(room.beds.map(bed => ({ ...bed })));
      setHasChanges(false);
    }
  }, [room]);

  // Generate next bed label
  const getNextBedLabel = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const usedLetters = beds.map(b => {
      const parts = b.bedNumber.split('-');
      return parts[parts.length - 1];
    });
    
    for (const letter of letters) {
      if (!usedLetters.includes(letter)) {
        return letter;
      }
    }
    return `${beds.length + 1}`;
  };

  const handleAddBed = () => {
    const label = newBedLabel.trim() || getNextBedLabel();
    const bedNumber = `${room.roomNumber}-${label}`;
    
    // Check for duplicate
    if (beds.some(b => b.bedNumber === bedNumber)) {
      toast.error('A bed with this label already exists');
      return;
    }

    const newBed = {
      id: `bed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bedNumber,
      status: 'available',
      housekeeping: 'clean',
      lastCleaned: new Date(),
      patient: null,
      admission: null,
      expectedDischarge: null,
      patientCondition: null,
      vitals: null,
      reservation: null,
      features: [],
    };

    setBeds(prev => [...prev, newBed]);
    setNewBedLabel('');
    setHasChanges(true);
    toast.success(`Bed ${bedNumber} added`);
  };

  const handleRemoveBed = (bedId) => {
    const bed = beds.find(b => b.id === bedId);
    
    if (bed?.status === 'occupied' || bed?.status === 'reserved') {
      toast.error('Cannot remove an occupied or reserved bed');
      return;
    }

    setBeds(prev => prev.filter(b => b.id !== bedId));
    setHasChanges(true);
    toast.success(`Bed ${bed?.bedNumber} removed`);
  };

  const handleUpdateBedStatus = (bedId, newStatus) => {
    const bed = beds.find(b => b.id === bedId);
    
    // Prevent changing occupied beds
    if (bed?.status === 'occupied' && newStatus !== 'occupied') {
      toast.error('Cannot change status of an occupied bed. Discharge patient first.');
      return;
    }

    setBeds(prev => prev.map(b => 
      b.id === bedId 
        ? { 
            ...b, 
            status: newStatus,
            housekeeping: newStatus === 'cleaning' ? 'in_progress' : 
                         newStatus === 'available' ? 'clean' : b.housekeeping
          } 
        : b
    ));
    setHasChanges(true);
  };

  const handleToggleFeature = (bedId, featureId) => {
    setBeds(prev => prev.map(b => {
      if (b.id === bedId) {
        const features = b.features || [];
        return {
          ...b,
          features: features.includes(featureId)
            ? features.filter(f => f !== featureId)
            : [...features, featureId]
        };
      }
      return b;
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (beds.length === 0) {
      toast.error('Room must have at least one bed');
      return;
    }

    const updatedRoom = {
      ...room,
      beds,
      updatedAt: new Date(),
    };

    onSave(updatedRoom);
    onOpenChange(false);
    toast.success(`Room ${room.roomNumber} updated with ${beds.length} bed(s)`);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Discard them?')) {
        setBeds(room?.beds?.map(bed => ({ ...bed })) || []);
        setHasChanges(false);
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  if (!room) return null;

  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const availableBeds = beds.filter(b => b.status === 'available').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Beds - Room {room.roomNumber}
          </DialogTitle>
          <DialogDescription>
            Add, remove, or configure beds in this room. Changes take effect after saving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{beds.length} Total Beds</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {availableBeds} Available
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {occupiedBeds} Occupied
            </Badge>
            {hasChanges && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline" className="border-amber-500 text-amber-600">
                  Unsaved Changes
                </Badge>
              </>
            )}
          </div>

          {/* Add New Bed */}
          <div className="flex items-end gap-3 p-3 border rounded-lg bg-card">
            <div className="flex-1 space-y-2">
              <Label htmlFor="bedLabel">Add New Bed</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{room.roomNumber}-</span>
                  <Input
                    id="bedLabel"
                    value={newBedLabel}
                    onChange={(e) => setNewBedLabel(e.target.value.toUpperCase())}
                    placeholder={getNextBedLabel()}
                    className="w-20"
                    maxLength={2}
                  />
                </div>
                <Button onClick={handleAddBed}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bed
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty for auto-labeling ({room.roomNumber}-{getNextBedLabel()})
              </p>
            </div>
          </div>

          {/* Beds List */}
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-3">
              {beds.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bed className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No beds configured</p>
                  <p className="text-xs">Add at least one bed to this room</p>
                </div>
              ) : (
                beds.map((bed) => {
                  const status = getBedStatusById(bed.status);
                  const isOccupied = bed.status === 'occupied' || bed.status === 'reserved';
                  
                  return (
                    <div 
                      key={bed.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        isOccupied ? 'bg-muted/30' : 'bg-card hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color} text-white`}>
                            {bed.status === 'occupied' ? (
                              <User className="h-5 w-5" />
                            ) : bed.status === 'maintenance' ? (
                              <Wrench className="h-5 w-5" />
                            ) : bed.status === 'cleaning' ? (
                              <Sparkles className="h-5 w-5" />
                            ) : (
                              <Bed className="h-5 w-5" />
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{bed.bedNumber}</h4>
                              <Badge className={`${status.bgLight} text-xs`}>
                                {status.name}
                              </Badge>
                            </div>
                            
                            {bed.patient && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <User className="h-3 w-3 inline mr-1" />
                                {bed.patient.name} ({bed.patient.mrn})
                              </p>
                            )}
                            
                            {/* Features */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {BED_FEATURES.slice(0, 6).map(feature => (
                                <Badge
                                  key={feature.id}
                                  variant={(bed.features || []).includes(feature.id) ? 'default' : 'outline'}
                                  className="text-[10px] cursor-pointer"
                                  onClick={() => handleToggleFeature(bed.id, feature.id)}
                                >
                                  {feature.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Status Selector */}
                          <Select 
                            value={bed.status} 
                            onValueChange={(v) => handleUpdateBedStatus(bed.id, v)}
                            disabled={bed.status === 'occupied'}
                          >
                            <SelectTrigger className="w-[140px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {BED_STATUSES.filter(s => 
                                s.id !== 'occupied' && s.id !== 'discharge_pending'
                              ).map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {/* Delete Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveBed(bed.id)}
                            disabled={isOccupied}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {isOccupied && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                          <AlertTriangle className="h-3 w-3" />
                          {bed.status === 'occupied' 
                            ? 'Discharge patient before modifying this bed'
                            : 'Cancel reservation before modifying this bed'
                          }
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
