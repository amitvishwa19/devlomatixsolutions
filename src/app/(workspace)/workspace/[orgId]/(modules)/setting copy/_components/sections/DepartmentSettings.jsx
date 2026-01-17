import { SettingsSection } from "../SettingsSection";
import { SettingsCard } from "../SettingsCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, Settings2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema } from "../../_types/settings";

const hospitalDepartments = [
  // Clinical Departments
  { id: "emergency", name: "Emergency (ER)", category: "Clinical", icon: "🚨" },
  { id: "cardiology", name: "Cardiology", category: "Clinical", icon: "❤️" },
  { id: "neurology", name: "Neurology", category: "Clinical", icon: "🧠" },
  { id: "pediatrics", name: "Pediatrics", category: "Clinical", icon: "👶" },
  { id: "orthopedics", name: "Orthopedics", category: "Clinical", icon: "🦴" },
  { id: "oncology", name: "Oncology", category: "Clinical", icon: "🎗️" },
  { id: "dermatology", name: "Dermatology", category: "Clinical", icon: "🩹" },
  { id: "gastroenterology", name: "Gastroenterology", category: "Clinical", icon: "🫁" },
  { id: "nephrology", name: "Nephrology", category: "Clinical", icon: "🫘" },
  { id: "pulmonology", name: "Pulmonology", category: "Clinical", icon: "🌬️" },
  { id: "endocrinology", name: "Endocrinology", category: "Clinical", icon: "⚗️" },
  { id: "rheumatology", name: "Rheumatology", category: "Clinical", icon: "💪" },
  { id: "urology", name: "Urology", category: "Clinical", icon: "🔬" },
  { id: "ophthalmology", name: "Ophthalmology", category: "Clinical", icon: "👁️" },
  { id: "ent", name: "ENT (Otolaryngology)", category: "Clinical", icon: "👂" },
  { id: "psychiatry", name: "Psychiatry", category: "Clinical", icon: "🧘" },
  { id: "obstetrics", name: "Obstetrics & Gynecology", category: "Clinical", icon: "🤰" },
  { id: "geriatrics", name: "Geriatrics", category: "Clinical", icon: "👴" },

  // Surgical Departments
  { id: "general-surgery", name: "General Surgery", category: "Surgical", icon: "🔪" },
  { id: "cardiac-surgery", name: "Cardiac Surgery", category: "Surgical", icon: "💓" },
  { id: "neuro-surgery", name: "Neurosurgery", category: "Surgical", icon: "🧬" },
  { id: "plastic-surgery", name: "Plastic Surgery", category: "Surgical", icon: "✨" },
  { id: "vascular-surgery", name: "Vascular Surgery", category: "Surgical", icon: "🩸" },
  { id: "transplant", name: "Transplant Surgery", category: "Surgical", icon: "🫀" },

  // Critical Care
  { id: "icu", name: "ICU (Intensive Care)", category: "Critical Care", icon: "🏥" },
  { id: "nicu", name: "NICU (Neonatal ICU)", category: "Critical Care", icon: "👼" },
  { id: "picu", name: "PICU (Pediatric ICU)", category: "Critical Care", icon: "🧒" },
  { id: "ccu", name: "CCU (Coronary Care)", category: "Critical Care", icon: "💗" },
  { id: "burn-unit", name: "Burn Unit", category: "Critical Care", icon: "🔥" },

  // Diagnostic Departments
  { id: "radiology", name: "Radiology", category: "Diagnostic", icon: "📷" },
  { id: "pathology", name: "Pathology", category: "Diagnostic", icon: "🔬" },
  { id: "laboratory", name: "Laboratory", category: "Diagnostic", icon: "🧪" },
  { id: "nuclear-medicine", name: "Nuclear Medicine", category: "Diagnostic", icon: "☢️" },

  // Support Departments
  { id: "pharmacy", name: "Pharmacy", category: "Support", icon: "💊" },
  { id: "physical-therapy", name: "Physical Therapy", category: "Support", icon: "🏃" },
  { id: "occupational-therapy", name: "Occupational Therapy", category: "Support", icon: "🎯" },
  { id: "speech-therapy", name: "Speech Therapy", category: "Support", icon: "🗣️" },
  { id: "nutrition", name: "Nutrition & Dietetics", category: "Support", icon: "🥗" },
  { id: "social-work", name: "Social Work", category: "Support", icon: "🤝" },
  { id: "blood-bank", name: "Blood Bank", category: "Support", icon: "🩸" },
  { id: "dialysis", name: "Dialysis Center", category: "Support", icon: "💉" },

  // Administrative
  { id: "admissions", name: "Admissions", category: "Administrative", icon: "📝" },
  { id: "billing", name: "Billing & Insurance", category: "Administrative", icon: "💳" },
  { id: "medical-records", name: "Medical Records", category: "Administrative", icon: "📁" },
  { id: "hr", name: "Human Resources", category: "Administrative", icon: "👥" },
  { id: "quality", name: "Quality Assurance", category: "Administrative", icon: "✅" },
  { id: "infection-control", name: "Infection Control", category: "Administrative", icon: "🦠" },
];

const categories = ["Clinical", "Surgical", "Critical Care", "Diagnostic", "Support", "Administrative"];

export function DepartmentSettings() {
  const [enabledDepartments, setEnabledDepartments] = useState([
    "emergency", "cardiology", "neurology", "pediatrics", "orthopedics",
    "icu", "radiology", "laboratory", "pharmacy", "admissions"
  ]);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configuringDepartment, setConfiguringDepartment] = useState(null);

  const form = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      code: "",
      headOfDepartment: "",
      beds: 0,
      floor: 1,
      extension: "",
      operatingHours: { start: "08:00", end: "18:00" },
      active: true,
      emergency: false,
    },
  });

  const toggleDepartment = (id) => {
    setEnabledDepartments(prev =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const toggleAllInCategory = (category, enabled) => {
    const categoryDepts = hospitalDepartments.filter(d => d.category === category).map(d => d.id);
    if (enabled) {
      setEnabledDepartments(prev => [...new Set([...prev, ...categoryDepts])]);
    } else {
      setEnabledDepartments(prev => prev.filter(id => !categoryDepts.includes(id)));
    }
    toast({
      title: enabled ? "Departments Enabled" : "Departments Disabled",
      description: `All ${category} departments have been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const openConfigDialog = (dept) => {
    setConfiguringDepartment(dept);
    form.reset({
      name: dept.name,
      code: dept.id.toUpperCase().slice(0, 4),
      headOfDepartment: "",
      beds: 10,
      floor: 1,
      extension: "",
      operatingHours: { start: "08:00", end: "18:00" },
      active: true,
      emergency: dept.category === "Critical Care",
    });
    setIsConfigDialogOpen(true);
  };

  const onSubmit = (data) => {
    toast({
      title: "Department Configured",
      description: `${configuringDepartment?.name} settings have been saved.`
    });
    setIsConfigDialogOpen(false);
    setConfiguringDepartment(null);
  };

  const getCategoryStats = (category) => {
    const categoryDepts = hospitalDepartments.filter(d => d.category === category);
    const enabledCount = categoryDepts.filter(d => enabledDepartments.includes(d.id)).length;
    return { total: categoryDepts.length, enabled: enabledCount };
  };

  return (
    <SettingsSection
      title="Departments"
      description="Enable and configure hospital departments for your facility"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-muted-foreground">
            {enabledDepartments.length} of {hospitalDepartments.length} departments enabled
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEnabledDepartments(hospitalDepartments.map(d => d.id))}
          >
            Enable All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEnabledDepartments([])}
          >
            Disable All
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category);
          const categoryDepts = hospitalDepartments.filter(d => d.category === category);
          const allEnabled = categoryDepts.every(d => enabledDepartments.includes(d.id));

          return (
            <SettingsCard key={category} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{category}</h3>
                    <p className="text-xs text-muted-foreground">
                      {stats.enabled} of {stats.total} enabled
                    </p>
                  </div>
                </div>
                <Switch
                  checked={allEnabled}
                  onCheckedChange={(checked) => toggleAllInCategory(category, checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {categoryDepts.map((dept) => {
                  const isEnabled = enabledDepartments.includes(dept.id);
                  return (
                    <div
                      key={dept.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${isEnabled
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-surface-2 border-border/50 hover:border-border'
                        }`}
                      onClick={() => toggleDepartment(dept.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={() => toggleDepartment(dept.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="text-lg">{dept.icon}</span>
                        <span className={`text-sm ${isEnabled ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {dept.name}
                        </span>
                      </div>
                      {isEnabled && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfigDialog(dept);
                          }}
                        >
                          <Settings2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </SettingsCard>
          );
        })}
      </div>

      <Dialog open={isConfigDialogOpen} onOpenChange={(open) => {
        setIsConfigDialogOpen(open);
        if (!open) {
          setConfiguringDepartment(null);
          form.reset();
        }
      }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configuringDepartment?.icon} Configure {configuringDepartment?.name}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Code</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-surface-1 border-border" placeholder="DEPT" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="extension"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Extension</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-surface-1 border-border" placeholder="1001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="headOfDepartment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Head of Department</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-surface-1 border-border" placeholder="Dr. Name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="beds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Beds</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          className="bg-surface-1 border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          className="bg-surface-1 border-border"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="operatingHours.start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="bg-surface-1 border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="operatingHours.end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="bg-surface-1 border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Active</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergency"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">24/7 Emergency</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Configuration
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </SettingsSection>
  );
}
