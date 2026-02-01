import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { RefreshCw, CheckCircle, XCircle, Clock, User, Pill, Calendar, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MOCK_REFILL_REQUESTS } from '../utils/refillData';

export function RefillManagementSheet({ open, onOpenChange, prescriptions = [], onUpdatePrescription }) {
    const [refillRequests, setRefillRequests] = useState(MOCK_REFILL_REQUESTS);
    const [processingId, setProcessingId] = useState(null);
    const [denyReason, setDenyReason] = useState('');
    const [showDenyInput, setShowDenyInput] = useState(null);
    const { toast } = useToast();

    const pendingRequests = refillRequests.filter(r => r.status === 'pending');
    const processedRequests = refillRequests.filter(r => r.status !== 'pending');

    // Prescriptions eligible for auto-refill
    const eligibleForRefill = prescriptions.filter(
        rx => rx.status === 'active' && rx.refillsRemaining > 0
    );

    const handleApproveRefill = async (request) => {
        setProcessingId(request.id);
        await new Promise(resolve => setTimeout(resolve, 800));

        setRefillRequests(prev => prev.map(r =>
            r.id === request.id
                ? { ...r, status: 'approved', processedAt: new Date(), processedBy: 'Dr. Sarah Johnson' }
                : r
        ));

        // Update the original prescription
        onUpdatePrescription?.(request.prescriptionId, {
            refillsRemaining: (request.refillsRemaining || 1) - 1,
            lastRefillDate: new Date(),
        });

        toast({ title: 'Refill approved', description: `Refill approved for ${request.patientName}` });
        setProcessingId(null);
    };

    const handleDenyRefill = async (request) => {
        if (!denyReason) {
            toast({ title: 'Reason required', description: 'Please provide a reason for denial.', variant: 'destructive' });
            return;
        }

        setProcessingId(request.id);
        await new Promise(resolve => setTimeout(resolve, 800));

        setRefillRequests(prev => prev.map(r =>
            r.id === request.id
                ? { ...r, status: 'denied', processedAt: new Date(), processedBy: 'Dr. Sarah Johnson', denyReason }
                : r
        ));

        toast({ title: 'Refill denied', description: `Refill denied for ${request.patientName}` });
        setProcessingId(null);
        setShowDenyInput(null);
        setDenyReason('');
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending' };
            case 'approved':
                return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' };
            case 'denied':
                return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Denied' };
            default:
                return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: status };
        }
    };

    const RefillRequestCard = ({ request, showActions = true }) => {
        const statusConfig = getStatusConfig(request.status);

        return (
            <div className="p-4 border border-border rounded-lg bg-background">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{request.patientName}</p>
                            <p className="text-xs text-muted-foreground">{request.patientMrn}</p>
                        </div>
                    </div>
                    <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                        <statusConfig.icon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                    </Badge>
                </div>

                <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Pill className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{request.medicineName}</span>
                        <span className="text-muted-foreground">{request.dosage}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Requested: {format(new Date(request.requestedAt), 'dd MMM yyyy, HH:mm')}</span>
                    </div>
                    {request.refillsRemaining !== undefined && (
                        <div className="flex items-center gap-2 text-xs">
                            <RefreshCw className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                {request.refillsRemaining} refill{request.refillsRemaining !== 1 ? 's' : ''} remaining
                            </span>
                        </div>
                    )}
                </div>

                {request.status === 'denied' && request.denyReason && (
                    <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded text-xs text-red-600 mb-3">
                        <strong>Reason:</strong> {request.denyReason}
                    </div>
                )}

                {request.status === 'pending' && showActions && (
                    <>
                        {showDenyInput === request.id ? (
                            <div className="space-y-2">
                                <Textarea
                                    placeholder="Reason for denial..."
                                    value={denyReason}
                                    onChange={(e) => setDenyReason(e.target.value)}
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleDenyRefill(request)}
                                        disabled={processingId === request.id}
                                    >
                                        Confirm Deny
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setShowDenyInput(null);
                                            setDenyReason('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1 gap-1"
                                    onClick={() => handleApproveRefill(request)}
                                    disabled={processingId === request.id}
                                >
                                    {processingId === request.id ? (
                                        <Clock className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-3 h-3" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 gap-1 text-destructive"
                                    onClick={() => setShowDenyInput(request.id)}
                                    disabled={processingId === request.id}
                                >
                                    <XCircle className="w-3 h-3" />
                                    Deny
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {request.processedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                        Processed by {request.processedBy} on {format(new Date(request.processedAt), 'dd MMM yyyy')}
                    </p>
                )}
            </div>
        );
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl min-w-[620px] bg-transparent border-0 p-2">

                <div className=' bg-card p-2 rounded-lg border overflow-hidden h-full'>
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-primary" />
                            Refill Management
                            {pendingRequests.length > 0 && (
                                <Badge className="bg-amber-100 text-amber-700">
                                    {pendingRequests.length} pending
                                </Badge>
                            )}
                        </SheetTitle>
                    </SheetHeader>

                    <Tabs defaultValue="pending" className="mt-4">

                        <TabsList className="w-full">
                            <TabsTrigger value="pending" className="flex-1 gap-1">
                                <Clock className="w-4 h-4" />
                                Pending ({pendingRequests.length})
                            </TabsTrigger>
                            <TabsTrigger value="processed" className="flex-1 gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Processed
                            </TabsTrigger>
                            <TabsTrigger value="eligible" className="flex-1 gap-1">
                                <RefreshCw className="w-4 h-4" />
                                Eligible
                            </TabsTrigger>
                        </TabsList>

                        <ScrollArea className="h-[80vh] mt-4">
                            <TabsContent value="pending" className="space-y-3 pr-4 m-0">
                                {pendingRequests.length > 0 ? (
                                    pendingRequests.map((request) => (
                                        <RefillRequestCard key={request.id} request={request} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                        <p>No pending refill requests</p>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="processed" className="space-y-3 pr-4 m-0">
                                {processedRequests.length > 0 ? (
                                    processedRequests.map((request) => (
                                        <RefillRequestCard key={request.id} request={request} showActions={false} />
                                    ))
                                ) : (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No processed requests
                                    </p>
                                )}
                            </TabsContent>

                            <TabsContent value="eligible" className="space-y-3 pr-4 m-0">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Active prescriptions with remaining refills
                                </p>
                                {eligibleForRefill.length > 0 ? (
                                    eligibleForRefill.map((rx) => (
                                        <div key={rx.id} className="p-4 border border-border rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <p className="font-medium text-sm">{rx.patientName}</p>
                                                    <p className="text-xs text-muted-foreground">{rx.patientMrn}</p>
                                                </div>
                                                <Badge className="bg-green-100 text-green-700">
                                                    <RefreshCw className="w-3 h-3 mr-1" />
                                                    {rx.refillsRemaining} refills
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {rx.medicines.map((med, i) => (
                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                        {med.name} {med.dosage}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-8 text-muted-foreground">
                                        No prescriptions eligible for refill
                                    </p>
                                )}
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
