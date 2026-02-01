import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, User, AlertTriangle, Plus, ArrowUp, ArrowDown, 
  Phone, Calendar, Bed, CheckCircle, X, MoreHorizontal 
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ROOM_TYPES } from '../utils/types';
import { getRoomTypeById } from '../utils/utils';

export function WaitingListPanel({ waitlist, onAdd, onAssign, onRemove, onUpdatePriority, availableBeds }) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newEntry, setNewEntry] = React.useState({
    patientName: '',
    patientPhone: '',
    preferredRoomType: '',
    reason: '',
    priority: 'normal',
    notes: '',
  });

  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
  
  const sortedWaitlist = React.useMemo(() => {
    return [...waitlist].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.addedAt) - new Date(b.addedAt);
    });
  }, [waitlist]);

  const getMatchingBeds = (roomType) => {
    return availableBeds.filter(({ room }) => 
      roomType === 'any' || room.type === roomType
    ).length;
  };

  const handleAdd = () => {
    onAdd?.({
      ...newEntry,
      id: `wl_${Date.now()}`,
      addedAt: new Date(),
      status: 'waiting',
    });
    setNewEntry({
      patientName: '',
      patientPhone: '',
      preferredRoomType: '',
      reason: '',
      priority: 'normal',
      notes: '',
    });
    setAddDialogOpen(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Waiting List
        </h3>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add to Waitlist
        </Button>
      </div>

      {/* Priority Legend */}
      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg text-xs">
        <span className="text-muted-foreground">Priority:</span>
        {['critical', 'high', 'normal', 'low'].map(p => (
          <Badge key={p} className={`${getPriorityColor(p)} capitalize text-[10px]`}>{p}</Badge>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-2 pr-4">
          {sortedWaitlist.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No patients in waitlist</p>
            </div>
          ) : (
            sortedWaitlist.map((entry, index) => {
              const roomType = getRoomTypeById(entry.preferredRoomType);
              const matchingBeds = getMatchingBeds(entry.preferredRoomType);

              return (
                <Card key={entry.id} className={`border ${entry.priority === 'critical' ? 'border-red-300 bg-red-50/30' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => onUpdatePriority?.(entry.id, 'up')}
                              disabled={index === 0}
                              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onUpdatePriority?.(entry.id, 'down')}
                              disabled={index === sortedWaitlist.length - 1}
                              className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.patientName}</span>
                            <Badge className={`${getPriorityColor(entry.priority)} text-[10px]`}>
                              {entry.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {entry.patientPhone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(entry.addedAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={roomType.color}>
                              <Bed className="h-3 w-3 mr-1" />
                              {roomType.name}
                            </Badge>
                            {matchingBeds > 0 ? (
                              <Badge className="bg-green-100 text-green-800 text-[10px]">
                                {matchingBeds} available
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px]">
                                No beds available
                              </Badge>
                            )}
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-muted-foreground mt-1">{entry.reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {matchingBeds > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => onAssign?.(entry)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Assign Bed
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onRemove?.(entry.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Remove from List
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            <DialogTitle>Add to Waiting List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <Input
                  value={newEntry.patientName}
                  onChange={(e) => setNewEntry({ ...newEntry, patientName: e.target.value })}
                  placeholder="Enter patient name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={newEntry.patientPhone}
                  onChange={(e) => setNewEntry({ ...newEntry, patientPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Room Type</Label>
                <Select
                  value={newEntry.preferredRoomType}
                  onValueChange={(v) => setNewEntry({ ...newEntry, preferredRoomType: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Available</SelectItem>
                    {ROOM_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newEntry.priority}
                  onValueChange={(v) => setNewEntry({ ...newEntry, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason for Admission</Label>
              <Input
                value={newEntry.reason}
                onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
                placeholder="Brief reason..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!newEntry.patientName || !newEntry.preferredRoomType}>
              Add to Waitlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
