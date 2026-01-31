import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockPatients } from '../../_hooks/mockPatients';
import { getAge, getInitials } from '@/utils/functions';
import { useAction } from '@/hooks/use-action';
import { addExistingUser } from '../../../_action/add-existing-user';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import UserSelect from '../../../../../(misc)/_components/UserSearch';


//Mailer
//https://lovable.dev/projects/828715c6-096f-451c-b56e-40e5a23454b7?magic_link=mc_ba8226e8-b3ea-4a87-8111-8121588fdfc9


export function AddPatientModal({ open, onClose, onAddPatient, existingPatients = [], patients = [] }) {
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('existing');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedWorkflowType, setSelectedWorkflowType] = useState('');
    //const [existingUser, setExistingUser] = useState = ({})
    const { data: session } = useSession()

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        gender: '',
        phone: '',
        workflowType: '',
        assignedDoctor: '',
        department: '',
        diagnosis: '',
        notes: '',
        room: '',
        bed: '',
    });

    const [errors, setErrors] = useState({});

    // Get all available patients (from mock data, excluding ones already in workflow)
    const existingPatientIds = new Set(patients?.map(p => p.id));
    const availablePatients = patients?.filter(p => !existingPatientIds?.has(p.id));

    // Filter patients based on search
    const filteredPatients = patients?.filter(patient =>
        patient?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient?.uuid?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient?.phone?.includes(searchQuery)
    );


    //console.log('availablePatients', filteredPatients)

    const generateMRN = () => {
        const prefix = formData.workflowType === 'IPD' ? 'IPD' : 'OPD';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}-${timestamp}-${random}`;
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.age || parseInt(formData.age) <= 0) newErrors.age = 'Valid age is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.workflowType) newErrors.workflowType = 'Workflow type is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmitNew = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const now = new Date().toISOString();
        const initialStage = formData.workflowType === 'OPD' ? 'registration' : 'admission-request';

        const newPatient = {
            id: crypto.randomUUID(),
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            mrn: generateMRN(),
            phone: formData.phone,
            workflowType: formData.workflowType,
            currentStage: initialStage,
            status: 'pending',
            admissionDate: now,
            assignedDoctor: formData.assignedDoctor || undefined,
            department: formData.department || undefined,
            room: formData.room || undefined,
            bed: formData.bed || undefined,
            diagnosis: formData.diagnosis || undefined,
            notes: formData.notes || undefined,
            stageHistory: [
                {
                    stage: initialStage,
                    enteredAt: now,
                },
            ],
        };

        onAddPatient(newPatient);
        handleClose();
    };

    const { execute: existingUseradd } = useAction(addExistingUser, {
        onSuccess: (data) => {
            setLoading(false);
            toast.success('New flow created succesfully', { id: 'new-flow-existing' })
        },
        onError: (error) => {
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })

    const handleAddExisting = async () => {
        console.log('@selectedPatient', selectedPatient, selectedWorkflowType)
        setLoading(true);
        toast.loading('Please wait creating new flow ....', { id: 'new-flow-existing' })
        await existingUseradd({
            userId: session?.user?.userId,
            patientId: selectedPatient.id,
            workflowType: selectedWorkflowType
        })




        // if (!selectedPatient || !selectedWorkflowType) return;

        // const now = new Date().toISOString();
        // const initialStage = selectedWorkflowType === 'OPD' ? 'registration' : 'admission-request';

        // const patientToAdd = {
        //     ...selectedPatient,
        //     id: crypto.randomUUID(), // New ID for this workflow instance
        //     workflowType: selectedWorkflowType,
        //     currentStage: initialStage,
        //     status: 'pending',
        //     admissionDate: now,
        //     stageHistory: [
        //         {
        //             stage: initialStage,
        //             enteredAt: now,
        //         },
        //     ],
        // };

        // onAddPatient(patientToAdd);
        // handleClose();
    };

    const handleClose = () => {
        setFormData({
            name: '',
            age: '',
            gender: '',
            phone: '',
            workflowType: '',
            assignedDoctor: '',
            department: '',
            diagnosis: '',
            notes: '',
            room: '',
            bed: '',
        });
        setErrors({});
        setActiveTab('existing');
        setSearchQuery('');
        setSelectedPatient(null);
        setSelectedWorkflowType('');
        onClose();
    };

    return (
        <Sheet open={open} onOpenChange={handleClose}>
            <SheetContent className="w-full bg-transparent border-0 p-2 min-w-[620px]">
                <div className='bg-card rounded-md h-full '>
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2 ">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <UserPlus className="w-5 h-5 text-primary" />
                            </div>
                            Add Patient to Workflow
                        </SheetTitle>
                    </SheetHeader>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="p-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="existing" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Select Existing
                            </TabsTrigger>
                            <TabsTrigger value="new" className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Create New
                            </TabsTrigger>
                        </TabsList>

                        {/* Existing Patient Tab */}
                        <TabsContent value="existing" className="space-y-4 mt-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, MRN,UUID, or phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>


                            <UserSelect data={patients} />

                            {/* Select patient */}
                            <Select>
                                <SelectTrigger className='h-12'>
                                    <SelectValue placeholder="Select a Patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredPatients?.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            <div className='flex flex-row items-center gap-2'>
                                                <Avatar className='rounded-md h-8 w-8'>
                                                    <AvatarImage src={user.avatar} />
                                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                                </Avatar>
                                                <div className='flex flex-col items-start'>
                                                    <span>{user?.displayName}</span>
                                                    <span className='text-xs text-muted-foreground'>{user.email}</span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Patient List */}
                            <ScrollArea className="h-[400px] rounded-lg border">
                                <div className="p-2 space-y-2">
                                    {filteredPatients?.length === 0 ? (
                                        <div className="text-center justify-center py-8 text-muted-foreground">
                                            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                                            <p>No patients found</p>
                                        </div>
                                    ) : (
                                        filteredPatients?.map((patient) => (
                                            <div
                                                key={patient.id}
                                                onClick={() => setSelectedPatient(patient)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPatient?.id === patient.id
                                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm text-foreground">{patient.displayName}</p>
                                                        <p className="text-sm text-muted-foreground text-xs">
                                                            {patient.mrn || 'NA'} • {getAge(patient.dob) || 'NA'} yrs • {patient.gender || 'NA'}
                                                        </p>
                                                    </div>
                                                    {/* <div className="text-right text-sm text-muted-foreground">
                                                        <p>{patient.phone || 'NA'}</p>
                                                        {patient.department && <p>{patient.department}</p>}
                                                    </div> */}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Workflow Type Selection for Existing Patient */}
                            {selectedPatient && (
                                <div className="space-y-2 p-4 rounded-lg bg-muted/50 border">
                                    <Label>Select Workflow Type *</Label>
                                    <Select
                                        value={selectedWorkflowType}
                                        onValueChange={(value) => setSelectedWorkflowType(value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose workflow type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPD">OPD - Outpatient</SelectItem>
                                            <SelectItem value="IPD">IPD - Inpatient</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <SheetFooter className="flex flex-row items-center justify-end">
                                <Button variant="outline" size='sm' onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant='save'
                                    onClick={handleAddExisting}
                                    disabled={!selectedPatient || !selectedWorkflowType}
                                    size='sm'
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add to Workflow
                                </Button>
                            </SheetFooter>
                        </TabsContent>

                        {/* New Patient Tab */}
                        <TabsContent value="new" className="mt-4 p-2">
                            <form onSubmit={handleSubmitNew} className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Enter patient name"
                                                className={errors.name ? 'border-destructive' : ''}
                                            />
                                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="Enter phone number"
                                                className={errors.phone ? 'border-destructive' : ''}
                                            />
                                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="age">Age *</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                min="0"
                                                max="150"
                                                value={formData.age}
                                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                placeholder="Enter age"
                                                className={errors.age ? 'border-destructive' : ''}
                                            />
                                            {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Gender *</Label>
                                            <Select
                                                value={formData.gender}
                                                onValueChange={(value) => setFormData({ ...formData, gender })}
                                            >
                                                <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Workflow Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Workflow Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="workflowType">Workflow Type *</Label>
                                            <Select
                                                value={formData.workflowType}
                                                onValueChange={(value) => setFormData({ ...formData, workflowType })}
                                            >
                                                <SelectTrigger className={errors.workflowType ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Select workflow" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="OPD">OPD - Outpatient</SelectItem>
                                                    <SelectItem value="IPD">IPD - Inpatient</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.workflowType && <p className="text-xs text-destructive">{errors.workflowType}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="department">Department</Label>
                                            <Select
                                                value={formData.department}
                                                onValueChange={(value) => setFormData({ ...formData, department: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                                                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                                                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                                                    <SelectItem value="Neurology">Neurology</SelectItem>
                                                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                                                    <SelectItem value="Surgery">Surgery</SelectItem>
                                                    <SelectItem value="Emergency">Emergency</SelectItem>
                                                    <SelectItem value="Oncology">Oncology</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="assignedDoctor">Assigned Doctor</Label>
                                            <Input
                                                id="assignedDoctor"
                                                value={formData.assignedDoctor}
                                                onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                                                placeholder="Enter doctor name"
                                            />
                                        </div>

                                        {formData.workflowType === 'IPD' && (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="room">Room Number</Label>
                                                    <Input
                                                        id="room"
                                                        value={formData.room}
                                                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                                        placeholder="Enter room number"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="bed">Bed Number</Label>
                                                    <Input
                                                        id="bed"
                                                        value={formData.bed}
                                                        onChange={(e) => setFormData({ ...formData, bed: e.target.value })}
                                                        placeholder="Enter bed number"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Medical Information */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                                        Medical Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="diagnosis">Initial Diagnosis</Label>
                                            <Input
                                                id="diagnosis"
                                                value={formData.diagnosis}
                                                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                                placeholder="Enter initial diagnosis"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                                id="notes"
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                placeholder="Enter any additional notes"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <SheetFooter className="flex flex-row items-center justify-end">
                                    <Button type="button" variant="outline" size='sm' onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" size='sm' className="gradient-primary text-primary-foreground">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Add Patient
                                    </Button>
                                </SheetFooter>
                            </form>
                        </TabsContent>
                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
