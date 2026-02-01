import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ClipboardList, Plus, User, Clock, CheckCircle, 
  AlertCircle, FileText, Stethoscope 
} from 'lucide-react';
import { format } from 'date-fns';
import { getRoomTypeById } from '../utils/utils';

export function WardRoundsPanel({ rounds, rooms, onAddRound, onCompleteRound, onUpdateNotes }) {
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [selectedRound, setSelectedRound] = React.useState(null);
  const [newRound, setNewRound] = React.useState({
    doctor: '',
    scheduledTime: '',
    patients: [],
    notes: '',
  });

  // Get all occupied beds
  const occupiedBeds = React.useMemo(() => {
    const beds = [];
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.status === 'occupied' && bed.patient) {
          beds.push({
            bed,
            room,
            roomType: getRoomTypeById(room.type),
          });
        }
      });
    });
    return beds;
  }, [rooms]);

  const todayRounds = React.useMemo(() => {
    const today = new Date().toDateString();
    return rounds.filter(r => new Date(r.scheduledTime).toDateString() === today);
  }, [rounds]);

  const handleAddRound = () => {
    onAddRound?.({
      ...newRound,
      id: `round_${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date(),
    });
    setNewRound({ doctor: '', scheduledTime: '', patients: [], notes: '' });
    setAddDialogOpen(false);
  };

  const togglePatient = (bedId) => {
    setNewRound(prev => ({
      ...prev,
      patients: prev.patients.includes(bedId)
        ? prev.patients.filter(id => id !== bedId)
        : [...prev.patients, bedId],
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Ward Rounds
        </h3>
        <Button size="sm" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Schedule Round
        </Button>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{todayRounds.filter(r => r.status === 'scheduled').length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">{todayRounds.filter(r => r.status === 'in_progress').length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{todayRounds.filter(r => r.status === 'completed').length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="h-[calc(100vh-450px)]">
        <div className="space-y-2 pr-4">
          {rounds.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No rounds scheduled</p>
            </div>
          ) : (
            rounds.map(round => (
              <Card 
                key={round.id} 
                className={`cursor-pointer transition-colors hover:border-primary/50 ${
                  round.status === 'in_progress' ? 'border-amber-300 bg-amber-50/30' : ''
                }`}
                onClick={() => setSelectedRound(round)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{round.doctor}</span>
                        <Badge 
                          variant={round.status === 'completed' ? 'default' : 'outline'}
                          className={`text-[10px] ${
                            round.status === 'in_progress' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            round.status === 'completed' ? 'bg-green-100 text-green-800' : ''
                          }`}
                        >
                          {round.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(round.scheduledTime), 'HH:mm')} • {round.patients.length} patients
                      </p>
                    </div>
                    {round.status === 'scheduled' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteRound?.(round.id, 'in_progress');
                        }}
                      >
                        Start Round
                      </Button>
                    )}
                    {round.status === 'in_progress' && (
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteRound?.(round.id, 'completed');
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Add Round Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Ward Round</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Doctor</Label>
                <Input
                  value={newRound.doctor}
                  onChange={(e) => setNewRound({ ...newRound, doctor: e.target.value })}
                  placeholder="Dr. Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Scheduled Time</Label>
                <Input
                  type="datetime-local"
                  value={newRound.scheduledTime}
                  onChange={(e) => setNewRound({ ...newRound, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Select Patients ({newRound.patients.length} selected)</Label>
              <ScrollArea className="h-40 border rounded-lg p-2">
                <div className="space-y-2">
                  {occupiedBeds.map(({ bed, room, roomType }) => (
                    <div
                      key={bed.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        newRound.patients.includes(bed.id) ? 'bg-primary/10' : 'hover:bg-muted'
                      }`}
                      onClick={() => togglePatient(bed.id)}
                    >
                      <Checkbox checked={newRound.patients.includes(bed.id)} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{bed.patient.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={`${roomType.color} text-[10px]`}>{bed.bedNumber}</Badge>
                          <span className="text-xs text-muted-foreground">{bed.patient.condition}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newRound.notes}
                onChange={(e) => setNewRound({ ...newRound, notes: e.target.value })}
                placeholder="Round notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRound} disabled={!newRound.doctor || !newRound.scheduledTime}>
              Schedule Round
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
