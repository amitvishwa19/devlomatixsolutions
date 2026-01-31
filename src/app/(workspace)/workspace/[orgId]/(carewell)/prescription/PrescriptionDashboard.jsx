import { useState, useMemo } from 'react';
import { Plus, ShieldAlert, Send, RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrescriptionStatsCards } from './PrescriptionStatsCards';
import { PrescriptionFilters } from './PrescriptionFilters';
import { PrescriptionList } from './PrescriptionList';
import { PrescriptionTableView } from './PrescriptionTableView';
import { PrescriptionDetailSheet } from './PrescriptionDetailSheet';
import { NewPrescriptionDialog } from './NewPrescriptionDialog';
import { DrugInteractionChecker, EPrescribingSheet, RefillManagementSheet, PrescriptionAnalytics } from './components';
import { mockPrescriptions } from './mockPrescriptions';
import { filterPrescriptions, calculateStats } from './utils';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { MOCK_REFILL_REQUESTS } from './refillData';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';

export function PrescriptionDashboard() {
  const [prescriptions, setPrescriptions] = useLocalStorage('hms_prescriptions', mockPrescriptions);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [doctor, setDoctor] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  
  // Advanced feature states
  const [showInteractionChecker, setShowInteractionChecker] = useState(false);
  const [showEPrescribing, setShowEPrescribing] = useState(false);
  const [showRefillManagement, setShowRefillManagement] = useState(false);
  const [activeTab, setActiveTab] = useState('prescriptions');
  
  const { toast } = useToast();

  // Pending refills count
  const pendingRefillsCount = MOCK_REFILL_REQUESTS.filter(r => r.status === 'pending').length;

  // Get unique doctors for filter
  const doctors = useMemo(() => {
    const uniqueDoctors = [...new Set(prescriptions.map(rx => rx.doctor))];
    return uniqueDoctors.sort();
  }, [prescriptions]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return filterPrescriptions(prescriptions, { search, status, doctor });
  }, [prescriptions, search, status, doctor]);

  // Calculate stats
  const stats = useMemo(() => {
    return calculateStats(prescriptions);
  }, [prescriptions]);

  const handleAddPrescription = (newPrescription) => {
    console.log('Adding prescription:', newPrescription);
    setPrescriptions(prev => [newPrescription, ...prev]);
  };

  const handleDeletePrescription = (rxId) => {
    console.log('Deleting prescription:', rxId);
    setPrescriptions(prev => prev.filter(rx => rx.id !== rxId));
    setSelectedPrescription(null);
    toast({ title: 'Prescription deleted', description: 'Prescription has been removed.' });
  };

  const handleStatusChange = (rxId, newStatus) => {
    console.log('Updating prescription status:', { rxId, newStatus });
    setPrescriptions(prev => prev.map(rx => 
      rx.id === rxId ? { ...rx, status: newStatus } : rx
    ));
    setSelectedPrescription(prev => prev ? { ...prev, status: newStatus } : null);
    toast({ title: 'Status updated', description: `Prescription marked as ${newStatus}.` });
  };

  const handleUpdatePrescription = (rxId, updates) => {
    console.log('Updating prescription:', { rxId, updates });
    setPrescriptions(prev => prev.map(rx =>
      rx.id === rxId ? { ...rx, ...updates } : rx
    ));
  };

  const handleSendToPharmacy = () => {
    if (selectedPrescription) {
      setShowEPrescribing(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-muted-foreground text-sm">Manage and track patient prescriptions</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Advanced Feature Buttons */}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5"
            onClick={() => setShowInteractionChecker(true)}
          >
            <ShieldAlert className="w-4 h-4" />
            Interaction Check
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1.5 relative"
            onClick={() => setShowRefillManagement(true)}
          >
            <RefreshCw className="w-4 h-4" />
            Refills
            {pendingRefillsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-amber-500 text-white text-xs">
                {pendingRefillsCount}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setShowNewDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Stats */}
      <PrescriptionStatsCards stats={stats} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4 mt-4">
          {/* Filters */}
          <PrescriptionFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={setStatus}
            doctor={doctor}
            onDoctorChange={setDoctor}
            doctors={doctors}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Content */}
          {viewMode === 'grid' ? (
            <PrescriptionList
              prescriptions={filteredPrescriptions}
              onSelectPrescription={setSelectedPrescription}
            />
          ) : (
            <PrescriptionTableView
              prescriptions={filteredPrescriptions}
              onSelectPrescription={setSelectedPrescription}
              onDeletePrescription={handleDeletePrescription}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <PrescriptionAnalytics prescriptions={prescriptions} />
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <PrescriptionDetailSheet
        prescription={selectedPrescription}
        open={!!selectedPrescription}
        onOpenChange={(open) => !open && setSelectedPrescription(null)}
        onDelete={handleDeletePrescription}
        onStatusChange={handleStatusChange}
        onSendToPharmacy={handleSendToPharmacy}
        onCheckInteractions={() => setShowInteractionChecker(true)}
      />

      {/* New Prescription Dialog */}
      <NewPrescriptionDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSave={handleAddPrescription}
        onCheckInteractions={() => setShowInteractionChecker(true)}
      />

      {/* Drug Interaction Checker */}
      <DrugInteractionChecker
        open={showInteractionChecker}
        onOpenChange={setShowInteractionChecker}
        medicines={selectedPrescription?.medicines || []}
        patientMedications={[]}
      />

      {/* E-Prescribing Sheet */}
      <EPrescribingSheet
        open={showEPrescribing}
        onOpenChange={setShowEPrescribing}
        prescription={selectedPrescription}
        onSend={(sent) => {
          toast({ title: 'E-Prescription sent', description: `Sent to ${sent.pharmacy.name}` });
        }}
      />

      {/* Refill Management Sheet */}
      <RefillManagementSheet
        open={showRefillManagement}
        onOpenChange={setShowRefillManagement}
        prescriptions={prescriptions}
        onUpdatePrescription={handleUpdatePrescription}
      />
    </div>
  );
}
