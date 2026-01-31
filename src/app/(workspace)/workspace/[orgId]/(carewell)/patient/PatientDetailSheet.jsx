import { User, Heart, History, Pill, AlertTriangle, FileText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getInitials, getStatusColor } from './utils';
import { PATIENT_STATUSES } from './types';
import { 
  VitalsTab, 
  PrescriptionsTab, 
  MedicalHistoryTab, 
  DocumentsTab, 
  AllergiesTab,
  DemographicsTab 
} from './components';
import { QuickActionButtons } from '@/carewell/utils/crossModuleNavigation';

export function PatientDetailSheet({ patient, open, onOpenChange, onUpdatePatient }) {
  if (!patient) return null;

  const status = PATIENT_STATUSES.find((s) => s.id === patient.status);

  // Count items for badges
  const allergyCount = patient.allergies?.length || 0;
  const prescriptionCount = patient.prescriptions?.length || 0;
  const documentCount = patient.documents?.length || 0;
  const historyCount = patient.medicalHistory?.length || 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[650px] p-0 flex flex-col h-full">
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                {getInitials(patient.fullName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SheetTitle className="text-lg">{patient.fullName}</SheetTitle>
                  <Badge variant="outline" className={getStatusColor(patient.status)}>
                    {status?.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{patient.mrn}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{patient.age} yrs</span>
                  <span>•</span>
                  <span className="capitalize">{patient.gender}</span>
                  {patient.bloodGroup && (
                    <>
                      <span>•</span>
                      <span className="uppercase">{patient.bloodGroup}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Cross-Module Quick Actions */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
            <QuickActionButtons
              patientId={patient.mrn}
              patientName={patient.fullName}
              actions={['scheduleAppointment', 'viewPrescriptions', 'orderLabTest', 'viewBedAssignment', 'viewInvoices']}
              size="sm"
            />
          </div>
        </SheetHeader>

        <Tabs defaultValue="demographics" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid grid-cols-6 h-auto">
            <TabsTrigger value="demographics" className="text-xs py-2">
              <User className="w-3 h-3 mr-1" />
              Info
            </TabsTrigger>
            <TabsTrigger value="vitals" className="text-xs py-2">
              <Heart className="w-3 h-3 mr-1" />
              Vitals
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs py-2 relative">
              <History className="w-3 h-3 mr-1" />
              History
              {historyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="text-xs py-2 relative">
              <Pill className="w-3 h-3 mr-1" />
              Rx
              {prescriptionCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                  {prescriptionCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="allergies" className="text-xs py-2 relative">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Allergies
              {allergyCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {allergyCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs py-2 relative">
              <FileText className="w-3 h-3 mr-1" />
              Docs
              {documentCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                  {documentCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-6">
            <TabsContent value="demographics">
              <DemographicsTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>

            <TabsContent value="vitals">
              <VitalsTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>

            <TabsContent value="history">
              <MedicalHistoryTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>

            <TabsContent value="prescriptions">
              <PrescriptionsTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>

            <TabsContent value="allergies">
              <AllergiesTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentsTab patient={patient} onUpdatePatient={onUpdatePatient} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
