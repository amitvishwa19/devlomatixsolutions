import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, Plus, Clock, CheckCircle, AlertCircle, 
  User, Bed, ArrowRight, Send
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { getRoomTypeById } from '../utils/utils';

export function ShiftHandoverPanel({ handovers, rooms, currentShift, onCreateHandover, onAcknowledge }) {
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedBeds, setSelectedBeds] = React.useState([]);
  const [notes, setNotes] = React.useState({});
  const [generalNotes, setGeneralNotes] = React.useState('');
  const [nurseFrom, setNurseFrom] = React.useState('');
  const [nurseTo, setNurseTo] = React.useState('');

  // Get occupied beds
  const occupiedBeds = React.useMemo(() => {
    const beds = [];
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.status === 'occupied' && bed.patient) {
          beds.push({ bed, room, roomType: getRoomTypeById(room.type) });
        }
      });
    });
    return beds;
  }, [rooms]);

  const handleCreate = () => {
    onCreateHandover?.({
      id: `handover_${Date.now()}`,
      fromNurse: nurseFrom,
      toNurse: nurseTo,
      shift: currentShift,
      timestamp: new Date(),
      status: 'pending',
      generalNotes,
      patientNotes: selectedBeds.map(bedId => ({
        bedId,
        notes: notes[bedId] || '',
      })),
    });
    
    setSelectedBeds([]);
    setNotes({});
    setGeneralNotes('');
    setNurseFrom('');
    setNurseTo('');
    setCreateDialogOpen(false);
  };

  const toggleBed = (bedId) => {
    setSelectedBeds(prev => 
      prev.includes(bedId) ? prev.filter(id => id !== bedId) : [...prev, bedId]
    );
  };

  const getShiftLabel = (shift) => {
    switch (shift) {
      case 'morning': return 'Morning (6AM - 2PM)';
      case 'afternoon': return 'Afternoon (2PM - 10PM)';
      case 'night': return 'Night (10PM - 6AM)';
      default: return shift;
    }
  };

  const pendingHandovers = handovers.filter(h => h.status === 'pending');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Shift Handover
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{getShiftLabel(currentShift)}</Badge>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Handover
          </Button>
        </div>
      </div>

      {/* Pending Acknowledgments */}
      {pendingHandovers.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="py-2 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Pending Acknowledgment ({pendingHandovers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {pendingHandovers.map(handover => (
              <div key={handover.id} className="p-3 bg-white rounded-lg border mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{handover.fromNurse}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{handover.toNurse}</span>
                  </div>
                  <Button
                    size="sm"
                    className="h-7"
                    onClick={() => onAcknowledge?.(handover.id)}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Acknowledge
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(handover.timestamp), 'HH:mm')} • {handover.patientNotes.length} patients
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Handovers */}
      <ScrollArea className="h-[calc(100vh-450px)]">
        <div className="space-y-2 pr-4">
          {handovers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No handovers recorded</p>
            </div>
          ) : (
            handovers.filter(h => h.status === 'acknowledged').slice(0, 10).map(handover => (
              <Card key={handover.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{handover.fromNurse}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{handover.toNurse}</span>
                        <Badge className="bg-green-100 text-green-800 text-[10px]">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(handover.timestamp), 'dd MMM, HH:mm')} • {getShiftLabel(handover.shift)}
                      </p>
                      {handover.generalNotes && (
                        <p className="text-sm mt-2 p-2 bg-muted/50 rounded text-muted-foreground">
                          {handover.generalNotes}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {handover.patientNotes.length} patients
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create Shift Handover</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From (Outgoing Nurse)</Label>
                  <Input
                    value={nurseFrom}
                    onChange={(e) => setNurseFrom(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>To (Incoming Nurse)</Label>
                  <Input
                    value={nurseTo}
                    onChange={(e) => setNurseTo(e.target.value)}
                    placeholder="Recipient name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>General Notes</Label>
                <Textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Overall shift summary, important events..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Patient-Specific Notes</Label>
                <p className="text-xs text-muted-foreground">
                  Select patients and add individual notes for each
                </p>
                <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                  {occupiedBeds.map(({ bed, room, roomType }) => (
                    <div key={bed.id} className="p-3">
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => toggleBed(bed.id)}
                      >
                        <Checkbox checked={selectedBeds.includes(bed.id)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{bed.patient.name}</span>
                            <Badge className={`${roomType.color} text-[10px]`}>{bed.bedNumber}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{bed.patient.condition}</p>
                        </div>
                      </div>
                      {selectedBeds.includes(bed.id) && (
                        <Textarea
                          className="mt-2"
                          placeholder={`Notes for ${bed.patient.name}...`}
                          value={notes[bed.id] || ''}
                          onChange={(e) => setNotes({ ...notes, [bed.id]: e.target.value })}
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!nurseFrom || !nurseTo}>
              <Send className="h-4 w-4 mr-2" />
              Submit Handover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
