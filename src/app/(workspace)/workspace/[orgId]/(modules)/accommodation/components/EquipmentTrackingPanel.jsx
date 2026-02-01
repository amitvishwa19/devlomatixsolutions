import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Monitor, Plus, Wrench, AlertTriangle, CheckCircle, 
  Clock, Activity, Zap, Heart, Wind, Droplet
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

const EQUIPMENT_TYPES = [
  { id: 'ventilator', name: 'Ventilator', icon: Wind },
  { id: 'patient_monitor', name: 'Patient Monitor', icon: Monitor },
  { id: 'infusion_pump', name: 'Infusion Pump', icon: Droplet },
  { id: 'defibrillator', name: 'Defibrillator', icon: Zap },
  { id: 'ecg_machine', name: 'ECG Machine', icon: Heart },
  { id: 'oxygen_concentrator', name: 'Oxygen Concentrator', icon: Wind },
  { id: 'suction_machine', name: 'Suction Machine', icon: Activity },
  { id: 'bp_monitor', name: 'BP Monitor', icon: Activity },
];

const EQUIPMENT_STATUS = [
  { id: 'in_use', name: 'In Use', color: 'bg-green-100 text-green-800' },
  { id: 'available', name: 'Available', color: 'bg-blue-100 text-blue-800' },
  { id: 'maintenance', name: 'Under Maintenance', color: 'bg-amber-100 text-amber-800' },
  { id: 'faulty', name: 'Faulty', color: 'bg-red-100 text-red-800' },
];

export function EquipmentTrackingPanel({ equipment, onAdd, onUpdate, onAssign, rooms }) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newEquipment, setNewEquipment] = React.useState({
    type: '',
    serialNumber: '',
    status: 'available',
    assignedBed: '',
    lastMaintenance: '',
    notes: '',
  });

  const equipmentStats = React.useMemo(() => {
    return {
      total: equipment.length,
      inUse: equipment.filter(e => e.status === 'in_use').length,
      available: equipment.filter(e => e.status === 'available').length,
      maintenance: equipment.filter(e => e.status === 'maintenance' || e.status === 'faulty').length,
    };
  }, [equipment]);

  const getEquipmentType = (typeId) => {
    return EQUIPMENT_TYPES.find(t => t.id === typeId) || { name: typeId, icon: Monitor };
  };

  const getStatus = (statusId) => {
    return EQUIPMENT_STATUS.find(s => s.id === statusId) || EQUIPMENT_STATUS[0];
  };

  const handleAdd = () => {
    onAdd?.({
      ...newEquipment,
      id: `eq_${Date.now()}`,
      addedAt: new Date(),
    });
    setNewEquipment({
      type: '',
      serialNumber: '',
      status: 'available',
      assignedBed: '',
      lastMaintenance: '',
      notes: '',
    });
    setAddDialogOpen(false);
  };

  // Get all beds for assignment
  const allBeds = React.useMemo(() => {
    const beds = [];
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        beds.push({ bed, room });
      });
    });
    return beds;
  }, [rooms]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Equipment Tracking
        </h3>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Equipment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{equipmentStats.total}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{equipmentStats.inUse}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">In Use</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{equipmentStats.available}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">{equipmentStats.maintenance}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Maintenance</p>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="h-[calc(100vh-450px)]">
        <div className="space-y-2 pr-4">
          {equipment.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Monitor className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No equipment tracked</p>
            </div>
          ) : (
            equipment.map(item => {
              const type = getEquipmentType(item.type);
              const status = getStatus(item.status);
              const Icon = type.icon;

              return (
                <Card key={item.id} className={`${item.status === 'faulty' ? 'border-red-200' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{type.name}</span>
                            <Badge className={`${status.color} text-[10px]`}>{status.name}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            S/N: {item.serialNumber}
                          </p>
                          {item.assignedBed && (
                            <Badge variant="outline" className="mt-1 text-[10px]">
                              Assigned: {item.assignedBed}
                            </Badge>
                          )}
                          {item.lastMaintenance && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last maintenance: {format(new Date(item.lastMaintenance), 'dd MMM yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {item.status === 'available' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onAssign?.(item)}
                          >
                            Assign
                          </Button>
                        )}
                        {item.status === 'in_use' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => onUpdate?.(item.id, { status: 'available', assignedBed: '' })}
                          >
                            Release
                          </Button>
                        )}
                        {item.status === 'faulty' && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Equipment Type</Label>
                <Select
                  value={newEquipment.type}
                  onValueChange={(v) => setNewEquipment({ ...newEquipment, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input
                  value={newEquipment.serialNumber}
                  onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                  placeholder="EQ-XXX-XXX"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newEquipment.status}
                  onValueChange={(v) => setNewEquipment({ ...newEquipment, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_STATUS.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Last Maintenance</Label>
                <Input
                  type="date"
                  value={newEquipment.lastMaintenance}
                  onChange={(e) => setNewEquipment({ ...newEquipment, lastMaintenance: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newEquipment.notes}
                onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newEquipment.type || !newEquipment.serialNumber}>
              Add Equipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
