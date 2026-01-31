import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTimeInStage, getInitials } from './utils';
import { 
  User, 
  Phone, 
  MapPin, 
  Stethoscope, 
  Clock, 
  Calendar,
  Droplets,
  AlertTriangle,
  Activity,
  FileText,
  Heart,
  Thermometer,
  Scale,
  Pill,
  FolderOpen,
  ClipboardList,
  Mail,
  CreditCard,
  Building2,
  Users,
  Download,
  Eye,
  Pencil,
  Check,
  X,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  'in-progress': 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  critical: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityStyles = {
  normal: 'bg-secondary text-secondary-foreground',
  urgent: 'bg-amber-100 text-amber-700',
  critical: 'bg-destructive/10 text-destructive',
};

const initialDocuments = [
  { id: '1', name: 'Blood Test Report', type: 'Lab Report', date: new Date(Date.now() - 1000 * 60 * 60 * 24), size: '245 KB' },
  { id: '2', name: 'X-Ray Chest', type: 'Radiology', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), size: '1.2 MB' },
  { id: '3', name: 'ECG Report', type: 'Cardiology', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), size: '340 KB' },
  { id: '4', name: 'Prescription - Initial', type: 'Prescription', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), size: '120 KB' },
];

const documentTypes = ['Lab Report', 'Radiology', 'Cardiology', 'Prescription', 'Discharge Summary', 'Consent Form', 'Other'];

export function PatientDetailSheet({ patient, open, onOpenChange, currentStage }) {
  const [activeTab, setActiveTab] = useState('demographics');
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingVital, setIsAddingVital] = useState(false);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const { toast } = useToast();

  const [vitalsHistory, setVitalsHistory] = useState([
    { id: '1', date: new Date(Date.now() - 1000 * 60 * 60 * 1), bp: '120/80', pulse: '72', temp: '98.6°F', spo2: '98%', respRate: '16' },
    { id: '2', date: new Date(Date.now() - 1000 * 60 * 60 * 6), bp: '118/78', pulse: '74', temp: '98.4°F', spo2: '97%', respRate: '15' },
    { id: '3', date: new Date(Date.now() - 1000 * 60 * 60 * 12), bp: '122/82', pulse: '76', temp: '99.1°F', spo2: '96%', respRate: '18' },
  ]);

  const [newVital, setNewVital] = useState({
    bp: '',
    pulse: '',
    temp: '',
    spo2: '',
    respRate: '',
  });

  const [prescriptions, setPrescriptions] = useState([
    { 
      id: '1', 
      prescribedBy: 'Dr. Priya Patel', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 2),
      medicines: [
        { medicine: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days' },
        { medicine: 'Amoxicillin 250mg', dosage: '1 capsule', frequency: 'Thrice daily', duration: '7 days' },
      ]
    },
    { 
      id: '2', 
      prescribedBy: 'Dr. Sunita Rao', 
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      medicines: [
        { medicine: 'Omeprazole 20mg', dosage: '1 tablet', frequency: 'Once daily', duration: '14 days' },
      ]
    },
  ]);

  const [newPrescriptionMedicines, setNewPrescriptionMedicines] = useState([
    { medicine: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [newPrescriptionDoctor, setNewPrescriptionDoctor] = useState('');

  const [allergies, setAllergies] = useState([
    { id: '1', allergen: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis, difficulty breathing', addedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365) },
    { id: '2', allergen: 'Sulfa drugs', severity: 'Moderate', reaction: 'Skin rash, hives', addedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180) },
    { id: '3', allergen: 'Aspirin', severity: 'Mild', reaction: 'Gastrointestinal discomfort', addedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90) },
  ]);
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: '', reaction: '' });
  
  const [documents, setDocuments] = useState(initialDocuments);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [newDocument, setNewDocument] = useState({ name: '', type: '', file: null });
  
  const [demographics, setDemographics] = useState({
    name: '',
    age: '',
    gender: '',
    bloodGroup: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    emergencyName: 'Rajesh Sharma',
    emergencyRelation: 'Spouse',
    emergencyPhone: '+91 98765 43211',
    insuranceProvider: 'Star Health Insurance',
    policyNumber: 'SHI-2024-789456',
    validUntil: '31 Dec 2025',
    coverage: '₹5,00,000',
  });

  useEffect(() => {
    if (patient) {
      setDemographics({
        name: patient.name,
        age: String(patient.age),
        gender: patient.gender,
        bloodGroup: patient.bloodGroup || 'B+',
        dob: '15 Mar 1985',
        phone: patient.phone || '+91 98765 43210',
        email: 'patient@email.com',
        address: patient.address || '123, Gandhi Nagar, Mumbai - 400001',
        emergencyName: 'Rajesh Sharma',
        emergencyRelation: 'Spouse',
        emergencyPhone: '+91 98765 43211',
        insuranceProvider: 'Star Health Insurance',
        policyNumber: 'SHI-2024-789456',
        validUntil: '31 Dec 2025',
        coverage: '₹5,00,000',
      });
      setIsEditing(false);
    }
  }, [patient]);

  if (!patient) return null;

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Changes saved",
      description: "Patient demographics have been updated successfully.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDemographics({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      bloodGroup: patient.bloodGroup || 'B+',
      dob: '15 Mar 1985',
      phone: patient.phone || '+91 98765 43210',
      email: 'patient@email.com',
      address: patient.address || '123, Gandhi Nagar, Mumbai - 400001',
      emergencyName: 'Rajesh Sharma',
      emergencyRelation: 'Spouse',
      emergencyPhone: '+91 98765 43211',
      insuranceProvider: 'Star Health Insurance',
      policyNumber: 'SHI-2024-789456',
      validUntil: '31 Dec 2025',
      coverage: '₹5,00,000',
    });
  };

  const handleAddVital = () => {
    if (!newVital.bp && !newVital.pulse && !newVital.temp && !newVital.spo2) {
      toast({ title: "Please fill in at least one vital", variant: "destructive" });
      return;
    }
    const vital = {
      id: `v-${Date.now()}`,
      date: new Date(),
      bp: newVital.bp || '-',
      pulse: newVital.pulse || '-',
      temp: newVital.temp || '-',
      spo2: newVital.spo2 || '-',
      respRate: newVital.respRate || '-',
    };
    setVitalsHistory([vital, ...vitalsHistory]);
    setNewVital({ bp: '', pulse: '', temp: '', spo2: '', respRate: '' });
    setIsAddingVital(false);
    toast({ title: "Vital added", description: "New vital signs have been recorded successfully." });
  };

  const handleAddMedicineRow = () => {
    setNewPrescriptionMedicines([...newPrescriptionMedicines, { medicine: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedicineRow = (index) => {
    if (newPrescriptionMedicines.length > 1) {
      setNewPrescriptionMedicines(newPrescriptionMedicines.filter((_, i) => i !== index));
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...newPrescriptionMedicines];
    updated[index] = { ...updated[index], [field]: value };
    setNewPrescriptionMedicines(updated);
  };

  const handleAddPrescription = () => {
    const validMedicines = newPrescriptionMedicines.filter(m => m.medicine.trim());
    if (validMedicines.length === 0) {
      toast({ title: "At least one medicine is required", variant: "destructive" });
      return;
    }
    const prescription = {
      id: `rx-${Date.now()}`,
      date: new Date(),
      prescribedBy: newPrescriptionDoctor || 'Current Doctor',
      medicines: validMedicines.map(m => ({
        medicine: m.medicine,
        dosage: m.dosage || '-',
        frequency: m.frequency || '-',
        duration: m.duration || '-',
      })),
    };
    setPrescriptions([prescription, ...prescriptions]);
    setNewPrescriptionMedicines([{ medicine: '', dosage: '', frequency: '', duration: '' }]);
    setNewPrescriptionDoctor('');
    setIsAddingPrescription(false);
    toast({ title: "Prescription added", description: `${validMedicines.length} medicine(s) added to prescription.` });
  };

  const handleAddAllergy = () => {
    if (!newAllergy.allergen.trim()) {
      toast({ title: "Allergen name is required", variant: "destructive" });
      return;
    }
    const allergy = {
      id: `allergy-${Date.now()}`,
      allergen: newAllergy.allergen,
      severity: newAllergy.severity || 'Mild',
      reaction: newAllergy.reaction || '-',
      addedDate: new Date(),
    };
    setAllergies([allergy, ...allergies]);
    setNewAllergy({ allergen: '', severity: '', reaction: '' });
    setIsAddingAllergy(false);
    toast({ title: "Allergy added", description: `${allergy.allergen} has been added to the allergy list.` });
  };

  const handleDeleteAllergy = (id) => {
    setAllergies(allergies.filter(a => a.id !== id));
    toast({ title: "Allergy removed", description: "The allergy has been removed from the list." });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeKB = Math.round(file.size / 1024);
      const sizeStr = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      setNewDocument({ 
        ...newDocument, 
        file: file,
        name: newDocument.name || file.name.replace(/\.[^/.]+$/, ''),
        size: sizeStr
      });
    }
  };

  const handleUploadDocument = () => {
    if (!newDocument.file) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }
    if (!newDocument.name.trim()) {
      toast({ title: "Document name is required", variant: "destructive" });
      return;
    }
    const doc = {
      id: `doc-${Date.now()}`,
      name: newDocument.name,
      type: newDocument.type || 'Other',
      date: new Date(),
      size: newDocument.size || 'Unknown',
    };
    setDocuments([doc, ...documents]);
    setNewDocument({ name: '', type: '', file: null });
    setIsUploadingDocument(false);
    toast({ title: "Document uploaded", description: `${doc.name} has been added successfully.` });
  };

  const handleDeleteDocument = (id) => {
    setDocuments(documents.filter(d => d.id !== id));
    toast({ title: "Document deleted", description: "The document has been removed." });
  };

  const mockHistory = patient.history || [
    { id: 'h1', date: new Date(Date.now() - 1000 * 60 * 60 * 2), stage: 'Registration', action: 'Patient registered', performedBy: 'Reception Desk' },
    { id: 'h2', date: new Date(Date.now() - 1000 * 60 * 60 * 1.5), stage: 'Triage', action: 'Initial assessment completed', notes: 'Vitals recorded, priority assigned', performedBy: 'Nurse Sarah' },
    { id: 'h3', date: new Date(Date.now() - 1000 * 60 * 60), stage: 'Consultation', action: 'Doctor consultation started', performedBy: patient.doctor || 'Assigned Doctor' },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[750px] lg:max-w-[850px] p-0 flex flex-col h-full w-[90vw]">
        <SheetHeader className="p-6 pb-4 border-b border-border shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
              {getInitials(patient.name)}
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">{patient.name}</SheetTitle>
              <p className="text-sm text-muted-foreground">{patient.mrn}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="outline" className={statusStyles[patient.status]}>
                  {patient.status.replace('-', ' ')}
                </Badge>
                {patient.priority && patient.priority !== 'normal' && (
                  <Badge variant="outline" className={priorityStyles[patient.priority]}>
                    {patient.priority}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-secondary">
                  {patient.workflowType.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6 h-auto py-0 shrink-0 overflow-x-auto">
            <TabsTrigger value="demographics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
              <User className="w-3.5 h-3.5 mr-1.5" />Demographics
            </TabsTrigger>
            <TabsTrigger value="vitals" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
              <Activity className="w-3.5 h-3.5 mr-1.5" />Vitals
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
              <Clock className="w-3.5 h-3.5 mr-1.5" />History
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
              <Pill className="w-3.5 h-3.5 mr-1.5" />Prescriptions
            </TabsTrigger>
            <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
              <FolderOpen className="w-3.5 h-3.5 mr-1.5" />Documents
            </TabsTrigger>
            <TabsTrigger value="clinical" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
              <Stethoscope className="w-3.5 h-3.5 mr-1.5" />Clinical
            </TabsTrigger>
            <TabsTrigger value="allergies" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-3 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />Allergies
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {/* Demographics Tab */}
            <TabsContent value="demographics" className="p-6 pt-4 m-0 space-y-4">
              <div className="flex justify-end">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 text-xs">
                      <X className="w-3.5 h-3.5 mr-1.5" />Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} className="h-8 text-xs">
                      <Check className="w-3.5 h-3.5 mr-1.5" />Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="h-8 text-xs">
                    <Pencil className="w-3.5 h-3.5 mr-1.5" />Edit
                  </Button>
                )}
              </div>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <EditableInfoCard label="Full Name" value={demographics.name} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, name: val })} />
                  <InfoCard label="MRN" value={patient.mrn} />
                  <EditableInfoCard label="Age" value={demographics.age} isEditing={isEditing} type="number" onChange={(val) => setDemographics({ ...demographics, age: val })} />
                  <EditableSelectCard label="Gender" value={demographics.gender} isEditing={isEditing} options={['Male', 'Female', 'Other']} onChange={(val) => setDemographics({ ...demographics, gender: val })} />
                  <EditableSelectCard label="Blood Group" value={demographics.bloodGroup} isEditing={isEditing} options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} onChange={(val) => setDemographics({ ...demographics, bloodGroup: val })} icon={<Droplets className="w-3.5 h-3.5 text-destructive" />} />
                  <EditableInfoCard label="Date of Birth" value={demographics.dob} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, dob: val })} icon={<Calendar className="w-3.5 h-3.5" />} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <EditableInfoCard label="Phone" value={demographics.phone} isEditing={isEditing} type="tel" onChange={(val) => setDemographics({ ...demographics, phone: val })} icon={<Phone className="w-3.5 h-3.5" />} />
                  <EditableInfoCard label="Email" value={demographics.email} isEditing={isEditing} type="email" onChange={(val) => setDemographics({ ...demographics, email: val })} icon={<Mail className="w-3.5 h-3.5" />} />
                  <div className="col-span-2">
                    <EditableInfoCard label="Address" value={demographics.address} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, address: val })} icon={<MapPin className="w-3.5 h-3.5" />} />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />Emergency Contact
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <EditableInfoCard label="Name" value={demographics.emergencyName} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, emergencyName: val })} />
                  <EditableSelectCard label="Relationship" value={demographics.emergencyRelation} isEditing={isEditing} options={['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other']} onChange={(val) => setDemographics({ ...demographics, emergencyRelation: val })} />
                  <EditableInfoCard label="Phone" value={demographics.emergencyPhone} isEditing={isEditing} type="tel" onChange={(val) => setDemographics({ ...demographics, emergencyPhone: val })} icon={<Phone className="w-3.5 h-3.5" />} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />Insurance Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <EditableInfoCard label="Provider" value={demographics.insuranceProvider} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, insuranceProvider: val })} icon={<Building2 className="w-3.5 h-3.5" />} />
                  <EditableInfoCard label="Policy Number" value={demographics.policyNumber} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, policyNumber: val })} />
                  <EditableInfoCard label="Valid Until" value={demographics.validUntil} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, validUntil: val })} icon={<Calendar className="w-3.5 h-3.5" />} />
                  <EditableInfoCard label="Coverage" value={demographics.coverage} isEditing={isEditing} onChange={(val) => setDemographics({ ...demographics, coverage: val })} />
                </div>
              </section>
            </TabsContent>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="p-6 pt-4 m-0 space-y-4">
              <div className="flex justify-end">
                {isAddingVital ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsAddingVital(false)} className="h-8 text-xs"><X className="w-3.5 h-3.5 mr-1.5" />Cancel</Button>
                    <Button size="sm" onClick={handleAddVital} className="h-8 text-xs"><Check className="w-3.5 h-3.5 mr-1.5" />Save Vital</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsAddingVital(true)} className="h-8 text-xs"><Activity className="w-3.5 h-3.5 mr-1.5" />Add New Vital</Button>
                )}
              </div>

              {isAddingVital && (
                <section className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Record New Vital Signs</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="text-xs text-muted-foreground mb-1 block">Blood Pressure</label><Input placeholder="e.g., 120/80" value={newVital.bp} onChange={(e) => setNewVital({ ...newVital, bp: e.target.value })} className="h-9" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Pulse (bpm)</label><Input placeholder="e.g., 72" value={newVital.pulse} onChange={(e) => setNewVital({ ...newVital, pulse: e.target.value })} className="h-9" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Temperature</label><Input placeholder="e.g., 98.6°F" value={newVital.temp} onChange={(e) => setNewVital({ ...newVital, temp: e.target.value })} className="h-9" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">SpO2 (%)</label><Input placeholder="e.g., 98" value={newVital.spo2} onChange={(e) => setNewVital({ ...newVital, spo2: e.target.value })} className="h-9" /></div>
                    <div><label className="text-xs text-muted-foreground mb-1 block">Respiratory Rate</label><Input placeholder="e.g., 16" value={newVital.respRate} onChange={(e) => setNewVital({ ...newVital, respRate: e.target.value })} className="h-9" /></div>
                  </div>
                </section>
              )}

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" />Current Vitals</h3>
                <div className="grid grid-cols-2 gap-3">
                  <VitalCard icon={<Heart className="w-5 h-5 text-destructive" />} label="Blood Pressure" value={vitalsHistory[0]?.bp || '120/80 mmHg'} />
                  <VitalCard icon={<Activity className="w-5 h-5 text-primary" />} label="Pulse Rate" value={vitalsHistory[0]?.pulse ? `${vitalsHistory[0].pulse} bpm` : '72 bpm'} />
                  <VitalCard icon={<Thermometer className="w-5 h-5 text-amber-500" />} label="Temperature" value={vitalsHistory[0]?.temp || '98.6°F'} />
                  <VitalCard icon={<Scale className="w-5 h-5 text-muted-foreground" />} label="Weight" value={patient.vitals?.weight || '70 kg'} />
                  <VitalCard icon={<Activity className="w-5 h-5 text-blue-500" />} label="SpO2" value={vitalsHistory[0]?.spo2 ? `${vitalsHistory[0].spo2}%` : '98%'} />
                  <VitalCard icon={<Activity className="w-5 h-5 text-purple-500" />} label="Respiratory Rate" value={vitalsHistory[0]?.respRate ? `${vitalsHistory[0].respRate}/min` : '16/min'} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Vitals History</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">BP</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Pulse</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Temp</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">SpO2</th>
                        <th className="text-left p-3 font-medium text-muted-foreground">Resp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vitalsHistory.map((vital) => (
                        <tr key={vital.id} className="border-t border-border">
                          <td className="p-3 text-muted-foreground">{format(vital.date, 'dd MMM, hh:mm a')}</td>
                          <td className="p-3">{vital.bp}</td>
                          <td className="p-3">{vital.pulse}</td>
                          <td className="p-3">{vital.temp}</td>
                          <td className="p-3">{vital.spo2}</td>
                          <td className="p-3">{vital.respRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="p-6 pt-4 m-0 space-y-4">
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />Admission Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoCard label="Admission Date" value={format(patient.admissionDate || patient.stageEnteredAt, 'dd MMM yyyy, hh:mm a')} icon={<Calendar className="w-3.5 h-3.5" />} />
                  <InfoCard label="Current Stage" value={currentStage || 'Unknown'} />
                  <InfoCard label="Time in Stage" value={getTimeInStage(patient.stageEnteredAt)} icon={<Clock className="w-3.5 h-3.5" />} />
                  <InfoCard label="Assigned Doctor" value={patient.doctor || 'Not assigned'} icon={<Stethoscope className="w-3.5 h-3.5" />} />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><ClipboardList className="w-4 h-4 text-primary" />Patient Journey Timeline</h3>
                <div className="space-y-3">
                  {mockHistory.map((item, index) => (
                    <div key={item.id} className="relative pl-6">
                      {index !== mockHistory.length - 1 && (<div className="absolute left-[9px] top-6 w-0.5 h-[calc(100%+12px)] bg-border" />)}
                      <div className="absolute left-0 top-1 w-[18px] h-[18px] rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-primary" /></div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1"><span className="font-medium text-sm">{item.stage}</span><span className="text-xs text-muted-foreground">{format(item.date, 'dd MMM, hh:mm a')}</span></div>
                        <p className="text-sm text-muted-foreground">{item.action}</p>
                        {item.notes && <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>}
                        {item.performedBy && <p className="text-xs text-primary mt-1">By: {item.performedBy}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* Prescriptions Tab */}
            <TabsContent value="prescriptions" className="p-6 pt-4 m-0 space-y-4">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Pill className="w-4 h-4 text-primary" />Current Prescriptions</h3>
                  {!isAddingPrescription && (<Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setIsAddingPrescription(true)}><Pill className="w-3.5 h-3.5 mr-1.5" />Add Prescription</Button>)}
                </div>

                {isAddingPrescription && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm flex items-center gap-2"><Pill className="w-4 h-4 text-primary" />Add New Prescription</h4>
                      <div><label className="text-xs text-muted-foreground mr-2">Prescribed By</label><Input placeholder="e.g., Dr. Smith" value={newPrescriptionDoctor} onChange={(e) => setNewPrescriptionDoctor(e.target.value)} className="h-8 w-40 inline-block" /></div>
                    </div>
                    <div className="space-y-3">
                      {newPrescriptionMedicines.map((med, index) => (
                        <div key={index} className="bg-background rounded-lg p-3 border border-border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Medicine {index + 1}</span>
                            {newPrescriptionMedicines.length > 1 && (<Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => handleRemoveMedicineRow(index)}><Trash2 className="w-3.5 h-3.5" /></Button>)}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-4 sm:col-span-1"><Input placeholder="Medicine name *" value={med.medicine} onChange={(e) => handleMedicineChange(index, 'medicine', e.target.value)} className="h-8 text-xs" /></div>
                            <div><Input placeholder="Dosage" value={med.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} className="h-8 text-xs" /></div>
                            <div>
                              <Select value={med.frequency} onValueChange={(val) => handleMedicineChange(index, 'frequency', val)}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Frequency" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Once daily">Once daily</SelectItem>
                                  <SelectItem value="Twice daily">Twice daily</SelectItem>
                                  <SelectItem value="Thrice daily">Thrice daily</SelectItem>
                                  <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                                  <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                                  <SelectItem value="As needed">As needed</SelectItem>
                                  <SelectItem value="Before meals">Before meals</SelectItem>
                                  <SelectItem value="After meals">After meals</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div><Input placeholder="Duration" value={med.duration} onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)} className="h-8 text-xs" /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" onClick={handleAddMedicineRow} className="mt-3 h-8 text-xs w-full border-dashed"><Plus className="w-3.5 h-3.5 mr-1.5" />Add Another Medicine</Button>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button size="sm" variant="outline" onClick={() => { setIsAddingPrescription(false); setNewPrescriptionMedicines([{ medicine: '', dosage: '', frequency: '', duration: '' }]); setNewPrescriptionDoctor(''); }} className="h-8 text-xs"><X className="w-3.5 h-3.5 mr-1.5" />Cancel</Button>
                      <Button size="sm" onClick={handleAddPrescription} className="h-8 text-xs"><Check className="w-3.5 h-3.5 mr-1.5" />Save Prescription</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="bg-secondary/50 rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2"><Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Active</Badge><span className="text-xs text-muted-foreground">{rx.medicines.length} medicine{rx.medicines.length > 1 ? 's' : ''}</span></div>
                        <span className="text-xs text-muted-foreground">{format(rx.date, 'dd MMM yyyy')}</span>
                      </div>
                      <div className="space-y-2">
                        {rx.medicines.map((med, idx) => (<div key={idx} className="bg-background/50 rounded p-2"><h4 className="font-medium text-sm">{med.medicine}</h4><p className="text-xs text-muted-foreground">{med.dosage} • {med.frequency} • {med.duration}</p></div>))}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border"><span className="text-xs text-muted-foreground">Prescribed by {rx.prescribedBy}</span></div>
                    </div>
                  ))}
                </div>
              </section>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="p-6 pt-4 m-0 space-y-4">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><FolderOpen className="w-4 h-4 text-primary" />Medical Documents</h3>
                  {!isUploadingDocument && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setIsUploadingDocument(true)}>
                      <Upload className="w-3.5 h-3.5 mr-1.5" />Upload Document
                    </Button>
                  )}
                </div>

                {isUploadingDocument && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-primary" />Upload New Document
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Document Name *</label>
                          <Input 
                            placeholder="e.g., Blood Test Report" 
                            value={newDocument.name} 
                            onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })} 
                            className="h-9" 
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Document Type</label>
                          <Select value={newDocument.type} onValueChange={(val) => setNewDocument({ ...newDocument, type: val })}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              {documentTypes.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Select File *</label>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="file" 
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="h-9 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                          {newDocument.file && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {newDocument.size}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Accepted: PDF, JPG, PNG, DOC, DOCX</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => { setIsUploadingDocument(false); setNewDocument({ name: '', type: '', file: null }); }} 
                        className="h-8 text-xs"
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />Cancel
                      </Button>
                      <Button size="sm" onClick={handleUploadDocument} className="h-8 text-xs">
                        <Check className="w-3.5 h-3.5 mr-1.5" />Upload
                      </Button>
                    </div>
                  </div>
                )}

                {documents.length === 0 ? (
                  <div className="bg-secondary/50 rounded-lg p-6 text-center">
                    <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-secondary/50 rounded-lg p-3 flex items-center justify-between border border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{format(doc.date, 'dd MMM')}</span>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </TabsContent>

            {/* Clinical Tab */}
            <TabsContent value="clinical" className="p-6 pt-4 m-0 space-y-4">
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Stethoscope className="w-4 h-4 text-primary" />Clinical Information</h3>
                <div className="space-y-3 text-sm">
                  <InfoCard label="Chief Complaint" value={patient.symptoms || 'Persistent fever and body ache for 3 days'} />
                  <InfoCard label="Diagnosis" value={patient.diagnosis || 'Viral fever with upper respiratory infection'} />
                  <InfoCard label="Treatment Plan" value="Symptomatic treatment with antipyretics and antibiotics if secondary infection suspected" />
                </div>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Medical History</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-secondary/50 rounded-lg p-3"><p className="font-medium">Chronic Conditions</p><p className="text-muted-foreground mt-1">Hypertension (controlled), Type 2 Diabetes</p></div>
                  <div className="bg-secondary/50 rounded-lg p-3"><p className="font-medium">Past Surgeries</p><p className="text-muted-foreground mt-1">Appendectomy (2018)</p></div>
                  <div className="bg-secondary/50 rounded-lg p-3"><p className="font-medium">Family History</p><p className="text-muted-foreground mt-1">Father - Cardiac disease, Mother - Diabetes</p></div>
                </div>
              </section>
            </TabsContent>

            {/* Allergies Tab */}
            <TabsContent value="allergies" className="p-6 pt-4 m-0 space-y-4">
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Known Allergies</h3>
                  {!isAddingAllergy && (<Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setIsAddingAllergy(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Add Allergy</Button>)}
                </div>

                {isAddingAllergy && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-sm mb-3 flex items-center gap-2 text-amber-800"><AlertTriangle className="w-4 h-4 text-amber-600" />Add New Allergy</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className="text-xs text-amber-700 mb-1 block">Allergen *</label><Input placeholder="e.g., Penicillin" value={newAllergy.allergen} onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })} className="h-9 bg-white" /></div>
                      <div><label className="text-xs text-amber-700 mb-1 block">Severity</label>
                        <Select value={newAllergy.severity} onValueChange={(val) => setNewAllergy({ ...newAllergy, severity: val })}>
                          <SelectTrigger className="h-9 bg-white"><SelectValue placeholder="Select severity" /></SelectTrigger>
                          <SelectContent><SelectItem value="Mild">Mild</SelectItem><SelectItem value="Moderate">Moderate</SelectItem><SelectItem value="Severe">Severe</SelectItem><SelectItem value="Life-threatening">Life-threatening</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div><label className="text-xs text-amber-700 mb-1 block">Reaction</label><Input placeholder="e.g., Skin rash, hives" value={newAllergy.reaction} onChange={(e) => setNewAllergy({ ...newAllergy, reaction: e.target.value })} className="h-9 bg-white" /></div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button size="sm" variant="outline" onClick={() => { setIsAddingAllergy(false); setNewAllergy({ allergen: '', severity: '', reaction: '' }); }} className="h-8 text-xs"><X className="w-3.5 h-3.5 mr-1.5" />Cancel</Button>
                      <Button size="sm" onClick={handleAddAllergy} className="h-8 text-xs bg-amber-600 hover:bg-amber-700"><Check className="w-3.5 h-3.5 mr-1.5" />Add Allergy</Button>
                    </div>
                  </div>
                )}

                {allergies.length === 0 ? (
                  <div className="bg-secondary/50 rounded-lg p-6 text-center"><AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">No known allergies recorded</p></div>
                ) : (
                  <div className="space-y-3">
                    {allergies.map((allergy) => (
                      <div key={allergy.id} className={`rounded-lg p-4 border ${allergy.severity === 'Severe' || allergy.severity === 'Life-threatening' ? 'bg-destructive/10 border-destructive/30' : allergy.severity === 'Moderate' ? 'bg-amber-50 border-amber-200' : 'bg-secondary/50 border-border'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${allergy.severity === 'Severe' || allergy.severity === 'Life-threatening' ? 'text-destructive' : allergy.severity === 'Moderate' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                            <div><h4 className="font-medium text-sm">{allergy.allergen}</h4><p className="text-xs text-muted-foreground mt-1">{allergy.reaction}</p></div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${allergy.severity === 'Severe' || allergy.severity === 'Life-threatening' ? 'bg-destructive/10 text-destructive border-destructive/30' : allergy.severity === 'Moderate' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-secondary text-secondary-foreground'}`}>{allergy.severity}</Badge>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteAllergy(allergy.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border/50"><span className="text-xs text-muted-foreground">Added: {format(allergy.addedDate, 'dd MMM yyyy')}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div><p className="font-medium text-amber-800 text-sm">Important Warning</p><p className="text-xs text-amber-700 mt-1">Always verify patient allergies before prescribing any medication. Cross-reference with drug interactions and consult specialist if needed.</p></div>
                  </div>
                </div>
              </section>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function InfoCard({ label, value, icon }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium mt-0.5 flex items-center gap-1.5">{icon}{value}</p>
    </div>
  );
}

function EditableInfoCard({ label, value, icon, isEditing, onChange, type = 'text' }) {
  if (isEditing) {
    return (
      <div className="bg-secondary/50 rounded-lg p-3">
        <p className="text-muted-foreground text-xs mb-1.5">{label}</p>
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-8 text-sm" />
      </div>
    );
  }
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium mt-0.5 flex items-center gap-1.5">{icon}{value}</p>
    </div>
  );
}

function EditableSelectCard({ label, value, icon, isEditing, onChange, options }) {
  if (isEditing) {
    return (
      <div className="bg-secondary/50 rounded-lg p-3">
        <p className="text-muted-foreground text-xs mb-1.5">{label}</p>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>{options.map((option) => (<SelectItem key={option} value={option}>{option}</SelectItem>))}</SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div className="bg-secondary/50 rounded-lg p-3">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium mt-0.5 flex items-center gap-1.5">{icon}{value}</p>
    </div>
  );
}

function VitalCard({ icon, label, value }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3">
      {icon}
      <div><p className="text-muted-foreground text-xs">{label}</p><p className="font-semibold">{value}</p></div>
    </div>
  );
}
