import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { formatShortDate } from '../utils';
import { EQUIPMENT_STATUS } from '../types';

export function EquipmentSheet({ open, onOpenChange, equipment }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[620px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-1 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Lab Equipment</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {equipment?.map((eq) => {
                const status = EQUIPMENT_STATUS.find((s) => s.id === eq.status);
                return (
                  <Card key={eq.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{eq.name}</h4>
                          <p className="text-xs text-muted-foreground">{eq.model}</p>
                        </div>
                        <Badge className={status?.color}>{status?.label}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Serial: {eq.serialNumber}</p>
                        <p>Next Calibration: {formatShortDate(eq.nextCalibration)}</p>
                        <p>Next Maintenance: {formatShortDate(eq.nextMaintenance)}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function QualityControlSheet({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[620px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-1 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Quality Control Records</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            <p className="text-muted-foreground text-center py-8">QC records will appear here</p>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SampleCollectionSheet({ open, onOpenChange, orders, onCollect }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[620px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-1 p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle>Pending Sample Collection ({orders?.length || 0})</SheetTitle>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {orders?.map((order) => (
                <Card key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onCollect(order.id, 'sample_collected')}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{order.patient.name}</p>
                        <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
                      </div>
                      <Badge variant="outline">Click to collect</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!orders || orders.length === 0) && (
                <p className="text-muted-foreground text-center py-8">No pending collections</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function LabAnalytics({ orders }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Tests by Category</h3>
          <p className="text-muted-foreground">Analytics charts coming soon</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Turnaround Times</h3>
          <p className="text-muted-foreground">Analytics charts coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
