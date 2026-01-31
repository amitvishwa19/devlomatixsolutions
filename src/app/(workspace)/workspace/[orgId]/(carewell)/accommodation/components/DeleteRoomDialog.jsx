import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function DeleteRoomDialog({ open, onOpenChange, room, onDelete }) {
  const hasOccupiedBeds = room?.beds?.some(bed => 
    bed.status === 'occupied' || bed.status === 'reserved' || bed.status === 'discharge_pending'
  );

  const handleDelete = () => {
    if (hasOccupiedBeds) {
      toast.error('Cannot delete room with occupied or reserved beds');
      return;
    }
    
    onDelete(room.id);
    onOpenChange(false);
    toast.success(`Room ${room.roomNumber} deleted successfully`);
  };

  if (!room) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Room {room.roomNumber}?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This action cannot be undone. This will permanently delete the room
              and all {room.beds?.length || 0} bed(s) associated with it.
            </p>
            
            {hasOccupiedBeds && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive font-medium text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Cannot delete - Room has occupied or reserved beds
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {room.beds?.filter(b => 
                    b.status === 'occupied' || b.status === 'reserved' || b.status === 'discharge_pending'
                  ).map(bed => (
                    <Badge key={bed.id} variant="destructive" className="text-xs">
                      {bed.bedNumber}: {bed.status}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {!hasOccupiedBeds && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Room Details:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Type: {room.type}</li>
                  <li>• Floor: {room.floor}</li>
                  <li>• Wing: {room.wing}</li>
                  <li>• Beds: {room.beds?.length || 0}</li>
                  <li>• Daily Rate: ₹{room.dailyRate?.toLocaleString()}</li>
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={hasOccupiedBeds}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Room
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
