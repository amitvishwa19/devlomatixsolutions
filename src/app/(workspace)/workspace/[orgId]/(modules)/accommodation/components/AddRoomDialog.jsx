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
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { FLOORS, WINGS, ROOM_TYPES, BED_FEATURES } from '../utils/types';

export function AddRoomDialog({ open, onOpenChange, onAdd, existingRoomNumbers }) {
  const [formData, setFormData] = React.useState({
    roomNumber: '',
    floor: 'ground',
    wing: 'east',
    type: 'general_ward',
    bedsCount: 1,
    dailyRate: 2000,
    amenities: [],
    features: [],
  });
  
  const [errors, setErrors] = React.useState({});

  const availableAmenities = [
    'AC', 'TV', 'WiFi', 'Attached Bathroom', 'Refrigerator', 
    'Microwave', 'Sofa Bed', 'Dining Table', 'Intercom', 'Nurse Call'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is edited
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
    } else if (existingRoomNumbers?.includes(formData.roomNumber.trim())) {
      newErrors.roomNumber = 'Room number already exists';
    }
    
    if (formData.bedsCount < 1 || formData.bedsCount > 10) {
      newErrors.bedsCount = 'Beds count must be between 1 and 10';
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

    // Generate room ID
    const roomId = `room_${Date.now()}`;
    
    // Generate beds
    const beds = [];
    const bedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    
    for (let i = 0; i < formData.bedsCount; i++) {
      beds.push({
        id: `bed_${Date.now()}_${i}`,
        bedNumber: `${formData.roomNumber}-${bedLetters[i]}`,
        status: 'available',
        housekeeping: 'clean',
        lastCleaned: new Date(),
        patient: null,
        admission: null,
        expectedDischarge: null,
        patientCondition: null,
        vitals: null,
        reservation: null,
      });
    }

    // Create room object
    const newRoom = {
      id: roomId,
      roomNumber: formData.roomNumber.trim(),
      floor: formData.floor,
      wing: formData.wing,
      type: formData.type,
      beds,
      dailyRate: formData.dailyRate,
      amenities: formData.amenities,
      features: formData.features,
      lastInspection: new Date(),
      createdAt: new Date(),
    };

    onAdd(newRoom);
    
    // Reset form
    setFormData({
      roomNumber: '',
      floor: 'ground',
      wing: 'east',
      type: 'general_ward',
      bedsCount: 1,
      dailyRate: 2000,
      amenities: [],
      features: [],
    });
    setErrors({});
    onOpenChange(false);
    
    toast.success(`Room ${newRoom.roomNumber} created with ${beds.length} bed(s)`);
  };

  const handleClose = () => {
    setFormData({
      roomNumber: '',
      floor: 'ground',
      wing: 'east',
      type: 'general_ward',
      bedsCount: 1,
      dailyRate: 2000,
      amenities: [],
      features: [],
    });
    setErrors({});
    onOpenChange(false);
  };

  // Auto-suggest room number based on floor and wing
  const suggestRoomNumber = () => {
    const floorPrefix = FLOORS.find(f => f.id === formData.floor)?.shortName || 'G';
    const wingPrefix = formData.wing.charAt(0).toUpperCase();
    const randomNum = Math.floor(Math.random() * 20) + 1;
    const suggested = `${floorPrefix}${wingPrefix}-${String(randomNum).padStart(2, '0')}`;
    handleChange('roomNumber', suggested);
  };

  // Auto-suggest daily rate based on room type
  React.useEffect(() => {
    const rates = {
      icu: 15000,
      private: 6000,
      semi_private: 3500,
      general_ward: 2000,
      isolation: 8000,
      emergency: 5000,
      pediatric: 4000,
      maternity: 5000,
    };
    handleChange('dailyRate', rates[formData.type] || 2000);
  }, [formData.type]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Room
          </DialogTitle>
          <DialogDescription>
            Create a new room with beds in the hospital accommodation system
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
                  <div className="flex gap-2">
                    <Input
                      id="roomNumber"
                      value={formData.roomNumber}
                      onChange={(e) => handleChange('roomNumber', e.target.value)}
                      placeholder="e.g., 1E-05"
                      className={errors.roomNumber ? 'border-destructive' : ''}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={suggestRoomNumber}>
                      Auto
                    </Button>
                  </div>
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

            {/* Capacity & Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Capacity & Pricing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedsCount">Number of Beds *</Label>
                  <Input
                    id="bedsCount"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.bedsCount}
                    onChange={(e) => handleChange('bedsCount', parseInt(e.target.value) || 1)}
                    className={errors.bedsCount ? 'border-destructive' : ''}
                  />
                  {errors.bedsCount && (
                    <p className="text-xs text-destructive">{errors.bedsCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Beds will be labeled {formData.roomNumber || 'ROOM'}-A, {formData.roomNumber || 'ROOM'}-B, etc.
                  </p>
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
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={() => toggleAmenity(amenity)}
                    />
                    <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Plus className="h-4 w-4 mr-2" />
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
