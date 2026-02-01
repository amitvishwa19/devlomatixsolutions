import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User, Calendar, Stethoscope, FlaskConical, Clock, CheckCircle2,
  Printer, Download, AlertTriangle, ArrowUpRight, ArrowDownRight, X
} from 'lucide-react';
import { formatLabDate, getInitials, calculateTurnaround, formatCurrency } from '../utils/utils';
import {
  TEST_ORDER_STATUS, TEST_ORDER_STATUS_LABELS, TEST_ORDER_STATUS_COLORS,
  PRIORITY_LEVELS, RESULT_STATUS_COLORS
} from '../utils/types';


import { AssignedTags } from '../../taxonomy/components';
import { QuickActionsMenu } from '../../utils';

export function TestOrderDetailSheet({ order, open, onOpenChange, onStatusChange }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!order) return null;

  const statusLabel = TEST_ORDER_STATUS_LABELS[order.status];
  const statusColor = TEST_ORDER_STATUS_COLORS[order.status];
  const priority = PRIORITY_LEVELS.find((p) => p.id === order.priority);
  const turnaround = calculateTurnaround(order.orderedAt, order.completedAt);

  const getNextStatus = () => {
    switch (order.status) {
      case TEST_ORDER_STATUS.ORDERED:
        return { status: TEST_ORDER_STATUS.SAMPLE_COLLECTED, label: 'Mark Sample Collected' };
      case TEST_ORDER_STATUS.SAMPLE_COLLECTED:
        return { status: TEST_ORDER_STATUS.IN_PROGRESS, label: 'Start Processing' };
      case TEST_ORDER_STATUS.IN_PROGRESS:
        return { status: TEST_ORDER_STATUS.COMPLETED, label: 'Mark Completed' };
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-transparent border-0 p-2 min-w-[720px]">
        <div className="bg-card h-full rounded-lg border flex flex-col">
          <SheetHeader className="space-y-4 p-4 pb-2 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                  {getInitials(order.patient.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <SheetTitle className="text-lg">{order.patient.name}</SheetTitle>
                    {order.priority === 'stat' && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        STAT
                      </Badge>
                    )}
                    <Badge variant="outline" className={statusColor}>
                      {statusLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.orderNumber}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{order.patient.mrn}</span>
                    <span>•</span>
                    <span>{order.patient.age} yrs, {order.patient.gender}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <QuickActionsMenu
                  patientId={order.patient.mrn}
                  patientName={order.patient.name}
                  actions={['viewPatient', 'scheduleAppointment', 'viewPrescriptions', 'viewInvoices']}
                />
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {nextStatus && (
                <Button size="sm" onClick={() => onStatusChange?.(order.id, nextStatus.status)}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  {nextStatus.label}
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4 mt-4 justify-start w-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 p-4">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Stethoscope className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ordered By:</span>
                        <span className="font-medium">{order.orderedBy.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Ordered:</span>
                        <span>{formatLabDate(order.orderedAt)}</span>
                      </div>
                      {order.collectedBy && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Collected By:</span>
                          <span>{order.collectedBy.name}</span>
                        </div>
                      )}
                      {order.sampleCollectedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Collected:</span>
                          <span>{formatLabDate(order.sampleCollectedAt)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FlaskConical className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Tests:</span>
                        <span className="font-medium">{order.tests.length}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge className={priority?.color}>{priority?.label}</Badge>
                      </div>
                      {turnaround && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Turnaround:</span>
                          <span>{turnaround}</span>
                        </div>
                      )}
                      {order.completedAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-muted-foreground">Completed:</span>
                          <span>{formatLabDate(order.completedAt)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Tests */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Ordered Tests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {order.tests.map((test, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{test.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {test.category} • {test.sampleType} • TAT: {test.turnaround}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{formatCurrency(test.price)}</p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between pt-2">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">
                        {formatCurrency(order.tests.reduce((sum, t) => sum + t.price, 0))}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Notes */}
                {order.notes && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Clinical Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{order.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {(order.tags?.length > 0 || order.categories?.length > 0) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Tags & Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AssignedTags tagIds={order.tags} categoryIds={order.categories} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="results" className="mt-0 space-y-4">
                {order.tests.map((test, testIdx) => (
                  <Card key={testIdx}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" />
                        {test.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {test.results ? (
                        <div className="space-y-2">
                          {test.results.map((result, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                              <span className="text-sm">{result.parameter}</span>
                              <div className="flex items-center gap-4">
                                <span className={`font-medium ${RESULT_STATUS_COLORS[result.status]}`}>
                                  {result.value} {result.unit}
                                  {result.status.includes('high') && <ArrowUpRight className="inline w-4 h-4 ml-1" />}
                                  {result.status.includes('low') && <ArrowDownRight className="inline w-4 h-4 ml-1" />}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Ref: {result.normalRange}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Results pending...
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {order.completedAt && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                          <div>
                            <p className="font-medium text-sm">Completed</p>
                            <p className="text-xs text-muted-foreground">{formatLabDate(order.completedAt)}</p>
                          </div>
                        </div>
                      )}
                      {order.sampleCollectedAt && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                          <div>
                            <p className="font-medium text-sm">Sample Collected</p>
                            <p className="text-xs text-muted-foreground">
                              {formatLabDate(order.sampleCollectedAt)} by {order.collectedBy?.name}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="font-medium text-sm">Order Created</p>
                          <p className="text-xs text-muted-foreground">
                            {formatLabDate(order.orderedAt)} by {order.orderedBy.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
