import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, AlertCircle, CheckCircle, Clock, Wrench, User, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FLOORS, HOUSEKEEPING_STATUS } from '../types';
import { getHousekeepingAlerts, getRoomTypeById, getFloorById, getWingById } from '../utils';
import { housekeepingStaff } from '../mockData';

export function HousekeepingPanel({ rooms, onUpdateHousekeeping, onAssignStaff }) {
  const [selectedFloor, setSelectedFloor] = React.useState('all');
  const [activeTab, setActiveTab] = React.useState('pending');

  const alerts = React.useMemo(() => getHousekeepingAlerts(rooms), [rooms]);

  const filteredAlerts = React.useMemo(() => {
    return alerts.filter(alert => {
      if (selectedFloor !== 'all' && alert.floor !== selectedFloor) return false;
      return true;
    });
  }, [alerts, selectedFloor]);

  const cleaningInProgress = React.useMemo(() => {
    const beds = [];
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.housekeeping === 'in_progress') {
          beds.push({
            id: bed.id,
            bedNumber: bed.bedNumber,
            roomNumber: room.roomNumber,
            roomType: room.type,
            floor: room.floor,
            wing: room.wing,
          });
        }
      });
    });
    return beds;
  }, [rooms]);

  const bedsNeedingCleanAfterDischarge = React.useMemo(() => {
    const beds = [];
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.status === 'cleaning') {
          beds.push({
            id: bed.id,
            bedNumber: bed.bedNumber,
            roomNumber: room.roomNumber,
            roomType: room.type,
            floor: room.floor,
            wing: room.wing,
          });
        }
      });
    });
    return beds;
  }, [rooms]);

  const getPriorityBadge = (priority) => {
    if (priority === 'high') {
      return <Badge variant="destructive">High Priority</Badge>;
    }
    return <Badge variant="outline" className="text-amber-600 border-amber-200">Medium</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'needs_cleaning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'deep_clean':
        return <Wrench className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium">{filteredAlerts.filter(a => a.status === 'needs_cleaning').length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs Cleaning</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">{filteredAlerts.filter(a => a.status === 'deep_clean').length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Deep Clean</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{cleaningInProgress.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">{bedsNeedingCleanAfterDischarge.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Post-Discharge</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Tabs */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={selectedFloor} onValueChange={setSelectedFloor}>
          <SelectTrigger className="w-40">
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

      {/* Content */}
      <ScrollArea className="h-[calc(100vh-420px)]">
        {activeTab === 'pending' && (
          <div className="space-y-2">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>All beds are clean!</p>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const roomType = getRoomTypeById(alert.roomType);
                const floor = getFloorById(alert.floor);
                const wing = getWingById(alert.wing);
                
                return (
                  <Card key={alert.id} className="border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(alert.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{alert.bedNumber}</span>
                              <Badge className={`${roomType.color} text-[10px]`}>{roomType.name}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {floor.name} • {wing.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(alert.priority)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateHousekeeping?.(alert.id, 'in_progress')}
                          >
                            Start Cleaning
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-2">
            {[...cleaningInProgress, ...bedsNeedingCleanAfterDischarge].length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No cleaning in progress</p>
              </div>
            ) : (
              [...cleaningInProgress, ...bedsNeedingCleanAfterDischarge].map(bed => {
                const roomType = getRoomTypeById(bed.roomType);
                return (
                  <Card key={bed.id} className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                          <div>
                            <span className="font-medium text-sm">{bed.bedNumber}</span>
                            <Badge className={`${roomType.color} text-[10px] ml-2`}>{roomType.name}</Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onUpdateHousekeeping?.(bed.id, 'clean')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-2">
            {housekeepingStaff.map(staff => {
              const assignedFloor = FLOORS.find(f => f.id === staff.assignedFloor);
              return (
                <Card key={staff.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{staff.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {staff.shift} Shift • {assignedFloor?.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">{staff.shift}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
