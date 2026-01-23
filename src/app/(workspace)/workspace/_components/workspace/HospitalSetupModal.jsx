import React, { useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Building2,
    Users,
    ShieldCheck,
    BedDouble,
    CheckCircle2,
    Upload,
    MapPin,
    Phone,
    Mail,
    Globe,
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    X
} from 'lucide-react';

const steps = [
    { id: 1, title: 'Hospital', subtitle: 'Basic info', icon: Building2 },
    { id: 2, title: 'Departments', subtitle: 'Add departments', icon: Users },
    { id: 3, title: 'Admin Setup', subtitle: 'Roles & permissions', icon: ShieldCheck },
    { id: 4, title: 'Rooms & Beds', subtitle: 'Configure spaces', icon: BedDouble },
    { id: 5, title: 'Review', subtitle: 'Confirm setup', icon: CheckCircle2 },
];

const hospitalTypes = [
    'General Hospital',
    'Specialty Hospital',
    'Multi-Specialty Hospital',
    'Super Specialty Hospital',
    'Teaching Hospital',
    'Clinic',
    'Nursing Home',
    'Diagnostic Center',
];

const defaultDepartments = [
    'General Medicine',
    'Surgery',
    'Pediatrics',
    'Gynecology',
    'Orthopedics',
    'Cardiology',
    'Neurology',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Radiology',
    'Pathology',
    'Emergency',
    'ICU',
    'Pharmacy',
];

const adminRoles = [
    { id: 'super_admin', name: 'Super Admin', description: 'Full system access' },
    { id: 'admin', name: 'Admin', description: 'Administrative access' },
    { id: 'doctor', name: 'Doctor', description: 'Clinical access' },
    { id: 'nurse', name: 'Nurse', description: 'Nursing access' },
    { id: 'receptionist', name: 'Receptionist', description: 'Front desk access' },
    { id: 'pharmacist', name: 'Pharmacist', description: 'Pharmacy access' },
    { id: 'lab_tech', name: 'Lab Technician', description: 'Laboratory access' },
    { id: 'accountant', name: 'Accountant', description: 'Billing & finance access' },
];

const HospitalSetupModal = ({ isOpen, onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const fileInputRef = useRef(null);

    // Step 1: Hospital Info
    const [hospitalData, setHospitalData] = useState({
        logo: null,
        logoPreview: null,
        name: '',
        type: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
    });

    // Step 2: Departments
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [customDepartment, setCustomDepartment] = useState('');

    // Step 3: Admin Setup
    const [adminData, setAdminData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'super_admin',
    });
    const [enabledRoles, setEnabledRoles] = useState(['super_admin', 'admin', 'doctor', 'nurse', 'receptionist']);

    // Step 4: Rooms & Beds
    const [rooms, setRooms] = useState([
        { id: 1, name: 'General Ward', type: 'ward', beds: 10 },
        { id: 2, name: 'Private Room', type: 'private', beds: 5 },
        { id: 3, name: 'ICU', type: 'icu', beds: 4 },
    ]);

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setHospitalData(prev => ({
                    ...prev,
                    logo: file,
                    logoPreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDepartmentToggle = (dept) => {
        setSelectedDepartments(prev =>
            prev.includes(dept)
                ? prev.filter(d => d !== dept)
                : [...prev, dept]
        );
    };

    const addCustomDepartment = () => {
        if (customDepartment.trim() && !selectedDepartments.includes(customDepartment.trim())) {
            setSelectedDepartments(prev => [...prev, customDepartment.trim()]);
            setCustomDepartment('');
        }
    };

    const handleRoleToggle = (roleId) => {
        if (roleId === 'super_admin') return; // Can't disable super admin
        setEnabledRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(r => r !== roleId)
                : [...prev, roleId]
        );
    };

    const addRoom = () => {
        setRooms(prev => [...prev, {
            id: Date.now(),
            name: '',
            type: 'ward',
            beds: 1
        }]);
    };

    const updateRoom = (id, field, value) => {
        setRooms(prev => prev.map(room =>
            room.id === id ? { ...room, [field]: value } : room
        ));
    };

    const removeRoom = (id) => {
        setRooms(prev => prev.filter(room => room.id !== id));
    };

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Complete setup
            onComplete?.({
                hospital: hospitalData,
                departments: selectedDepartments,
                admin: adminData,
                roles: enabledRoles,
                rooms: rooms,
            });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        {/* Logo Upload */}
                        <div>
                            <Label className="flex items-center gap-2 mb-3">
                                <Upload className="w-4 h-4 text-primary" />
                                Hospital Logo
                            </Label>
                            <div className="flex items-start gap-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-muted/30"
                                >
                                    {hospitalData.logoPreview ? (
                                        <img src={hospitalData.logoPreview} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                                            <span className="text-xs text-muted-foreground">Upload</span>
                                        </>
                                    )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Upload your hospital logo.</p>
                                    <p>Recommended: 200×200px, PNG or JPG, max 5MB</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Hospital Name & Type */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-primary" />
                                    Hospital Name *
                                </Label>
                                <Input
                                    placeholder="Enter hospital name"
                                    value={hospitalData.name}
                                    onChange={(e) => setHospitalData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hospital Type *</Label>
                                <Select
                                    value={hospitalData.type}
                                    onValueChange={(value) => setHospitalData(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hospitalTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Address *
                            </Label>
                            <Input
                                placeholder="Street address"
                                value={hospitalData.address}
                                onChange={(e) => setHospitalData(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>

                        {/* City, State, ZIP */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>City *</Label>
                                <Input
                                    placeholder="City"
                                    value={hospitalData.city}
                                    onChange={(e) => setHospitalData(prev => ({ ...prev, city: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>State *</Label>
                                <Input
                                    placeholder="State"
                                    value={hospitalData.state}
                                    onChange={(e) => setHospitalData(prev => ({ ...prev, state: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>ZIP Code *</Label>
                                <Input
                                    placeholder="ZIP Code"
                                    value={hospitalData.zipCode}
                                    onChange={(e) => setHospitalData(prev => ({ ...prev, zipCode: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-primary" />
                                    Phone *
                                </Label>
                                <Input
                                    placeholder="+91 (XXX) XXX-XXXX"
                                    value={hospitalData.phone}
                                    onChange={(e) => setHospitalData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    Email *
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="contact@hospital.com"
                                    value={hospitalData.email}
                                    onChange={(e) => setHospitalData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" />
                                Website
                            </Label>
                            <Input
                                placeholder="https://www.hospital.com"
                                value={hospitalData.website}
                                onChange={(e) => setHospitalData(prev => ({ ...prev, website: e.target.value }))}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <p className="text-muted-foreground text-sm">
                            Select the departments that will be available in your hospital. You can add custom departments as well.
                        </p>

                        {/* Add custom department */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add custom department"
                                value={customDepartment}
                                onChange={(e) => setCustomDepartment(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addCustomDepartment()}
                            />
                            <Button onClick={addCustomDepartment} variant="outline">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Department Grid */}
                        <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-2">
                            {defaultDepartments.map(dept => (
                                <div
                                    key={dept}
                                    onClick={() => handleDepartmentToggle(dept)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedDepartments.includes(dept)
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-muted-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={selectedDepartments.includes(dept)} />
                                        <span className="text-sm">{dept}</span>
                                    </div>
                                </div>
                            ))}
                            {/* Custom departments */}
                            {selectedDepartments
                                .filter(d => !defaultDepartments.includes(d))
                                .map(dept => (
                                    <div
                                        key={dept}
                                        className="p-3 rounded-lg border border-primary bg-primary/10 text-primary"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Checkbox checked />
                                                <span className="text-sm">{dept}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDepartmentToggle(dept);
                                                }}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Selected: {selectedDepartments.length} departments
                        </p>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium mb-4">Primary Administrator</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        placeholder="Admin name"
                                        value={adminData.name}
                                        onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email *</Label>
                                    <Input
                                        type="email"
                                        placeholder="admin@hospital.com"
                                        value={adminData.email}
                                        onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone</Label>
                                    <Input
                                        placeholder="+91 XXXXX XXXXX"
                                        value={adminData.phone}
                                        onChange={(e) => setAdminData(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={adminData.role}
                                        onValueChange={(value) => setAdminData(prev => ({ ...prev, role: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="super_admin">Super Admin</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium mb-4">Enable User Roles</h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Select which roles will be available for staff members.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {adminRoles.map(role => (
                                    <div
                                        key={role.id}
                                        onClick={() => handleRoleToggle(role.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${enabledRoles.includes(role.id)
                                            ? 'border-primary bg-primary/10'
                                            : 'border-border hover:border-muted-foreground opacity-60'
                                            } ${role.id === 'super_admin' ? 'cursor-not-allowed' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={enabledRoles.includes(role.id)}
                                                disabled={role.id === 'super_admin'}
                                            />
                                            <div>
                                                <p className="text-sm font-medium">{role.name}</p>
                                                <p className="text-xs text-muted-foreground">{role.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <p className="text-muted-foreground text-sm">
                            Configure room types and bed capacity for your hospital.
                        </p>

                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                            {rooms.map((room) => (
                                <div key={room.id} className="p-4 border rounded-lg bg-muted/30">
                                    <div className="grid grid-cols-4 gap-3 items-end">
                                        <div className="space-y-2">
                                            <Label>Room/Ward Name</Label>
                                            <Input
                                                placeholder="Room name"
                                                value={room.name}
                                                onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select
                                                value={room.type}
                                                onValueChange={(value) => updateRoom(room.id, 'type', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ward">General Ward</SelectItem>
                                                    <SelectItem value="semi_private">Semi-Private</SelectItem>
                                                    <SelectItem value="private">Private Room</SelectItem>
                                                    <SelectItem value="deluxe">Deluxe Room</SelectItem>
                                                    <SelectItem value="icu">ICU</SelectItem>
                                                    <SelectItem value="nicu">NICU</SelectItem>
                                                    <SelectItem value="ot">Operation Theater</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Number of Beds</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={room.beds}
                                                onChange={(e) => updateRoom(room.id, 'beds', parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRoom(room.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button variant="outline" onClick={addRoom} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Room/Ward
                        </Button>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm">
                                <span className="font-medium">Total Beds:</span>{' '}
                                {rooms.reduce((sum, room) => sum + (room.beds || 0), 0)}
                            </p>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                                <Building2 className="w-4 h-4 text-primary" />
                                Hospital Information
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <p><span className="text-muted-foreground">Name:</span> {hospitalData.name || 'Not set'}</p>
                                <p><span className="text-muted-foreground">Type:</span> {hospitalData.type || 'Not set'}</p>
                                <p><span className="text-muted-foreground">City:</span> {hospitalData.city || 'Not set'}</p>
                                <p><span className="text-muted-foreground">Phone:</span> {hospitalData.phone || 'Not set'}</p>
                                <p><span className="text-muted-foreground">Email:</span> {hospitalData.email || 'Not set'}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-primary" />
                                Departments ({selectedDepartments.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {selectedDepartments.length > 0 ? (
                                    selectedDepartments.map(dept => (
                                        <span key={dept} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                            {dept}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No departments selected</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                Admin & Roles
                            </h4>
                            <p className="text-sm mb-2">
                                <span className="text-muted-foreground">Primary Admin:</span> {adminData.name || 'Not set'} ({adminData.email || 'No email'})
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Enabled Roles:</span> {enabledRoles.length}
                            </p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <h4 className="font-medium flex items-center gap-2 mb-3">
                                <BedDouble className="w-4 h-4 text-primary" />
                                Rooms & Beds
                            </h4>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Total Rooms/Wards:</span> {rooms.length}
                            </p>
                            <p className="text-sm">
                                <span className="text-muted-foreground">Total Bed Capacity:</span> {rooms.reduce((sum, r) => sum + (r.beds || 0), 0)}
                            </p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden [&>button]:hidden">
                {/* Step Indicator */}
                <div className="px-8 pt-8 pb-6 border-b">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentStep === step.id
                                            ? 'bg-primary text-primary-foreground'
                                            : currentStep > step.id
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        {currentStep > step.id ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <p className={`text-sm font-medium ${currentStep === step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-6 overflow-y-auto max-h-[50vh]">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t flex justify-between items-center bg-muted/30">
                    <Button
                        variant="ghost"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </Button>
                    <Button
                        onClick={handleNext}
                        className="flex items-center gap-2 hero-gradient"
                    >
                        {currentStep === 5 ? 'Complete Setup' : 'Next'}
                        {currentStep < 5 && <ChevronRight className="w-4 h-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HospitalSetupModal;