import { useState } from "react";
import {
    Plus,
    Search,
    Stethoscope,
    Mail,
    Phone,
    Calendar,
    MoreHorizontal,
    Edit,
    Trash2,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const specialties = [
    "Cardiologist",
    "Neurologist",
    "Pediatrician",
    "Orthopedic",
    "Dermatologist",
    "General Physician",
    "Ophthalmologist",
    "ENT Specialist",
    "Psychiatrist",
    "Dentist"
];

const initialDoctors = [
    { id: "1", name: "Dr. Sarah Johnson", specialty: "Cardiologist", email: "sarah.johnson@hospital.com", phone: "+1 234 567 8901", patients: 156, appointments: 42, status: "active" },
    { id: "2", name: "Dr. Michael Chen", specialty: "Neurologist", email: "michael.chen@hospital.com", phone: "+1 234 567 8902", patients: 98, appointments: 28, status: "active" },
    { id: "3", name: "Dr. Emily Davis", specialty: "Pediatrician", email: "emily.davis@hospital.com", phone: "+1 234 567 8903", patients: 234, appointments: 65, status: "active" },
    { id: "4", name: "Dr. Robert Wilson", specialty: "Orthopedic", email: "robert.wilson@hospital.com", phone: "+1 234 567 8904", patients: 87, appointments: 19, status: "on-leave" },
    { id: "5", name: "Dr. Lisa Anderson", specialty: "Dermatologist", email: "lisa.anderson@hospital.com", phone: "+1 234 567 8905", patients: 145, appointments: 38, status: "active" },
    { id: "6", name: "Dr. James Miller", specialty: "General Physician", email: "james.miller@hospital.com", phone: "+1 234 567 8906", patients: 312, appointments: 78, status: "active" },
];

export function DoctorsContent() {
    const { toast } = useToast();
    const [doctors, setDoctors] = useState(initialDoctors);
    const [searchQuery, setSearchQuery] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        specialty: "",
        email: "",
        phone: "",
    });

    const filteredDoctors = doctors.filter((doctor) => {
        const matchesSearch =
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = specialtyFilter === "all" || doctor.specialty === specialtyFilter;
        return matchesSearch && matchesSpecialty;
    });

    const handleOpenDialog = (doctor = null) => {
        if (doctor) {
            setEditingDoctor(doctor);
            setFormData({
                name: doctor.name.replace("Dr. ", ""),
                specialty: doctor.specialty,
                email: doctor.email,
                phone: doctor.phone,
            });
        } else {
            setEditingDoctor(null);
            setFormData({ name: "", specialty: "", email: "", phone: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.specialty || !formData.email) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all required fields.",
                variant: "destructive",
            });
            return;
        }

        if (editingDoctor) {
            setDoctors(doctors.map(d =>
                d.id === editingDoctor.id
                    ? { ...d, name: `Dr. ${formData.name}`, specialty: formData.specialty, email: formData.email, phone: formData.phone }
                    : d
            ));
            toast({ title: "Doctor Updated", description: "Doctor information has been updated." });
        } else {
            const newDoctor = {
                id: Date.now().toString(),
                name: `Dr. ${formData.name}`,
                specialty: formData.specialty,
                email: formData.email,
                phone: formData.phone,
                patients: 0,
                appointments: 0,
                status: "active",
            };
            setDoctors([newDoctor, ...doctors]);
            toast({ title: "Doctor Added", description: "New doctor has been added successfully." });
        }
        setIsDialogOpen(false);
    };

    const handleDelete = (id) => {
        setDoctors(doctors.filter(d => d.id !== id));
        toast({ title: "Doctor Removed", description: "Doctor has been removed from the system." });
    };

    const handleStatusChange = (id, status) => {
        setDoctors(doctors.map(d => d.id === id ? { ...d, status } : d));
        toast({ title: "Status Updated", description: `Doctor status changed to ${status}.` });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-sm"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10">
                            <Stethoscope className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{doctors.length}</p>
                            <p className="text-sm text-muted-foreground">Total Doctors</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-status-completed/10">
                            <Users className="h-5 w-5 text-status-completed" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {doctors.filter(d => d.status === "active").length}
                            </p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-status-pending/10">
                            <Calendar className="h-5 w-5 text-status-pending" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">
                                {doctors.reduce((sum, d) => sum + d.appointments, 0)}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Appointments</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search doctors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-11 bg-secondary/80 border-border/60 rounded-xl"
                    />
                </div>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 bg-secondary/80 border-border/60 rounded-xl">
                        <SelectValue placeholder="All Specialties" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Specialties</SelectItem>
                        {specialties.map((spec) => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Doctors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                    <Card key={doctor.id} className="glass-effect border-border/60 hover:border-primary/40 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Stethoscope className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                                        <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleOpenDialog(doctor)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusChange(doctor.id, doctor.status === "active" ? "on-leave" : "active")}>
                                            <Calendar className="mr-2 h-4 w-4" />
                                            {doctor.status === "active" ? "Set On Leave" : "Set Active"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(doctor.id)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="truncate">{doctor.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{doctor.phone}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                <div className="flex gap-4 text-sm">
                                    <div>
                                        <span className="font-semibold text-foreground">{doctor.patients}</span>
                                        <span className="text-muted-foreground ml-1">patients</span>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-foreground">{doctor.appointments}</span>
                                        <span className="text-muted-foreground ml-1">appts</span>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-xs",
                                        doctor.status === "active"
                                            ? "bg-status-completed/10 text-status-completed border-status-completed/20"
                                            : "bg-status-pending/10 text-status-pending border-status-pending/20"
                                    )}
                                >
                                    {doctor.status === "active" ? "Active" : "On Leave"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredDoctors.length === 0 && (
                <div className="glass-effect rounded-2xl p-16 text-center">
                    <div className="icon-container mx-auto mb-6 w-fit">
                        <Stethoscope className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No doctors found</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery ? "Try adjusting your search" : "Add your first doctor to get started"}
                    </p>
                    <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Doctor
                    </Button>
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md bg-card border-border/60">
                    <DialogHeader>
                        <DialogTitle>{editingDoctor ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
                        <DialogDescription>
                            {editingDoctor ? "Update the doctor's information" : "Enter the doctor's details"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter doctor's name"
                                className="bg-secondary/80 border-border/60"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Specialty <span className="text-destructive">*</span></Label>
                            <Select value={formData.specialty} onValueChange={(v) => setFormData({ ...formData, specialty: v })}>
                                <SelectTrigger className="bg-secondary/80 border-border/60">
                                    <SelectValue placeholder="Select specialty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {specialties.map((spec) => (
                                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Email <span className="text-destructive">*</span></Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="doctor@hospital.com"
                                className="bg-secondary/80 border-border/60"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 234 567 8900"
                                className="bg-secondary/80 border-border/60"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                            {editingDoctor ? "Save Changes" : "Add Doctor"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default DoctorsContent;
