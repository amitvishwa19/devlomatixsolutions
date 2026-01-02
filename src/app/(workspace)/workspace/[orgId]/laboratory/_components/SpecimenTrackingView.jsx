import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Package, 
  Barcode, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2,
  FlaskConical,
  Truck,
  Archive,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  collected: { label: 'Collected', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Package className="h-4 w-4" /> },
  received: { label: 'Received', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Truck className="h-4 w-4" /> },
  processing: { label: 'Processing', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: <FlaskConical className="h-4 w-4" /> },
  stored: { label: 'Stored', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: <Archive className="h-4 w-4" /> },
  disposed: { label: 'Disposed', color: 'bg-muted text-muted-foreground border-muted', icon: <Trash2 className="h-4 w-4" /> },
};

const statusSteps = ['collected', 'received', 'processing', 'stored', 'disposed'];

export function SpecimenTrackingView({ orders }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const ordersWithTracking = orders.filter(order => order.specimenTracking);

  const filteredOrders = ordersWithTracking.filter(order => {
    const query = searchQuery.toLowerCase();
    return (
      order.specimenTracking?.barcode.toLowerCase().includes(query) ||
      order.specimenTracking?.specimenId.toLowerCase().includes(query) ||
      order.patient.name.toLowerCase().includes(query) ||
      order.orderId.toLowerCase().includes(query)
    );
  });

  const getStatusIndex = (status) => statusSteps.indexOf(status);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by barcode, specimen ID, patient name, or order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-5 gap-4">
        {statusSteps.map((status) => {
          const config = statusConfig[status];
          const count = ordersWithTracking.filter(o => o.specimenTracking?.status === status).length;
          return (
            <Card key={status} className="bg-card border-border">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <Badge variant="outline" className={config.color}>
                    {count}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Specimen List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Specimen Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const tracking = order.specimenTracking;
                const statusIndex = getStatusIndex(tracking.status);
                
                return (
                  <Card 
                    key={order.id} 
                    className="bg-muted/30 border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => openDetails(order)}
                  >
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Barcode className="h-4 w-4 text-primary" />
                            <span className="font-mono font-medium">{tracking.barcode}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {order.patient.name} • {order.orderId}
                          </div>
                        </div>
                        <Badge variant="outline" className={statusConfig[tracking.status].color}>
                          {statusConfig[tracking.status].label}
                        </Badge>
                      </div>

                      {/* Progress Steps */}
                      <div className="flex items-center justify-between mb-4">
                        {statusSteps.slice(0, -1).map((step, index) => {
                          const isCompleted = index < statusIndex;
                          const isCurrent = index === statusIndex;
                          const config = statusConfig[step];
                          
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                                  isCompleted 
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : isCurrent 
                                      ? 'border-primary text-primary bg-primary/10' 
                                      : 'border-muted-foreground/30 text-muted-foreground'
                                }`}>
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4" />
                                  ) : (
                                    config.icon
                                  )}
                                </div>
                                <span className={`text-xs mt-1 ${
                                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {config.label}
                                </span>
                              </div>
                              {index < statusSteps.length - 2 && (
                                <div className={`flex-1 h-0.5 mx-2 ${
                                  isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{format(tracking.collectedAt, 'MMM d, HH:mm')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate">{tracking.collectedBy}</span>
                        </div>
                        {tracking.storageLocation && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{tracking.storageLocation}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No specimens found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Specimen Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Specimen Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder?.specimenTracking && (
            <div className="space-y-6 mt-4">
              {/* Specimen Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Barcode</p>
                  <p className="font-mono font-medium flex items-center gap-2">
                    <Barcode className="h-4 w-4 text-primary" />
                    {selectedOrder.specimenTracking.barcode}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Specimen ID</p>
                  <p className="font-medium">{selectedOrder.specimenTracking.specimenId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedOrder.specimenTracking.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusConfig[selectedOrder.specimenTracking.status].color}>
                    {statusConfig[selectedOrder.specimenTracking.status].label}
                  </Badge>
                </div>
                {selectedOrder.specimenTracking.storageLocation && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">Storage Location</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {selectedOrder.specimenTracking.storageLocation}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Patient & Order Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Patient & Order</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Patient</p>
                    <p className="font-medium">{selectedOrder.patient.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Order ID</p>
                    <p className="font-medium">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tests</p>
                    <p className="font-medium">{selectedOrder.tests.map(t => t.testCode).join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ordered By</p>
                    <p className="font-medium">{selectedOrder.orderedBy}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Chain of Custody */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Chain of Custody</h4>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4 pr-4">
                    {selectedOrder.specimenTracking.chainOfCustody.map((log, index) => (
                      <div key={log.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary" />
                          {index < selectedOrder.specimenTracking.chainOfCustody.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(log.timestamp, 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">{log.performedBy}</p>
                          {log.notes && (
                            <p className="text-sm mt-1 text-muted-foreground italic">{log.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
