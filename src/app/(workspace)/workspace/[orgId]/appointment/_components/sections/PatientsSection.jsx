import { useState } from "react";
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  User,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const initialPatients = [
  { id: "1", name: "John Smith", email: "john.smith@email.com", phone: "+1 234 567 8901", age: 45, gender: "Male", address: "123 Main St, New York", lastVisit: "04 Jan 2026", totalVisits: 12, status: "active" },
  { id: "2", name: "Jane Doe", email: "jane.doe@email.com", phone: "+1 234 567 8902", age: 32, gender: "Female", address: "456 Oak Ave, Los Angeles", lastVisit: "02 Jan 2026", totalVisits: 8, status: "active" },
  { id: "3", name: "Alex Johnson", email: "alex.johnson@email.com", phone: "+1 234 567 8903", age: 8, gender: "Male", address: "789 Pine Rd, Chicago", lastVisit: "03 Jan 2026", totalVisits: 15, status: "active" },
  { id: "4", name: "Maria Garcia", email: "maria.garcia@email.com", phone: "+1 234 567 8904", age: 55, gender: "Female", address: "321 Elm St, Houston", lastVisit: "28 Dec 2025", totalVisits: 6, status: "inactive" },
  { id: "5", name: "David Brown", email: "david.brown@email.com", phone: "+1 234 567 8905", age: 38, gender: "Male", address: "654 Cedar Ln, Phoenix", lastVisit: "01 Jan 2026", totalVisits: 4, status: "active" },
  { id: "6", name: "Sarah Connor", email: "sarah.connor@email.com", phone: "+1 234 567 8906", age: 42, gender: "Female", address: "987 Birch Dr, Philadelphia", lastVisit: "30 Dec 2025", totalVisits: 22, status: "active" },
  { id: "7", name: "Mike Johnson", email: "mike.johnson@email.com", phone: "+1 234 567 8907", age: 29, gender: "Male", address: "147 Maple Way, San Antonio", lastVisit: "03 Jan 2026", totalVisits: 3, status: "active" },
  { id: "8", name: "Lisa Wong", email: "lisa.wong@email.com", phone: "+1 234 567 8908", age: 51, gender: "Female", address: "258 Walnut St, San Diego", lastVisit: "25 Dec 2025", totalVisits: 9, status: "inactive" },
];

export function PatientsContent() {
  const { toast } = useToast();
  const [patients, setPatients] = useState(initialPatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
  });

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenDialog = (patient = null) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age.toString(),
        gender: patient.gender,
        address: patient.address,
      });
    } else {
      setEditingPatient(null);
      setFormData({ name: "", email: "", phone: "", age: "", gender: "", address: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingPatient) {
      setPatients(patients.map(p =>
        p.id === editingPatient.id
          ? { ...p, ...formData, age: parseInt(formData.age) || 0 }
          : p
      ));
      toast({ title: "Patient Updated", description: "Patient information has been updated." });
    } else {
      const newPatient = {
        id: Date.now().toString(),
        ...formData,
        age: parseInt(formData.age) || 0,
        lastVisit: format(new Date(), "dd MMM yyyy"),
        totalVisits: 0,
        status: "active",
      };
      setPatients([newPatient, ...patients]);
      toast({ title: "Patient Added", description: "New patient has been added successfully." });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id) => {
    setPatients(patients.filter(p => p.id !== id));
    toast({ title: "Patient Removed", description: "Patient has been removed from the system." });
  };

  const handleStatusChange = (id, status) => {
    setPatients(patients.map(p => p.id === id ? { ...p, status } : p));
    toast({ title: "Status Updated", description: `Patient status changed to ${status}.` });
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
          Add Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-status-completed/10">
              <Activity className="h-5 w-5 text-status-completed" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {patients.filter(p => p.status === "active").length}
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
                {patients.reduce((sum, p) => sum + p.totalVisits, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Visits</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-status-scheduled/10">
              <User className="h-5 w-5 text-status-scheduled" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {Math.round(patients.reduce((sum, p) => sum + p.age, 0) / patients.length)}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Age</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-11 bg-secondary/80 border-border/60 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] h-11 bg-secondary/80 border-border/60 rounded-xl">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Patients Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Age / Gender</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Total Visits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <p className="text-muted-foreground">No patients found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-secondary/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patient.name}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{patient.address}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{patient.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground">{patient.age} yrs</span>
                    <span className="text-muted-foreground"> / {patient.gender}</span>
                  </TableCell>
                  <TableCell className="text-foreground">{patient.lastVisit}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-foreground">{patient.totalVisits}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        patient.status === "active"
                          ? "bg-status-completed/10 text-status-completed border-status-completed/20"
                          : "bg-muted/50 text-muted-foreground border-border"
                      )}
                    >
                      {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(patient)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(patient.id, patient.status === "active" ? "inactive" : "active")}>
                          <Activity className="mr-2 h-4 w-4" />
                          {patient.status === "active" ? "Mark Inactive" : "Mark Active"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(patient.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/60">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit Patient" : "Add New Patient"}</DialogTitle>
            <DialogDescription>
              {editingPatient ? "Update the patient's information" : "Enter the patient's details"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter patient's name"
                className="bg-secondary/80 border-border/60"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Age"
                  className="bg-secondary/80 border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="bg-secondary/80 border-border/60">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@email.com"
                className="bg-secondary/80 border-border/60"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone <span className="text-destructive">*</span></Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                className="bg-secondary/80 border-border/60"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                className="bg-secondary/80 border-border/60 resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-primary text-primary-foreground">
              {editingPatient ? "Save Changes" : "Add Patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PatientsContent;
