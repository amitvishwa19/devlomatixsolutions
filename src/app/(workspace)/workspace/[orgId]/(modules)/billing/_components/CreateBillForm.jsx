import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";

const departments = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Pathology",
  "Radiology",
  "ENT",
  "Ophthalmology",
  "Pediatrics",
  "Gynecology",
];

const services = [
  { id: "consultation", name: "Consultation", price: 500 },
  { id: "checkup", name: "General Checkup", price: 1500 },
  { id: "lab_tests", name: "Lab Tests", price: 2500 },
  { id: "xray", name: "X-Ray", price: 3000 },
  { id: "mri", name: "MRI Scan", price: 8000 },
  { id: "ct_scan", name: "CT Scan", price: 6000 },
  { id: "ultrasound", name: "Ultrasound", price: 2000 },
  { id: "ecg", name: "ECG", price: 800 },
  { id: "room", name: "Room Charges (per day)", price: 5000 },
  { id: "medicine", name: "Medicines", price: 0 },
];

const CreateBillForm = ({ onClose }) => {
  const [items, setItems] = useState([{ service: "", quantity: 1, price: 0 }]);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [department, setDepartment] = useState("");

  const addItem = () => {
    setItems([...items, { service: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === "service") {
      const selectedService = services.find(s => s.id === value);
      newItems[index].price = selectedService?.price || 0;
    }
    
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Bill created successfully!", {
      description: `Bill for ${patientName} - ₹${calculateTotal().toLocaleString()}`,
    });
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">Patient Information</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient" className="font-semibold">Patient Name</Label>
            <Input
              id="patient"
              placeholder="Enter patient name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientId" className="font-semibold">Patient ID</Label>
            <Input
              id="patientId"
              placeholder="PT-XXXX"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
              className="h-11"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="font-semibold">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-semibold">Services & Charges</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="rounded-lg">
            <Plus className="h-4 w-4 mr-1" />
            Add Service
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex items-end gap-3 p-4 bg-muted/30 rounded-xl animate-fade-in"
            >
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Service</Label>
                <Select
                  value={item.service}
                  onValueChange={(value) => updateItem(index, "service", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} {service.price > 0 && `- ₹${service.price}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-20 space-y-2">
                <Label className="text-xs text-muted-foreground">Qty</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                  className="h-10"
                />
              </div>
              <div className="w-28 space-y-2">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <Input
                  type="number"
                  value={item.price * item.quantity}
                  onChange={(e) => updateItem(index, "price", parseInt(e.target.value) || 0)}
                  className="h-10"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-10 w-10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
        <span className="text-lg font-semibold">Total Amount</span>
        <span className="text-3xl font-bold text-primary font-heading">
          ₹{calculateTotal().toLocaleString()}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-lg">
          Cancel
        </Button>
        <Button type="submit" className="rounded-lg px-6">
          Create Bill
        </Button>
      </div>
    </form>
  );
};

export default CreateBillForm;
