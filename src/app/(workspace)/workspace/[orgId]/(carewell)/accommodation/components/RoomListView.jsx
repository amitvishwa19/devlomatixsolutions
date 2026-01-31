import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Clock, Eye, MoreHorizontal, ChevronDown, ChevronRight, Pencil, Trash2, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { getRoomTypeById, getBedStatusById, getFloorById, getWingById, formatCurrency } from '../utils';

export function RoomListView({ rooms, onSelectBed, onSelectRoom, onAssignPatient, onTransfer, onEditRoom, onDeleteRoom, onManageBeds }) {
  const [expandedRooms, setExpandedRooms] = React.useState(new Set());

  const toggleRoom = (roomId) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const getOccupancyBadge = (room) => {
    const occupied = room.beds.filter(b => b.status === 'occupied' || b.status === 'discharge_pending').length;
    const total = room.beds.length;
    const percentage = (occupied / total) * 100;

    if (percentage === 100) return <Badge variant="destructive">Full</Badge>;
    if (percentage >= 75) return <Badge className="bg-amber-100 text-amber-800">High</Badge>;
    if (percentage > 0) return <Badge className="bg-blue-100 text-blue-800">Partial</Badge>;
    return <Badge className="bg-green-100 text-green-800">Empty</Badge>;
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Beds</TableHead>
            <TableHead>Occupancy</TableHead>
            <TableHead>Daily Rate</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => {
            const roomType = getRoomTypeById(room.type);
            const floor = getFloorById(room.floor);
            const wing = getWingById(room.wing);
            const isExpanded = expandedRooms.has(room.id);
            const occupiedCount = room.beds.filter(b => b.status === 'occupied' || b.status === 'discharge_pending').length;

            return (
              <React.Fragment key={room.id}>
                <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleRoom(room.id)}>
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{room.roomNumber}</TableCell>
                  <TableCell>
                    <Badge className={`${roomType.color} text-xs`}>{roomType.name}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {floor.name}, {wing.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {room.beds.map((bed) => {
                        const status = getBedStatusById(bed.status);
                        return (
                          <div
                            key={bed.id}
                            className={`w-4 h-4 rounded ${status.color}`}
                            title={`${bed.bedNumber}: ${status.name}`}
                          />
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getOccupancyBadge(room)}
                      <span className="text-xs text-muted-foreground">
                        {occupiedCount}/{room.beds.length}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(room.dailyRate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelectRoom?.(room)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditRoom?.(room)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Room
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onManageBeds?.(room)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Beds
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDeleteRoom?.(room)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Room
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded Beds */}
                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={8} className="bg-muted/30 p-0">
                      <div className="p-4 space-y-2">
                        {room.beds.map((bed) => {
                          const status = getBedStatusById(bed.status);
                          return (
                            <div
                              key={bed.id}
                              className="flex items-center justify-between p-3 bg-card rounded-lg border"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color} text-white`}>
                                  {bed.status === 'occupied' ? (
                                    <User className="h-5 w-5" />
                                  ) : (
                                    <span className="text-xs font-medium">
                                      {bed.bedNumber.split('-').pop()}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{bed.bedNumber}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={`text-xs ${status.textColor}`}>
                                      {status.name}
                                    </Badge>
                                    {bed.patient && (
                                      <span className="text-xs text-muted-foreground">
                                        {bed.patient.name} ({bed.patient.mrn})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {bed.status === 'available' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onAssignPatient?.(bed, room)}
                                  >
                                    Assign Patient
                                  </Button>
                                )}
                                {(bed.status === 'occupied' || bed.status === 'discharge_pending') && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onTransfer?.(bed, room)}
                                  >
                                    Transfer
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => onSelectBed?.(bed, room)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
