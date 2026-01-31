import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
  Wrench, Plus, CalendarIcon, Clock, User, Bed, AlertTriangle, 
  CheckCircle, XCircle, Play, Pause, MoreHorizontal, Trash2, Edit
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format, isSameDay, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ROOM_TYPES, FLOORS, WINGS } from '../types';

const MAINTENANCE_TYPES = [
  { id: 'preventive', name: 'Preventive Maintenance', color: 'bg-blue-500', description: 'Regular scheduled maintenance' },
  { id: 'corrective', name: 'Corrective Maintenance', color: 'bg-amber-500', description: 'Fixing known issues' },
  { id: 'emergency', name: 'Emergency Repair', color: 'bg-red-500', description: 'Urgent repairs needed' },
  { id: 'upgrade', name: 'Upgrade/Renovation', color: 'bg-purple-500', description: 'Room improvements' },
  { id: 'inspection', name: 'Safety Inspection', color: 'bg-green-500', description: 'Regulatory compliance' },
  { id: 'deep_clean', name: 'Deep Cleaning', color: 'bg-cyan-500', description: 'Thorough sanitization' },
];

const MAINTENANCE_STATUS = [
  { id: 'scheduled', name: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-amber-100 text-amber-800' },
  { id: 'completed', name: 'Completed', color: 'bg-green-100 text-green-800' },
  { id: 'cancelled', name: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  { id: 'delayed', name: 'Delayed', color: 'bg-red-100 text-red-800' },
];

const generateMockMaintenanceSchedule = () => [
  { 
    id: 'maint_1', 
    roomId: 'room_1', 
    roomNumber: 'ICU-01', 
    bedId: null,
    type: 'preventive', 
    title: 'HVAC Filter Replacement',
    description: 'Replace air filters and check ventilation system',
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    estimatedHours: 2,
    assignedTo: 'Maintenance Team A',
    status: 'scheduled',
    priority: 'medium',
    notes: '',
  },
  { 
    id: 'maint_2', 
    roomId: 'room_5', 
    roomNumber: '1E-03',
    bedId: 'bed_10',
    bedNumber: '1E-03-A',
    type: 'corrective', 
    title: 'Bed Motor Repair',
    description: 'Fix malfunctioning bed elevation motor',
    startDate: new Date(),
    endDate: new Date(),
    estimatedHours: 4,
    assignedTo: 'Tech Support',
    status: 'in_progress',
    priority: 'high',
    notes: 'Parts ordered, awaiting delivery',
  },
  { 
    id: 'maint_3', 
    roomId: 'room_8', 
    roomNumber: '2E-05',
    bedId: null,
    type: 'deep_clean', 
    title: 'Post-Discharge Deep Clean',
    description: 'Complete room sanitization after infectious patient',
    startDate: addDays(new Date(), 1),
    endDate: addDays(new Date(), 1),
    estimatedHours: 6,
    assignedTo: 'Housekeeping Special',
    status: 'scheduled',
    priority: 'high',
    notes: 'Use protocol for infectious diseases',
  },
  { 
    id: 'maint_4', 
    roomId: 'room_3', 
    roomNumber: 'ICU-03',
    bedId: null,
    type: 'inspection', 
    title: 'Annual Safety Inspection',
    description: 'Fire safety and electrical compliance check',
    startDate: addDays(new Date(), 5),
    endDate: addDays(new Date(), 5),
    estimatedHours: 3,
    assignedTo: 'Safety Officer',
    status: 'scheduled',
    priority: 'medium',
    notes: '',
  },
];

export function MaintenanceSchedulePanel({ rooms }) {
  const [maintenanceSchedule, setMaintenanceSchedule] = React.useState(generateMockMaintenanceSchedule);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [viewMode, setViewMode] = React.useState('calendar'); // calendar, list
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
  const [editingMaintenance, setEditingMaintenance] = React.useState(null);
  const [newMaintenance, setNewMaintenance] = React.useState({
    roomId: '',
    bedId: '',
    type: 'preventive',
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    estimatedHours: 2,
    assignedTo: '',
    priority: 'medium',
    notes: '',
  });

  // Get maintenance events for a specific date
  const getMaintenanceForDate = (date) => {
    return maintenanceSchedule.filter(m => 
      isWithinInterval(date, { start: m.startDate, end: m.endDate }) ||
      isSameDay(m.startDate, date) ||
      isSameDay(m.endDate, date)
    );
  };

  // Filter maintenance list
  const filteredMaintenance = React.useMemo(() => {
    return maintenanceSchedule.filter(m => {
      if (filterStatus !== 'all' && m.status !== filterStatus) return false;
      if (filterType !== 'all' && m.type !== filterType) return false;
      return true;
    });
  }, [maintenanceSchedule, filterStatus, filterType]);

  // Stats
  const stats = React.useMemo(() => {
    const today = new Date();
    const upcoming = maintenanceSchedule.filter(m => 
      m.status === 'scheduled' && isAfter(m.startDate, today)
    ).length;
    const inProgress = maintenanceSchedule.filter(m => m.status === 'in_progress').length;
    const overdue = maintenanceSchedule.filter(m => 
      m.status === 'scheduled' && isBefore(m.endDate, today)
    ).length;
    const completedThisMonth = maintenanceSchedule.filter(m => 
      m.status === 'completed' && 
      isWithinInterval(m.endDate, { start: startOfMonth(today), end: endOfMonth(today) })
    ).length;
    
    return { upcoming, inProgress, overdue, completedThisMonth };
  }, [maintenanceSchedule]);

  const handleAddMaintenance = () => {
    if (!newMaintenance.roomId || !newMaintenance.title || !newMaintenance.assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    const room = rooms.find(r => r.id === newMaintenance.roomId);
    const bed = room?.beds.find(b => b.id === newMaintenance.bedId);
    
    const maintenance = {
      id: `maint_${Date.now()}`,
      ...newMaintenance,
      roomNumber: room?.roomNumber || '',
      bedNumber: bed?.bedNumber || null,
      status: 'scheduled',
      createdAt: new Date(),
    };

    setMaintenanceSchedule(prev => [...prev, maintenance]);
    setScheduleDialogOpen(false);
    setNewMaintenance({
      roomId: '',
      bedId: '',
      type: 'preventive',
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      estimatedHours: 2,
      assignedTo: '',
      priority: 'medium',
      notes: '',
    });
    toast.success('Maintenance scheduled successfully');
  };

  const handleUpdateStatus = (id, newStatus) => {
    setMaintenanceSchedule(prev => prev.map(m => 
      m.id === id ? { ...m, status: newStatus, updatedAt: new Date() } : m
    ));
    toast.success(`Maintenance status updated to ${newStatus}`);
  };

  const handleDeleteMaintenance = (id) => {
    setMaintenanceSchedule(prev => prev.filter(m => m.id !== id));
    toast.success('Maintenance schedule removed');
  };

  const selectedRoom = rooms.find(r => r.id === newMaintenance.roomId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Scheduling
          </h2>
          <p className="text-sm text-muted-foreground">
            Schedule and track room/bed maintenance activities
          </p>
        </div>
        
        <Button onClick={() => setScheduleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{stats.upcoming}</p>
              </div>
              <CalendarIcon className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
              </div>
              <Play className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed (Month)</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedThisMonth}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'calendar' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {MAINTENANCE_STATUS.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {MAINTENANCE_TYPES.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="grid md:grid-cols-[350px_1fr] gap-6">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className={cn("rounded-md border pointer-events-auto")}
                modifiers={{
                  hasMaintenance: maintenanceSchedule.map(m => m.startDate),
                }}
                modifiersStyles={{
                  hasMaintenance: {
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    color: 'hsl(var(--primary))',
                  }
                }}
              />
              
              {/* Legend */}
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Maintenance Types:</p>
                <div className="grid grid-cols-2 gap-1">
                  {MAINTENANCE_TYPES.map(type => (
                    <div key={type.id} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${type.color}`} />
                      <span className="text-[10px] text-muted-foreground">{type.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
              <CardDescription className="text-xs">
                {getMaintenanceForDate(selectedDate).length} scheduled maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {getMaintenanceForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No maintenance scheduled for this date</p>
                    </div>
                  ) : (
                    getMaintenanceForDate(selectedDate).map(maintenance => {
                      const type = MAINTENANCE_TYPES.find(t => t.id === maintenance.type);
                      const status = MAINTENANCE_STATUS.find(s => s.id === maintenance.status);
                      
                      return (
                        <div 
                          key={maintenance.id}
                          className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-full min-h-[60px] rounded-full ${type?.color || 'bg-gray-400'}`} />
                              <div>
                                <h4 className="font-medium text-sm">{maintenance.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {maintenance.roomNumber}
                                  {maintenance.bedNumber && ` • Bed ${maintenance.bedNumber}`}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className={status?.color} variant="outline">
                                    {status?.name}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px]">
                                    {maintenance.estimatedHours}h
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  <User className="h-3 w-3 inline mr-1" />
                                  {maintenance.assignedTo}
                                </p>
                              </div>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {maintenance.status === 'scheduled' && (
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(maintenance.id, 'in_progress')}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Work
                                  </DropdownMenuItem>
                                )}
                                {maintenance.status === 'in_progress' && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(maintenance.id, 'completed')}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(maintenance.id, 'delayed')}>
                                      <Pause className="h-4 w-4 mr-2" />
                                      Mark Delayed
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleUpdateStatus(maintenance.id, 'cancelled')}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteMaintenance(maintenance.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {filteredMaintenance.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wrench className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No maintenance records found</p>
                  </div>
                ) : (
                  filteredMaintenance.map(maintenance => {
                    const type = MAINTENANCE_TYPES.find(t => t.id === maintenance.type);
                    const status = MAINTENANCE_STATUS.find(s => s.id === maintenance.status);
                    
                    return (
                      <div 
                        key={maintenance.id}
                        className="p-4 hover:bg-muted/50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type?.color || 'bg-gray-400'} text-white`}>
                            <Wrench className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{maintenance.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {maintenance.roomNumber}
                              {maintenance.bedNumber && ` • ${maintenance.bedNumber}`}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {format(maintenance.startDate, 'MMM d, yyyy')}
                              </span>
                              <Badge variant="outline" className="text-[10px]">
                                {type?.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={status?.color}>{status?.name}</Badge>
                          <span className="text-sm text-muted-foreground">{maintenance.assignedTo}</span>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {maintenance.status === 'scheduled' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(maintenance.id, 'in_progress')}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start Work
                                </DropdownMenuItem>
                              )}
                              {maintenance.status === 'in_progress' && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(maintenance.id, 'completed')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteMaintenance(maintenance.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Schedule Maintenance Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Schedule Maintenance
            </DialogTitle>
            <DialogDescription>
              Create a new maintenance schedule for a room or bed
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room *</Label>
                <Select 
                  value={newMaintenance.roomId} 
                  onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, roomId: v, bedId: '' }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Specific Bed (Optional)</Label>
                <Select 
                  value={newMaintenance.bedId} 
                  onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, bedId: v }))}
                  disabled={!selectedRoom}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All beds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Entire Room</SelectItem>
                    {selectedRoom?.beds.map(bed => (
                      <SelectItem key={bed.id} value={bed.id}>
                        {bed.bedNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Maintenance Type *</Label>
              <Select 
                value={newMaintenance.type} 
                onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAINTENANCE_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${type.color}`} />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={newMaintenance.title}
                onChange={(e) => setNewMaintenance(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., HVAC System Check"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newMaintenance.description}
                onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the maintenance work..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newMaintenance.startDate, 'MMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newMaintenance.startDate}
                      onSelect={(date) => date && setNewMaintenance(prev => ({ 
                        ...prev, 
                        startDate: date,
                        endDate: isAfter(prev.endDate, date) ? prev.endDate : date
                      }))}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Estimated Hours *</Label>
                <Input
                  type="number"
                  min={1}
                  value={newMaintenance.estimatedHours}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Assigned To *</Label>
                <Input
                  value={newMaintenance.assignedTo}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Team or person name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={newMaintenance.priority} 
                  onValueChange={(v) => setNewMaintenance(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMaintenance}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
