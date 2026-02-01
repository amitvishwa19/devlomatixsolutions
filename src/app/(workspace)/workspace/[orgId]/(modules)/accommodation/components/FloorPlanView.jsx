import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Clock, Wrench, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { FLOORS, WINGS } from '../utils/types';
import { getRoomTypeById, getBedStatusById, getFloorById, getWingById } from '../utils/utils';

export function FloorPlanView({ rooms, onSelectBed, onSelectRoom }) {
  const [selectedFloor, setSelectedFloor] = React.useState('ground');

  const floorRooms = React.useMemo(() => {
    return rooms.filter(room => room.floor === selectedFloor);
  }, [rooms, selectedFloor]);

  const roomsByWing = React.useMemo(() => {
    const grouped = {};
    WINGS.forEach(wing => {
      grouped[wing.id] = floorRooms.filter(room => room.wing === wing.id);
    });
    return grouped;
  }, [floorRooms]);

  const getBedIcon = (status) => {
    switch (status) {
      case 'occupied':
        return <User className="h-3 w-3" />;
      case 'reserved':
        return <Clock className="h-3 w-3" />;
      case 'maintenance':
        return <Wrench className="h-3 w-3" />;
      case 'cleaning':
        return <Sparkles className="h-3 w-3" />;
      case 'discharge_pending':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Floor Tabs */}
      <Tabs value={selectedFloor} onValueChange={setSelectedFloor}>
        <TabsList className="grid grid-cols-5 w-full max-w-lg">
          {FLOORS.map(floor => (
            <TabsTrigger key={floor.id} value={floor.id} className="text-xs">
              {floor.shortName} - {floor.name.replace(' Floor', '')}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Wing Sections */}
      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {WINGS.map(wing => {
            const wingRooms = roomsByWing[wing.id] || [];
            if (wingRooms.length === 0) return null;

            return (
              <Card key={wing.id} className="border-border">
                <CardHeader className="py-3 px-4 border-b bg-muted/30">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>{wing.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {wingRooms.reduce((acc, r) => acc + r.beds.length, 0)} beds
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {wingRooms.map(room => {
                      const roomType = getRoomTypeById(room.type);
                      return (
                        <div
                          key={room.id}
                          className="p-2 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => onSelectRoom?.(room)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`${roomType.color} text-[10px] px-1.5 py-0`}>
                                {room.roomNumber}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{roomType.name}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          
                          {/* Bed Grid */}
                          <div className="flex flex-wrap gap-1">
                            {room.beds.map(bed => {
                              const bedStatus = getBedStatusById(bed.status);
                              return (
                                <Tooltip key={bed.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      className={`w-8 h-8 rounded flex items-center justify-center text-white text-[10px] font-medium transition-transform hover:scale-110 ${bedStatus.color}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectBed?.(bed, room);
                                      }}
                                    >
                                      {getBedIcon(bed.status) || bed.bedNumber.split('-').pop()}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="text-xs">
                                    <p className="font-medium">{bed.bedNumber}</p>
                                    <p className="text-muted-foreground">{bedStatus.name}</p>
                                    {bed.patient && (
                                      <p className="text-primary">{bed.patient.name}</p>
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg">
        <span className="text-xs text-muted-foreground font-medium">Legend:</span>
        {[
          { status: 'available', label: 'Available' },
          { status: 'occupied', label: 'Occupied' },
          { status: 'reserved', label: 'Reserved' },
          { status: 'cleaning', label: 'Cleaning' },
          { status: 'maintenance', label: 'Maintenance' },
          { status: 'discharge_pending', label: 'Discharge Pending' },
        ].map(item => {
          const status = getBedStatusById(item.status);
          return (
            <div key={item.status} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${status.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
