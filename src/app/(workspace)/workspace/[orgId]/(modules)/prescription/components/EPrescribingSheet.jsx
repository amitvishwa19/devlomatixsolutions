import React, { useState } from 'react';
import { format } from 'date-fns';
import { Send, Building2, Phone, MapPin, CheckCircle, Clock, AlertCircle, Truck, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PHARMACIES, MOCK_SENT_PRESCRIPTIONS } from '../utils/pharmacyData';

export function EPrescribingSheet({ open, onOpenChange, prescription, onSend }) {
  const [searchPharmacy, setSearchPharmacy] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [sending, setSending] = useState(false);
  const [sentPrescriptions, setSentPrescriptions] = useState(MOCK_SENT_PRESCRIPTIONS);
  const { toast } = useToast();

  const filteredPharmacies = MOCK_PHARMACIES.filter(
    p => p.name.toLowerCase().includes(searchPharmacy.toLowerCase()) ||
      p.address.toLowerCase().includes(searchPharmacy.toLowerCase())
  );

  const handleSendPrescription = async () => {
    if (!selectedPharmacy) {
      toast({ title: 'Select pharmacy', description: 'Please select a pharmacy to send the prescription.', variant: 'destructive' });
      return;
    }

    setSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newSent = {
      id: `erx-${Date.now()}`,
      prescriptionId: prescription.id,
      patientName: prescription.patientName,
      pharmacy: selectedPharmacy,
      sentAt: new Date(),
      status: 'transmitted',
      medicines: prescription.medicines,
    };

    setSentPrescriptions(prev => [newSent, ...prev]);
    onSend?.(newSent);

    toast({
      title: 'Prescription sent',
      description: `Prescription sent to ${selectedPharmacy.name} successfully.`
    });

    setSending(false);
    setSelectedPharmacy(null);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'transmitted':
        return { icon: Send, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Transmitted' };
      case 'received':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Received' };
      case 'processing':
        return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Processing' };
      case 'ready':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Ready for Pickup' };
      case 'dispensed':
        return { icon: Truck, color: 'text-primary', bg: 'bg-primary/10', label: 'Dispensed' };
      case 'failed':
        return { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: status };
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            E-Prescribing
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="space-y-6 pr-4">
            {prescription && (
              <>
                {/* Current Prescription Summary */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2">Current Prescription</h4>
                  <p className="text-sm">{prescription.patientName}</p>
                  <p className="text-xs text-muted-foreground mb-2">{prescription.diagnosis}</p>
                  <div className="flex flex-wrap gap-1">
                    {prescription.medicines.map((med, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {med.name} {med.dosage}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Pharmacy Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Select Pharmacy</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search pharmacies..."
                      value={searchPharmacy}
                      onChange={(e) => setSearchPharmacy(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <RadioGroup
                    value={selectedPharmacy?.id}
                    onValueChange={(val) => {
                      const pharmacy = MOCK_PHARMACIES.find(p => p.id === val);
                      setSelectedPharmacy(pharmacy);
                    }}
                  >
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {filteredPharmacies.map((pharmacy) => (
                        <div
                          key={pharmacy.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedPharmacy?.id === pharmacy.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-secondary/30'
                            }`}
                          onClick={() => setSelectedPharmacy(pharmacy)}
                        >
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value={pharmacy.id} className="mt-1" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-sm">{pharmacy.name}</span>
                                {pharmacy.preferred && (
                                  <Badge className="text-xs bg-primary/10 text-primary">Preferred</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" />
                                {pharmacy.address}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {pharmacy.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleSendPrescription}
                  disabled={!selectedPharmacy || sending}
                >
                  {sending ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send to Pharmacy
                    </>
                  )}
                </Button>

                <Separator />
              </>
            )}

            {/* Sent Prescriptions History */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Recent E-Prescriptions</h4>
              {sentPrescriptions.length > 0 ? (
                <div className="space-y-2">
                  {sentPrescriptions.map((sent) => {
                    const statusConfig = getStatusConfig(sent.status);
                    return (
                      <div key={sent.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium">{sent.patientName}</p>
                            <p className="text-xs text-muted-foreground">{sent.pharmacy.name}</p>
                          </div>
                          <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                            <statusConfig.icon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Sent: {format(new Date(sent.sentAt), 'dd MMM yyyy, HH:mm')}</span>
                          <span>{sent.medicines.length} medicine(s)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No e-prescriptions sent yet
                </p>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
