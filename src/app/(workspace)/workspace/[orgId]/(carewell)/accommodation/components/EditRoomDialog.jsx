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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { FLOORS, WINGS, ROOM_TYPES, BED_FEATURES } from '../utils/types';

export function EditRoomDialog({ open, onOpenChange, room, onSave, existingRoomNumbers }) {
  const [formData, setFormData] = React.useState({
    roomNumber: '',
    floor: 'ground',
    wing: 'east',
    type: 'general_ward',
    dailyRate: 2000,
    amenities: [],
    features: [],
  });

  const [errors, setErrors] = React.useState({});

  const availableAmenities = [
    'AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator',
    'Microwave', 'Sofa Bed', 'Dining Table', 'Intercom', 'Nurse Call'
  ];

  // Initialize form when room changes
  React.useEffect(() => {
    if (room) {
      setFormData({
        roomNumber: room.roomNumber || '',
        floor: room.floor || 'ground',
        wing: room.wing || 'east',
        type: room.type || 'general_ward',
        dailyRate: room.dailyRate || 2000,
        amenities: room.amenities || [],
        features: room.features || [],
      });
    }
  }, [room]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleFeature = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = 'Room number is required';
    } else if (
      formData.roomNumber.trim() !== room?.roomNumber &&
      existingRoomNumbers?.includes(formData.roomNumber.trim())
    ) {
      newErrors.roomNumber = 'Room number already exists';
    }

    if (formData.dailyRate < 0) {
      newErrors.dailyRate = 'Daily rate cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    const updatedRoom = {
      ...room,
      roomNumber: formData.roomNumber.trim(),
      floor: formData.floor,
      wing: formData.wing,
      type: formData.type,
      dailyRate: formData.dailyRate,
      amenities: formData.amenities,
      features: formData.features,
      updatedAt: new Date(),
    };

    // Update bed numbers if room number changed
    if (formData.roomNumber.trim() !== room.roomNumber) {
      updatedRoom.beds = room.beds.map(bed => ({
        ...bed,
        bedNumber: bed.bedNumber.replace(room.roomNumber, formData.roomNumber.trim()),
      }));
    }

    onSave(updatedRoom);
    onOpenChange(false);
    toast.success(`Room ${updatedRoom.roomNumber} updated successfully`);
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Room {room.roomNumber}
          </DialogTitle>
          <DialogDescription>
            Update room details. Bed configuration cannot be changed here.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={formData.roomNumber}
                    onChange={(e) => handleChange('roomNumber', e.target.value)}
                    placeholder="e.g., 1E-05"
                    className={errors.roomNumber ? 'border-destructive' : ''}
                  />
                  {errors.roomNumber && (
                    <p className="text-xs text-destructive">{errors.roomNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Room Type *</Label>
                  <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor *</Label>
                  <Select value={formData.floor} onValueChange={(v) => handleChange('floor', v)}>
                    <SelectTrigger id="floor">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOORS.map(floor => (
                        <SelectItem key={floor.id} value={floor.id}>
                          {floor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wing">Wing *</Label>
                  <Select value={formData.wing} onValueChange={(v) => handleChange('wing', v)}>
                    <SelectTrigger id="wing">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WINGS.map(wing => (
                        <SelectItem key={wing.id} value={wing.id}>
                          {wing.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Pricing</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Beds</Label>
                  <div className="flex gap-1 flex-wrap">
                    {room.beds.map(bed => (
                      <Badge key={bed.id} variant="outline" className="text-xs">
                        {bed.bedNumber} ({bed.status})
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
                  <Input
                    id="dailyRate"
                    type="number"
                    min={0}
                    value={formData.dailyRate}
                    onChange={(e) => handleChange('dailyRate', parseInt(e.target.value) || 0)}
                    className={errors.dailyRate ? 'border-destructive' : ''}
                  />
                  {errors.dailyRate && (
                    <p className="text-xs text-destructive">{errors.dailyRate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Room Features</h3>
              <div className="flex flex-wrap gap-2">
                {BED_FEATURES.map(feature => (
                  <Badge
                    key={feature.id}
                    variant={formData.features.includes(feature.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleFeature(feature.id)}
                  >
                    {formData.features.includes(feature.id) && <X className="h-3 w-3 mr-1" />}
                    {feature.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableAmenities.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-${amenity}`}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={`edit-${amenity}`} className="text-sm font-normal cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Pencil className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
