import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Heart, Thermometer, Droplets, Activity, Scale, Ruler,
    CreditCard, DollarSign, Shield, Calendar,
    FileText, Image, Pill, FlaskConical, ClipboardCheck,
    Plus, Save, X, Trash2, Edit2, Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useRef } from 'react';
import { toast } from 'sonner';



export function PatientDetailTabs({ patient, onUpdatePatient }) {
    const [editingVitals, setEditingVitals] = useState(false);
    const [editingInsurance, setEditingInsurance] = useState(false);
    const [addingAppointment, setAddingAppointment] = useState(false);
    const [addingDocument, setAddingDocument] = useState(false);

    const [vitalsForm, setVitalsForm] = useState(patient.vitals || {});
    const [insuranceForm, setInsuranceForm] = useState(patient.insurance || {});
    const [appointmentForm, setAppointmentForm] = useState({
        type: 'consultation',
        status: 'scheduled',
    });
    const [documentForm, setDocumentForm] = useState({
        type: 'report',
    });
    const fileInputRef = useRef(null);

    const paymentStatusColors = {
        'pending': 'bg-warning/10 text-warning',
        'partial': 'bg-info/10 text-info',
        'paid': 'bg-success/10 text-success',
        'insurance-claimed': 'bg-primary/10 text-primary',
    };

    const documentTypeIcons = {
        'lab-result': FlaskConical,
        'prescription': Pill,
        'imaging': Image,
        'report': FileText,
        'consent': ClipboardCheck,
        'other': FileText,
    };

    const appointmentStatusColors = {
        'scheduled': 'bg-info/10 text-info',
        'completed': 'bg-success/10 text-success',
        'cancelled': 'bg-destructive/10 text-destructive',
        'no-show': 'bg-warning/10 text-warning',
    };

    const handleSaveVitals = () => {
        onUpdatePatient?.({ vitals: vitalsForm });
        setEditingVitals(false);
        toast.success('Vitals updated successfully');
    };

    const handleSaveInsurance = () => {
        onUpdatePatient?.({ insurance: insuranceForm });
        setEditingInsurance(false);
        toast.success('Insurance information updated successfully');
    };

    const handleAddAppointment = () => {
        if (!appointmentForm.date || !appointmentForm.time) {
            toast.error('Please fill in date and time');
            return;
        }
        const newAppointment = {
            id: `apt-${Date.now()}`,
            date: appointmentForm.date,
            time: appointmentForm.time,
            type: appointmentForm.type,
            status: appointmentForm.status,
            doctor: appointmentForm.doctor,
            notes: appointmentForm.notes,
        };
        const appointments = [...(patient.appointments || []), newAppointment];
        onUpdatePatient?.({ appointments });
        setAddingAppointment(false);
        setAppointmentForm({ type: 'consultation', status: 'scheduled' });
        toast.success('Appointment added successfully');
    };

    const handleDeleteAppointment = (aptId) => {
        const appointments = (patient.appointments || []).filter(a => a.id !== aptId);
        onUpdatePatient?.({ appointments });
        toast.success('Appointment deleted');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocumentForm({
                ...documentForm,
                file,
                name: documentForm.name || file.name.replace(/\.[^/.]+$/, ''),
            });
        }
    };

    const handleAddDocument = () => {
        if (!documentForm.file && !documentForm.name) {
            toast.error('Please select a file or enter document name');
            return;
        }
        const fileName = documentForm.name || documentForm.file?.name || 'Untitled';
        const fileUrl = documentForm.file ? URL.createObjectURL(documentForm.file) : '#';

        const newDocument = {
            id: `doc-${Date.now()}`,
            name: fileName,
            type: documentForm.type,
            url: fileUrl,
            uploadedAt: new Date().toISOString(),
            uploadedBy: 'Current User',
        };
        const documents = [...(patient.documents || []), newDocument];
        onUpdatePatient?.({ documents });
        setAddingDocument(false);
        setDocumentForm({ type: 'report' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        toast.success('Document added successfully');
    };

    const handleDeleteDocument = (docId) => {
        const documents = (patient.documents || []).filter(d => d.id !== docId);
        onUpdatePatient?.({ documents });
        toast.success('Document deleted');
    };

    return (
        <Tabs defaultValue="vitals" className="w-full">
            <TabsList className="w-full justify-start bg-muted/50 p-1">
                <TabsTrigger value="vitals" className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Vitals
                </TabsTrigger>
                <TabsTrigger value="insurance" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Insurance
                </TabsTrigger>
                <TabsTrigger value="appointments" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Appointments
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documents
                </TabsTrigger>
            </TabsList>

            {/* Vitals Tab */}
            <TabsContent value="vitals" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-foreground">Patient Vitals</h4>
                    {!editingVitals ? (
                        <Button variant="outline" size="sm" onClick={() => setEditingVitals(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Vitals
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingVitals(false)}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveVitals}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    )}
                </div>

                {editingVitals ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Blood Pressure (mmHg)</Label>
                            <Input
                                placeholder="e.g., 120/80"
                                value={vitalsForm.bloodPressure || ''}
                                onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Heart Rate (bpm)</Label>
                            <Input
                                type="number"
                                placeholder="e.g., 72"
                                value={vitalsForm.heartRate || ''}
                                onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Temperature (°F)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="e.g., 98.6"
                                value={vitalsForm.temperature || ''}
                                onChange={(e) => setVitalsForm({ ...vitalsForm, temperature: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Oxygen Saturation (%)</Label>
                            <Input
                                type="number"
                                placeholder="e.g., 98"
                                value={vitalsForm.oxygenSaturation || ''}
                                onChange={(e) => setVitalsForm({ ...vitalsForm, oxygenSaturation: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                placeholder="e.g., 70"
                                value={vitalsForm.weight || ''}
                                onChange={(e) => setVitalsForm({ ...vitalsForm, weight: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Height (cm)</Label>
                            <Input
                                type="number"
                                placeholder="e.g., 170"
                                value={vitalsForm.height || ''}
                                onChange={(e) => setVitalsForm({ ...vitalsForm, height: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                ) : patient.vitals ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {patient.vitals.bloodPressure && (
                            <VitalCard icon={Activity} label="Blood Pressure" value={patient.vitals.bloodPressure} unit="mmHg" />
                        )}
                        {patient.vitals.heartRate && (
                            <VitalCard icon={Heart} label="Heart Rate" value={patient.vitals.heartRate.toString()} unit="bpm" color="text-destructive" />
                        )}
                        {patient.vitals.temperature && (
                            <VitalCard icon={Thermometer} label="Temperature" value={patient.vitals.temperature.toFixed(1)} unit="°F" color={patient.vitals.temperature > 100 ? 'text-warning' : undefined} />
                        )}
                        {patient.vitals.oxygenSaturation && (
                            <VitalCard icon={Droplets} label="SpO2" value={patient.vitals.oxygenSaturation.toString()} unit="%" color={patient.vitals.oxygenSaturation < 95 ? 'text-warning' : 'text-success'} />
                        )}
                        {patient.vitals.weight && (
                            <VitalCard icon={Scale} label="Weight" value={patient.vitals.weight.toString()} unit="kg" />
                        )}
                        {patient.vitals.height && (
                            <VitalCard icon={Ruler} label="Height" value={patient.vitals.height.toString()} unit="cm" />
                        )}
                    </div>
                ) : (
                    <EmptyState message="No vitals recorded" />
                )}

                {patient.allergies && patient.allergies.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-foreground mb-2">Allergies</h4>
                        <div className="flex flex-wrap gap-2">
                            {patient.allergies.map((allergy, i) => (
                                <Badge key={i} variant="destructive" className="bg-destructive/10 text-destructive">
                                    {allergy}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
                {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-sm font-medium text-foreground mb-2">Medical History</h4>
                        <div className="flex flex-wrap gap-2">
                            {patient.medicalHistory.map((condition, i) => (
                                <Badge key={i} variant="secondary">
                                    {condition}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </TabsContent>

            {/* Insurance Tab */}
            <TabsContent value="insurance" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-foreground">Insurance & Billing</h4>
                    {!editingInsurance ? (
                        <Button variant="outline" size="sm" onClick={() => setEditingInsurance(true)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Insurance
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingInsurance(false)}>
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSaveInsurance}>
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    )}
                </div>

                {editingInsurance ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Insurance Provider</Label>
                                <Input
                                    placeholder="e.g., Star Health"
                                    value={insuranceForm.provider || ''}
                                    onChange={(e) => setInsuranceForm({ ...insuranceForm, provider: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Policy Number</Label>
                                <Input
                                    placeholder="e.g., POL-123456"
                                    value={insuranceForm.policyNumber || ''}
                                    onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Group Number</Label>
                                <Input
                                    placeholder="e.g., GRP-789"
                                    value={insuranceForm.groupNumber || ''}
                                    onChange={(e) => setInsuranceForm({ ...insuranceForm, groupNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Valid Until</Label>
                                <Input
                                    type="date"
                                    value={insuranceForm.validUntil ? insuranceForm.validUntil.split('T')[0] : ''}
                                    onChange={(e) => setInsuranceForm({ ...insuranceForm, validUntil: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Estimated Cost (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 50000"
                                    value={insuranceForm.estimatedCost || ''}
                                    onChange={(e) => setInsuranceForm({ ...insuranceForm, estimatedCost: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Paid Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g., 25000"
                                    value={insuranceForm.paidAmount || ''}
                                    onChange={(e) => setInsuranceForm({ ...insuranceForm, paidAmount: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Status</Label>
                                <Select
                                    value={insuranceForm.paymentStatus || 'pending'}
                                    onValueChange={(value) => setInsuranceForm({ ...insuranceForm, paymentStatus })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="partial">Partial</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="insurance-claimed">Insurance Claimed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                ) : patient.insurance ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {patient.insurance.provider && (
                                <InfoCard icon={Shield} label="Provider" value={patient.insurance.provider} />
                            )}
                            {patient.insurance.policyNumber && (
                                <InfoCard icon={CreditCard} label="Policy Number" value={patient.insurance.policyNumber} />
                            )}
                            {patient.insurance.groupNumber && (
                                <InfoCard icon={CreditCard} label="Group Number" value={patient.insurance.groupNumber} />
                            )}
                            {patient.insurance.validUntil && (
                                <InfoCard icon={Calendar} label="Valid Until" value={format(new Date(patient.insurance.validUntil), 'MMM dd, yyyy')} />
                            )}
                        </div>
                        <div className="bg-muted/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-foreground">Billing Summary</h4>
                                {patient.insurance.paymentStatus && (
                                    <Badge className={paymentStatusColors[patient.insurance.paymentStatus]}>
                                        {patient.insurance.paymentStatus.replace('-', ' ')}
                                    </Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {patient.insurance.estimatedCost !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Estimated Cost</p>
                                            <p className="font-medium text-foreground">₹{patient.insurance.estimatedCost.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                                {patient.insurance.paidAmount !== undefined && (
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-success" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Paid Amount</p>
                                            <p className="font-medium text-success">₹{patient.insurance.paidAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <EmptyState message="No insurance information" />
                )}
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-foreground">Appointments</h4>
                    {!addingAppointment && (
                        <Button variant="outline" size="sm" onClick={() => setAddingAppointment(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Appointment
                        </Button>
                    )}
                </div>

                {addingAppointment && (
                    <Card className="mb-4 border-primary">
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date *</Label>
                                    <Input
                                        type="date"
                                        value={appointmentForm.date || ''}
                                        onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time *</Label>
                                    <Input
                                        type="time"
                                        value={appointmentForm.time || ''}
                                        onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={appointmentForm.type || 'consultation'}
                                        onValueChange={(value) => setAppointmentForm({ ...appointmentForm, type })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="consultation">Consultation</SelectItem>
                                            <SelectItem value="follow-up">Follow-up</SelectItem>
                                            <SelectItem value="procedure">Procedure</SelectItem>
                                            <SelectItem value="surgery">Surgery</SelectItem>
                                            <SelectItem value="therapy">Therapy</SelectItem>
                                            <SelectItem value="lab-test">Lab Test</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Doctor</Label>
                                    <Input
                                        placeholder="e.g., Dr. Sharma"
                                        value={appointmentForm.doctor || ''}
                                        onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Notes</Label>
                                <Input
                                    placeholder="Any additional notes..."
                                    value={appointmentForm.notes || ''}
                                    onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => setAddingAppointment(false)}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleAddAppointment}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Appointment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {patient.appointments && patient.appointments.length > 0 ? (
                    <ScrollArea className="h-[200px]">
                        <div className="space-y-3">
                            {patient.appointments.map((apt) => (
                                <Card key={apt.id} className="border-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-primary" />
                                                    <span className="font-medium text-foreground">
                                                        {format(new Date(apt.date), 'MMM dd, yyyy')} at {apt.time}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 capitalize">
                                                    {apt.type.replace('-', ' ')}
                                                </p>
                                                {apt.doctor && (
                                                    <p className="text-sm text-muted-foreground">
                                                        with {apt.doctor}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={appointmentStatusColors[apt.status]}>
                                                    {apt.status}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteAppointment(apt.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {apt.notes && (
                                            <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                                                {apt.notes}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <EmptyState message="No appointments scheduled" />
                )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-foreground">Documents</h4>
                    {!addingDocument && (
                        <Button variant="outline" size="sm" onClick={() => setAddingDocument(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Document
                        </Button>
                    )}
                </div>

                {addingDocument && (
                    <Card className="mb-4 border-primary">
                        <CardContent className="p-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Document Name *</Label>
                                    <Input
                                        placeholder="e.g., Blood Test Results"
                                        value={documentForm.name || ''}
                                        onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select
                                        value={documentForm.type || 'report'}
                                        onValueChange={(value) => setDocumentForm({ ...documentForm, type })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lab-result">Lab Result</SelectItem>
                                            <SelectItem value="prescription">Prescription</SelectItem>
                                            <SelectItem value="imaging">Imaging</SelectItem>
                                            <SelectItem value="report">Report</SelectItem>
                                            <SelectItem value="consent">Consent</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Select File *</Label>
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                        documentForm.file
                                            ? "border-primary bg-primary/5"
                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                    )}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.txt"
                                        onChange={handleFileSelect}
                                    />
                                    {documentForm.file ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <span className="text-sm font-medium text-foreground">{documentForm.file.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDocumentForm({ ...documentForm, file: undefined });
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-8 h-8 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Click to select a file
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                PDF, DOC, Images, Excel
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => setAddingDocument(false)}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleAddDocument}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Document
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {patient.documents && patient.documents.length > 0 ? (
                    <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                            {patient.documents.map((doc) => {
                                const DocIcon = documentTypeIcons[doc.type] || FileText;
                                return (
                                    <div
                                        key={doc.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <DocIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm truncate">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                                                {doc.uploadedBy && ` • ${doc.uploadedBy}`}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="capitalize text-xs">
                                            {doc.type.replace('-', ' ')}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteDocument(doc.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                ) : (
                    <EmptyState message="No documents uploaded" />
                )}
            </TabsContent>
        </Tabs>
    );
}

function VitalCard({
    icon: Icon,
    label,
    value,
    unit,
    color
}) {
    return (
        <Card className="border-border">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className={cn("w-5 h-5", color || "text-primary")} />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className={cn("text-lg font-semibold", color || "text-foreground")}>
                            {value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function InfoCard({
    icon: Icon,
    label,
    value
}) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">{message}</p>
        </div>
    );
}
