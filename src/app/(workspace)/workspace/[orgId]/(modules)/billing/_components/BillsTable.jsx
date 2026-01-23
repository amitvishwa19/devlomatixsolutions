import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, MoreHorizontal, User, Eye, Send, Printer, FileText, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import BillFilters from "./BillFilters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import BillViewDialog from "./BillViewDialog";

const initialBills = [
  {
    id: "INV-9575",
    patient: "Anil Rawal",
    patientId: "PT-1001",
    department: "Psychiatry",
    date: "2023-09-21",
    amount: 14195.92,
    status: "paid",
    patientIssue: "Antidepressant",
    address: "1030 4th block Rajajinagar Yamaha showroom 560010",
    guardianName: "Rajesh Rawal",
    admitDate: "20 Sep 2023",
    dischargeDate: "21 Sep 2023",
    mobile: "9165354060",
    insuranceAvailable: "No",
    age: "23",
    consultant: "Dr. Shilpa Patel",
    consultantSpecialty: "Psychotherapist, Diagnosis",
    roomCategory: "General",
    services: [
      { name: "IM charges ||", price: 50.15, amount: 50.15 },
      { name: "Ambulatory surgery ||", price: 2378.65, amount: 2378.65 },
      { name: "Ancillary service ||", price: 11767.12, amount: 11767.12 },
    ],
    paymentMethod: "Cash",
    taxPercent: 18,
    cgst: 2165.48,
    sgst: 2165.48,
    taxableAmount: 12030.44,
    totalAmount: 14195.92,
    remark: "IN CASE OF EMERGENCY CONSULT IMMEDIATELY IF YOU GET PAIN, PAINFUL MOVEMENTS, REDNESS, PUS OR BLEEDING. FOLLOW UP AFTER 5 DAYS. MEET Dr. Shilpa Patel, Apollo Group constitutes the best hospital in India with over 10,000 beds across 73 hospitals, 5000+ pharmacies, over 300 clinics, 1100+ diagnostic centres and 200+ Telemedicine units.",
    hospitalNote: "Apollo Group constitutes the best hospital in India with over 10,000 beds across 73 hospitals, 5000+ pharmacies, over 300 clinics."
  },
  {
    id: "INV-9576",
    patient: "Priya Sharma",
    patientId: "PT-1002",
    department: "Orthopedics",
    date: "2023-09-19",
    amount: 45000,
    status: "pending",
    patientIssue: "Knee Replacement",
    address: "234 MG Road, Indiranagar, Bangalore 560038",
    guardianName: "Vikram Sharma",
    admitDate: "15 Sep 2023",
    dischargeDate: "19 Sep 2023",
    mobile: "9876543210",
    insuranceAvailable: "Yes - Star Health",
    age: "55",
    consultant: "Dr. Ramesh Iyer",
    consultantSpecialty: "Orthopedic Surgeon",
    roomCategory: "Semi-Private",
    services: [
      { name: "Knee Replacement Surgery", price: 35000, amount: 35000 },
      { name: "Room Charges (4 days)", price: 8000, amount: 8000 },
      { name: "Physiotherapy Sessions", price: 2000, amount: 2000 },
    ],
    paymentMethod: "Insurance",
    taxPercent: 18,
    cgst: 4050,
    sgst: 4050,
    taxableAmount: 36900,
    totalAmount: 45000,
    remark: "Continue prescribed medications. Avoid strenuous activities for 6 weeks. Follow up in 2 weeks for suture removal.",
    hospitalNote: "Patient advised complete bed rest for initial 3 days post-surgery."
  },
  {
    id: "INV-9577",
    patient: "Amit Patel",
    patientId: "PT-1003",
    department: "Pathology",
    date: "2023-09-18",
    amount: 8500,
    status: "paid",
    patientIssue: "Annual Health Checkup",
    address: "567 HSR Layout, Sector 2, Bangalore 560102",
    guardianName: "Self",
    admitDate: "18 Sep 2023",
    dischargeDate: "18 Sep 2023",
    mobile: "8765432109",
    insuranceAvailable: "No",
    age: "35",
    consultant: "Dr. Meena Kulkarni",
    consultantSpecialty: "Pathologist",
    roomCategory: "OPD",
    services: [
      { name: "Complete Blood Count", price: 800, amount: 800 },
      { name: "Lipid Profile", price: 1200, amount: 1200 },
      { name: "Liver Function Test", price: 1500, amount: 1500 },
      { name: "Kidney Function Test", price: 1500, amount: 1500 },
      { name: "Thyroid Profile", price: 1800, amount: 1800 },
      { name: "ECG & Consultation", price: 1700, amount: 1700 },
    ],
    paymentMethod: "UPI",
    taxPercent: 18,
    cgst: 765,
    sgst: 765,
    taxableAmount: 6970,
    totalAmount: 8500,
    remark: "All parameters within normal range. Maintain healthy diet and regular exercise. Next checkup recommended in 1 year.",
    hospitalNote: "Reports will be available within 24 hours on patient portal."
  },
  {
    id: "INV-9578",
    patient: "Sunita Devi",
    patientId: "PT-1004",
    department: "Radiology",
    date: "2023-09-17",
    amount: 22000,
    status: "overdue",
    patientIssue: "Abdominal Pain Investigation",
    address: "890 Koramangala, 5th Block, Bangalore 560095",
    guardianName: "Mohan Kumar",
    admitDate: "16 Sep 2023",
    dischargeDate: "17 Sep 2023",
    mobile: "7654321098",
    insuranceAvailable: "No",
    age: "48",
    consultant: "Dr. Anand Rao",
    consultantSpecialty: "Radiologist",
    roomCategory: "General",
    services: [
      { name: "CT Scan - Abdomen", price: 12000, amount: 12000 },
      { name: "Ultrasound - Abdomen", price: 3500, amount: 3500 },
      { name: "X-Ray - Chest", price: 1500, amount: 1500 },
      { name: "Consultation Fee", price: 2000, amount: 2000 },
      { name: "Room Charges", price: 3000, amount: 3000 },
    ],
    paymentMethod: "Pending",
    taxPercent: 18,
    cgst: 1980,
    sgst: 1980,
    taxableAmount: 18040,
    totalAmount: 22000,
    remark: "URGENT: Payment overdue. Please clear dues within 7 days to avoid additional charges. Contact billing department for payment plan options.",
    hospitalNote: "Follow-up imaging may be required based on treatment response."
  },
  {
    id: "INV-9579",
    patient: "Mohammed Ali",
    patientId: "PT-1005",
    department: "General Medicine",
    date: "2023-09-16",
    amount: 12500,
    status: "pending",
    patientIssue: "Fever & Weakness",
    address: "123 Wilson Garden, Bangalore 560027",
    guardianName: "Fatima Ali",
    admitDate: "14 Sep 2023",
    dischargeDate: "16 Sep 2023",
    mobile: "6543210987",
    insuranceAvailable: "Yes - ICICI Lombard",
    age: "42",
    consultant: "Dr. Prakash Hegde",
    consultantSpecialty: "General Physician",
    roomCategory: "General",
    services: [
      { name: "Room Charges (2 days)", price: 4000, amount: 4000 },
      { name: "IV Medications", price: 3500, amount: 3500 },
      { name: "Blood Tests Panel", price: 2500, amount: 2500 },
      { name: "Doctor Visits", price: 2500, amount: 2500 },
    ],
    paymentMethod: "Card",
    taxPercent: 18,
    cgst: 1125,
    sgst: 1125,
    taxableAmount: 10250,
    totalAmount: 12500,
    remark: "Complete course of antibiotics. Stay hydrated. Avoid cold beverages. Follow up if fever persists beyond 3 days.",
    hospitalNote: "Dengue test negative. Suspected viral infection treated symptomatically."
  },
  {
    id: "INV-9580",
    patient: "Kavita Singh",
    patientId: "PT-1006",
    department: "Neurology",
    date: "2023-09-15",
    amount: 35000,
    status: "paid",
    patientIssue: "Chronic Migraine",
    address: "456 Whitefield, ITPL Road, Bangalore 560066",
    guardianName: "Arun Singh",
    admitDate: "13 Sep 2023",
    dischargeDate: "15 Sep 2023",
    mobile: "5432109876",
    insuranceAvailable: "Yes - Max Bupa",
    age: "38",
    consultant: "Dr. Neha Gupta",
    consultantSpecialty: "Neurologist",
    roomCategory: "Private",
    services: [
      { name: "MRI Brain with Contrast", price: 18000, amount: 18000 },
      { name: "EEG Study", price: 5000, amount: 5000 },
      { name: "Consultation & Treatment", price: 4000, amount: 4000 },
      { name: "Room Charges (2 days)", price: 6000, amount: 6000 },
      { name: "Medications", price: 2000, amount: 2000 },
    ],
    paymentMethod: "Insurance Claim",
    taxPercent: 18,
    cgst: 3150,
    sgst: 3150,
    taxableAmount: 28700,
    totalAmount: 35000,
    remark: "Avoid triggers: bright lights, loud sounds, irregular sleep. Take prescribed preventive medication daily. Emergency visit if severe headache with vision changes.",
    hospitalNote: "MRI findings normal. Diagnosis: Chronic migraine without aura. Preventive therapy initiated."
  },
];

const statusStyles = {
  paid: "bg-success/10 text-success border-success/30",
  pending: "bg-warning/10 text-warning border-warning/30",
  overdue: "bg-destructive/10 text-destructive border-destructive/30",
};

const BillsTable = ({ onPayClick }) => {
  const [bills, setBills] = useState(initialBills);
  const [filters, setFilters] = useState({
    search: "",
    department: "All Departments",
    status: "all",
    dateRange: null,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBillDetails, setSelectedBillDetails] = useState(null);

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          bill.patient.toLowerCase().includes(searchLower) ||
          bill.patientId.toLowerCase().includes(searchLower) ||
          bill.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      if (filters.department && filters.department !== "All Departments") {
        if (bill.department !== filters.department) return false;
      }

      if (filters.status && filters.status !== "all") {
        if (bill.status !== filters.status) return false;
      }

      return true;
    });
  }, [bills, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSendReminder = (bill) => {
    toast.success("Reminder sent!", {
      description: `Payment reminder sent to ${bill.patient}`,
    });
  };

  const handlePrintBill = (bill) => {
    toast.success("Printing bill...", {
      description: `Bill ${bill.id} sent to printer`,
    });
  };

  const handleViewDetails = (bill) => {
    setSelectedBillDetails(bill);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (bill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (billToDelete) {
      setBills(bills.filter((b) => b.id !== billToDelete.id));
      toast.success("Bill deleted", {
        description: `Bill ${billToDelete.id} has been removed`,
      });
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border space-y-4">
        <div>
          <h2 className="text-lg font-semibold font-heading">Patient Bills</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and collect patient payments
          </p>
        </div>
        <BillFilters onFilterChange={handleFilterChange} activeFilters={filters} />
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Patient</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No bills found matching your criteria
                </TableCell>
              </TableRow>
            ) : (
              filteredBills.map((bill) => (
                <TableRow
                  key={bill.id}
                  className="hover:bg-muted/20 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{bill.patient}</p>
                        <p className="text-xs text-muted-foreground">{bill.patientId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{bill.department}</TableCell>
                  <TableCell className="text-muted-foreground">{bill.date}</TableCell>
                  <TableCell className="font-semibold">
                    ₹{bill.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("capitalize font-medium", statusStyles[bill.status])}
                    >
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {bill.status !== "paid" && (
                        <Button
                          size="sm"
                          className="h-8 gap-1.5 rounded-lg"
                          onClick={() => onPayClick(bill)}
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          Collect
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
                          <DropdownMenuItem onClick={() => handleViewDetails(bill)} className="gap-2 cursor-pointer">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {bill.status !== "paid" && (
                            <DropdownMenuItem onClick={() => handleSendReminder(bill)} className="gap-2 cursor-pointer">
                              <Send className="h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handlePrintBill(bill)} className="gap-2 cursor-pointer">
                            <Printer className="h-4 w-4" />
                            Print Bill
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClick(bill)} 
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Bill
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Info */}
      <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredBills.length} of {bills.length} bills</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm" disabled>Next</Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete bill {billToDelete?.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bill View Dialog */}
      <BillViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        bill={selectedBillDetails}
      />
    </div>
  );
};

export default BillsTable;
