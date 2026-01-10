import { useState } from "react";
import SectionHeader from "../_components/SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Database, Users, Calendar, FileText, Package, CreditCard, Shield, Settings, MessageSquare, Workflow, Save, Plus, Trash2, GripVertical, X, Copy, Download, Eye, Link2, ArrowRight, Edit2, Check, Stethoscope, Key, Grid3X3, Pill, Upload, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Prisma data types
const prismaDataTypes = [
    "String",
    "Int",
    "Float",
    "Boolean",
    "DateTime",
    "Json",
    "BigInt",
    "Decimal",
    "Bytes",
];

// Models extracted from prisma/schema.prisma with detailed fields
const prismaModels = [
    {
        name: "GeneralSettings",
        category: "Settings",
        icon: Settings,
        description: "Website and hospital general configuration",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "userId", type: "String", isRequired: true, isUnique: true },
            { name: "hospitalName", type: "String", isRequired: false },
            { name: "hospitalCode", type: "String", isRequired: false },
            { name: "contactEmail", type: "String", isRequired: false },
            { name: "contactPhone", type: "String", isRequired: false },
            { name: "website", type: "String", isRequired: false },
            { name: "address", type: "String", isRequired: false },
            { name: "logo", type: "String", isRequired: false },
            { name: "timezone", type: "String", isRequired: false, default: "UTC" },
            { name: "language", type: "String", isRequired: false, default: "en" },
            { name: "dateFormat", type: "String", isRequired: false, default: "MM/DD/YYYY" },
            { name: "timeFormat", type: "String", isRequired: false, default: "12h" },
            { name: "currency", type: "String", isRequired: false, default: "USD" },
            { name: "theme", type: "String", isRequired: false, default: "system" },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
            { name: "updatedAt", type: "DateTime", isRequired: true, isUpdatedAt: true },
        ]
    },
    {
        name: "Setting",
        category: "Settings",
        icon: Settings,
        description: "Server-specific settings with timing and consultation options",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "userId", type: "String", isRequired: true, isUnique: true },
            { name: "appointments", type: "Json", isRequired: false },
            { name: "billing", type: "Json", isRequired: false },
            { name: "departments", type: "Json", isRequired: false },
            { name: "integrations", type: "Json", isRequired: false },
            { name: "inventory", type: "Json", isRequired: false },
            { name: "invoice", type: "Json", isRequired: false },
            { name: "notifications", type: "Json", isRequired: false },
            { name: "patients", type: "Json", isRequired: false },
            { name: "pharmacy", type: "Json", isRequired: false },
            { name: "prescription", type: "Json", isRequired: false },
            { name: "security", type: "Json", isRequired: false },
            { name: "services", type: "Json", isRequired: false },
            { name: "staff", type: "Json", isRequired: false },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
            { name: "updatedAt", type: "DateTime", isRequired: true, isUpdatedAt: true },
        ]
    },
    {
        name: "User",
        category: "Users",
        icon: Users,
        description: "Core user model with roles, profiles, and relations",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "email", type: "String", isRequired: true, isUnique: true },
            { name: "name", type: "String", isRequired: false },
            { name: "role", type: "String", isRequired: false, default: "user" },
            { name: "status", type: "String", isRequired: false, default: "active" },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
            { name: "updatedAt", type: "DateTime", isRequired: true, isUpdatedAt: true },
        ]
    },
    {
        name: "Department",
        category: "Organization",
        icon: Database,
        description: "Hospital departments with head doctor and room info",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "name", type: "String", isRequired: true },
            { name: "code", type: "String", isRequired: false },
            { name: "description", type: "String", isRequired: false },
            { name: "headDoctorId", type: "String", isRequired: false },
            { name: "floor", type: "Int", isRequired: false },
            { name: "roomCount", type: "Int", isRequired: false },
            { name: "isActive", type: "Boolean", isRequired: false, default: "true" },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
            { name: "updatedAt", type: "DateTime", isRequired: true, isUpdatedAt: true },
        ]
    },
    {
        name: "Vital",
        category: "Medical",
        icon: FileText,
        description: "Patient vital signs - BP, heart rate, temperature, etc.",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "patientId", type: "String", isRequired: true },
            { name: "bloodPressure", type: "String", isRequired: false },
            { name: "heartRate", type: "Int", isRequired: false },
            { name: "temperature", type: "Float", isRequired: false },
            { name: "weight", type: "Float", isRequired: false },
            { name: "height", type: "Float", isRequired: false },
            { name: "recordedAt", type: "DateTime", isRequired: true, default: "now()" },
        ]
    },
    {
        name: "Appointment",
        category: "Appointments",
        icon: Calendar,
        description: "Patient-doctor appointments with status tracking",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "patientId", type: "String", isRequired: true },
            { name: "doctorId", type: "String", isRequired: true },
            { name: "departmentId", type: "String", isRequired: false },
            { name: "scheduledAt", type: "DateTime", isRequired: true },
            { name: "duration", type: "Int", isRequired: false, default: "30" },
            { name: "status", type: "String", isRequired: false, default: "scheduled" },
            { name: "type", type: "String", isRequired: false },
            { name: "notes", type: "String", isRequired: false },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
            { name: "updatedAt", type: "DateTime", isRequired: true, isUpdatedAt: true },
        ]
    },
    {
        name: "Prescription",
        category: "Medical",
        icon: FileText,
        description: "Medical prescriptions linked to appointments",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "appointmentId", type: "String", isRequired: true },
            { name: "patientId", type: "String", isRequired: true },
            { name: "doctorId", type: "String", isRequired: true },
            { name: "medications", type: "Json", isRequired: false },
            { name: "diagnosis", type: "String", isRequired: false },
            { name: "notes", type: "String", isRequired: false },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
        ]
    },
    {
        name: "Invoice",
        category: "Billing",
        icon: CreditCard,
        description: "Patient invoices with line items",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "patientId", type: "String", isRequired: true },
            { name: "appointmentId", type: "String", isRequired: false },
            { name: "amount", type: "Decimal", isRequired: true },
            { name: "tax", type: "Decimal", isRequired: false },
            { name: "discount", type: "Decimal", isRequired: false },
            { name: "total", type: "Decimal", isRequired: true },
            { name: "status", type: "String", isRequired: false, default: "pending" },
            { name: "dueDate", type: "DateTime", isRequired: false },
            { name: "paidAt", type: "DateTime", isRequired: false },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
        ]
    },
    {
        name: "Inventory",
        category: "Inventory",
        icon: Package,
        description: "Inventory management with stock tracking",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "name", type: "String", isRequired: true },
            { name: "sku", type: "String", isRequired: false, isUnique: true },
            { name: "category", type: "String", isRequired: false },
            { name: "quantity", type: "Int", isRequired: true, default: "0" },
            { name: "minQuantity", type: "Int", isRequired: false, default: "10" },
            { name: "unit", type: "String", isRequired: false },
            { name: "price", type: "Decimal", isRequired: false },
            { name: "expiryDate", type: "DateTime", isRequired: false },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
            { name: "updatedAt", type: "DateTime", isRequired: true, isUpdatedAt: true },
        ]
    },
    {
        name: "Service",
        category: "Services",
        icon: Package,
        description: "Hospital services with pricing",
        fields: [
            { name: "id", type: "String", isRequired: true, isId: true, default: "uuid()" },
            { name: "name", type: "String", isRequired: true },
            { name: "code", type: "String", isRequired: false },
            { name: "description", type: "String", isRequired: false },
            { name: "departmentId", type: "String", isRequired: false },
            { name: "price", type: "Decimal", isRequired: true },
            { name: "duration", type: "Int", isRequired: false },
            { name: "isActive", type: "Boolean", isRequired: false, default: "true" },
            { name: "createdAt", type: "DateTime", isRequired: true, default: "now()" },
        ]
    },
];

// Model relations extracted from prisma schema
const initialRelations = [
    // User relations (what User has)
    { id: "1", fromModel: "User", fromField: "roles", toModel: "Role", toField: "users", type: "many-to-many", onDelete: "CASCADE" },
    { id: "2", fromModel: "User", fromField: "vitals", toModel: "Vital", toField: "patient", type: "one-to-many", onDelete: "CASCADE" },
    { id: "3", fromModel: "User", fromField: "appointmentsAsPatient", toModel: "Appointment", toField: "patient", type: "one-to-many", onDelete: "CASCADE" },
    { id: "4", fromModel: "User", fromField: "appointmentsAsDoctor", toModel: "Appointment", toField: "doctor", type: "one-to-many", onDelete: "SET NULL" },
    { id: "5", fromModel: "User", fromField: "prescriptionsAsPatient", toModel: "Prescription", toField: "patient", type: "one-to-many", onDelete: "CASCADE" },
    { id: "6", fromModel: "User", fromField: "prescriptionsAsDoctor", toModel: "Prescription", toField: "doctor", type: "one-to-many", onDelete: "SET NULL" },
    { id: "7", fromModel: "User", fromField: "invoices", toModel: "Invoice", toField: "patient", type: "one-to-many", onDelete: "CASCADE" },
    { id: "8", fromModel: "User", fromField: "departmentsAsHead", toModel: "Department", toField: "headDoctor", type: "one-to-many", onDelete: "SET NULL" },

    // Role relations
    { id: "9", fromModel: "Role", fromField: "permissions", toModel: "Permission", toField: "roles", type: "many-to-many", onDelete: "CASCADE" },

    // Vital relations
    { id: "10", fromModel: "Vital", fromField: "patientId", toModel: "User", toField: "id", type: "many-to-one", onDelete: "CASCADE" },

    // Appointment relations
    { id: "11", fromModel: "Appointment", fromField: "patientId", toModel: "User", toField: "id", type: "many-to-one", onDelete: "CASCADE" },
    { id: "12", fromModel: "Appointment", fromField: "doctorId", toModel: "User", toField: "id", type: "many-to-one", onDelete: "SET NULL" },
    { id: "13", fromModel: "Appointment", fromField: "departmentId", toModel: "Department", toField: "id", type: "many-to-one", onDelete: "SET NULL" },
    { id: "14", fromModel: "Appointment", fromField: "prescriptions", toModel: "Prescription", toField: "appointment", type: "one-to-many", onDelete: "CASCADE" },
    { id: "15", fromModel: "Appointment", fromField: "invoices", toModel: "Invoice", toField: "appointment", type: "one-to-many", onDelete: "SET NULL" },

    // Prescription relations
    { id: "16", fromModel: "Prescription", fromField: "appointmentId", toModel: "Appointment", toField: "id", type: "many-to-one", onDelete: "CASCADE" },
    { id: "17", fromModel: "Prescription", fromField: "patientId", toModel: "User", toField: "id", type: "many-to-one", onDelete: "CASCADE" },
    { id: "18", fromModel: "Prescription", fromField: "doctorId", toModel: "User", toField: "id", type: "many-to-one", onDelete: "SET NULL" },

    // Invoice relations
    { id: "19", fromModel: "Invoice", fromField: "patientId", toModel: "User", toField: "id", type: "many-to-one", onDelete: "CASCADE" },
    { id: "20", fromModel: "Invoice", fromField: "appointmentId", toModel: "Appointment", toField: "id", type: "many-to-one", onDelete: "SET NULL" },

    // Service relations
    { id: "21", fromModel: "Service", fromField: "departmentId", toModel: "Department", toField: "id", type: "many-to-one", onDelete: "SET NULL" },

    // Department relations
    { id: "22", fromModel: "Department", fromField: "headDoctorId", toModel: "User", toField: "id", type: "many-to-one", onDelete: "SET NULL" },
    { id: "23", fromModel: "Department", fromField: "services", toModel: "Service", toField: "department", type: "one-to-many", onDelete: "SET NULL" },
    { id: "24", fromModel: "Department", fromField: "appointments", toModel: "Appointment", toField: "department", type: "one-to-many", onDelete: "SET NULL" },
];

// Relation types
const relationTypes = [
    { value: "one-to-one", label: "One-to-One" },
    { value: "one-to-many", label: "One-to-Many" },
    { value: "many-to-one", label: "Many-to-One" },
    { value: "many-to-many", label: "Many-to-Many" },
];

// On delete actions
const onDeleteActions = [
    { value: "CASCADE", label: "Cascade" },
    { value: "SET NULL", label: "Set Null" },
    { value: "RESTRICT", label: "Restrict" },
    { value: "NO ACTION", label: "No Action" },
    { value: "SET DEFAULT", label: "Set Default" },
];

// Get unique categories
const categories = [...new Set(prismaModels.map(m => m.category))];

// Category color mapping
const categoryColors = {
    Settings: "bg-blue-500/20 text-blue-400",
    Users: "bg-green-500/20 text-green-400",
    Organization: "bg-purple-500/20 text-purple-400",
    Medical: "bg-red-500/20 text-red-400",
    Appointments: "bg-orange-500/20 text-orange-400",
    Billing: "bg-yellow-500/20 text-yellow-400",
    Security: "bg-pink-500/20 text-pink-400",
    Communication: "bg-cyan-500/20 text-cyan-400",
    CMS: "bg-indigo-500/20 text-indigo-400",
    Tasks: "bg-teal-500/20 text-teal-400",
    Documents: "bg-amber-500/20 text-amber-400",
    Automation: "bg-violet-500/20 text-violet-400",
    Services: "bg-emerald-500/20 text-emerald-400",
    Inventory: "bg-lime-500/20 text-lime-400",
    Integrations: "bg-rose-500/20 text-rose-400",
    Notifications: "bg-sky-500/20 text-sky-400",
};

// Relation type badge colors
const relationTypeColors = {
    "one-to-one": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "one-to-many": "bg-green-500/20 text-green-400 border-green-500/30",
    "many-to-one": "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "many-to-many": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function SchemaPreviewModal({ isOpen, onClose, schemaText, modelName }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(schemaText).then(() => {
            toast.success("Schema copied to clipboard!");
        }).catch(() => {
            toast.error("Failed to copy to clipboard");
        });
    };

    const handleDownload = () => {
        const blob = new Blob([schemaText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${modelName}.prisma`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded ${modelName}.prisma`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Schema Preview - {modelName}
                    </DialogTitle>
                    <DialogDescription>
                        Copy this schema and paste it into your prisma/schema.prisma file
                    </DialogDescription>
                </DialogHeader>

                <div className="relative">
                    <ScrollArea className="h-[400px] w-full rounded-lg border border-border bg-muted/50">
                        <pre className="p-4 text-sm font-mono text-foreground whitespace-pre-wrap">
                            {schemaText}
                        </pre>
                    </ScrollArea>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download .prisma
                    </Button>
                    <Button onClick={handleCopy}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy to Clipboard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TableEditor({ model, onSave }) {
    const [fields, setFields] = useState(model.fields.map(f => ({ ...f })));
    const [hasChanges, setHasChanges] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [generatedSchema, setGeneratedSchema] = useState("");

    const handleFieldChange = (index, key, value) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
        setHasChanges(true);
    };

    const handleAddField = () => {
        setFields([
            ...fields,
            { name: "newField", type: "String", isRequired: false }
        ]);
        setHasChanges(true);
    };

    const handleDeleteField = (index) => {
        const field = fields[index];
        if (field.isId) {
            toast.error("Cannot delete ID field");
            return;
        }
        setFields(fields.filter((_, i) => i !== index));
        setHasChanges(true);
    };

    const generateSchema = () => {
        const schemaLines = [
            `model ${model.name} {`,
            ...fields.map(field => {
                let line = `  ${field.name}`;
                line += ` ${field.type}${field.isRequired ? "" : "?"}`;

                const attributes = [];
                if (field.isId) attributes.push("@id");
                if (field.isUnique) attributes.push("@unique");
                if (field.default) attributes.push(`@default(${field.default})`);
                if (field.isUpdatedAt) attributes.push("@updatedAt");

                if (attributes.length > 0) {
                    line += ` ${attributes.join(" ")}`;
                }

                return line;
            }),
            `}`,
        ];

        return schemaLines.join("\n");
    };

    const handlePreview = () => {
        const schema = generateSchema();
        setGeneratedSchema(schema);
        setShowPreview(true);
    };

    const handleSave = () => {
        const schemaText = generateSchema();
        setGeneratedSchema(schemaText);
        setShowPreview(true);
        onSave?.(model.name, fields, schemaText);
        setHasChanges(false);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleAddField}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Field
                    </Button>
                    <Button variant="outline" size="sm" onClick={handlePreview}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
                        <Save className="h-4 w-4 mr-1" />
                        Save & Preview
                    </Button>
                </div>
            </div>

            <Card className="flex-1 bg-card border-border">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="w-8"></TableHead>
                                <TableHead className="text-muted-foreground">Column Name</TableHead>
                                <TableHead className="text-muted-foreground w-40">Data Type</TableHead>
                                <TableHead className="text-muted-foreground w-24 text-center">Required</TableHead>
                                <TableHead className="text-muted-foreground w-24 text-center">Unique</TableHead>
                                <TableHead className="text-muted-foreground">Default</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={index} className="border-border">
                                    <TableCell className="w-8">
                                        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={field.name}
                                            onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                                            className="h-8 bg-background"
                                            disabled={field.isId}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={field.type}
                                            onValueChange={(value) => handleFieldChange(index, "type", value)}
                                            disabled={field.isId}
                                        >
                                            <SelectTrigger className="h-8 bg-background">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {prismaDataTypes.map(type => (
                                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isRequired}
                                            onChange={(e) => handleFieldChange(index, "isRequired", e.target.checked)}
                                            className="h-4 w-4 accent-primary"
                                            disabled={field.isId}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <input
                                            type="checkbox"
                                            checked={field.isUnique || false}
                                            onChange={(e) => handleFieldChange(index, "isUnique", e.target.checked)}
                                            className="h-4 w-4 accent-primary"
                                            disabled={field.isId}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={field.default || ""}
                                            onChange={(e) => handleFieldChange(index, "default", e.target.value)}
                                            className="h-8 bg-background"
                                            placeholder="None"
                                            disabled={field.isUpdatedAt}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteField(index)}
                                            disabled={field.isId}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <SchemaPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                schemaText={generatedSchema}
                modelName={model.name}
            />
        </div>
    );
}

function OverviewAndTablesTab({ onSelectTable }) {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Models</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{prismaModels.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{categories.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Fields</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{prismaModels.reduce((acc, m) => acc + m.fields.length, 0)}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg Fields/Model</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(prismaModels.reduce((acc, m) => acc + m.fields.length, 0) / prismaModels.length)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Badges */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <Badge key={category} variant="outline" className={categoryColors[category]}>
                                {category} ({prismaModels.filter(m => m.category === category).length})
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Models Table */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">All Database Models</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="text-muted-foreground">Model Name</TableHead>
                                <TableHead className="text-muted-foreground">Category</TableHead>
                                <TableHead className="text-muted-foreground text-center">Fields</TableHead>
                                <TableHead className="text-muted-foreground">Description</TableHead>
                                <TableHead className="text-muted-foreground w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prismaModels.map((model) => {
                                const IconComponent = model.icon;
                                return (
                                    <TableRow
                                        key={model.name}
                                        className="border-border cursor-pointer hover:bg-muted/50"
                                        onClick={() => onSelectTable(model)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <IconComponent className="h-4 w-4 text-muted-foreground" />
                                                {model.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={categoryColors[model.category]}>
                                                {model.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">{model.fields.length}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{model.description}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectTable(model);
                                            }}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function RelationsTab() {
    const [relations, setRelations] = useState(initialRelations);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newRelation, setNewRelation] = useState({
        fromModel: "",
        fromField: "",
        toModel: "",
        toField: "id",
        type: "many-to-one",
        onDelete: "CASCADE",
    });

    const handleEditStart = (relation) => {
        setEditingId(relation.id);
        setEditForm({ ...relation });
    };

    const handleEditSave = () => {
        setRelations(relations.map(r => r.id === editingId ? { ...editForm } : r));
        setEditingId(null);
        toast.success("Relation updated");
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleDelete = (id) => {
        setRelations(relations.filter(r => r.id !== id));
        toast.success("Relation deleted");
    };

    const handleAddRelation = () => {
        if (!newRelation.fromModel || !newRelation.fromField || !newRelation.toModel) {
            toast.error("Please fill all required fields");
            return;
        }
        const id = String(Date.now());
        setRelations([...relations, { ...newRelation, id }]);
        setNewRelation({
            fromModel: "",
            fromField: "",
            toModel: "",
            toField: "id",
            type: "many-to-one",
            onDelete: "CASCADE",
        });
        setShowAddDialog(false);
        toast.success("Relation added");
    };

    const generateRelationsSchema = () => {
        const lines = relations.map(r => {
            const typeSymbol = r.type === "many-to-many" || r.type === "one-to-many" ? "[]" : "";
            return `// ${r.fromModel}.${r.fromField} -> ${r.toModel}.${r.toField} (${r.type}, onDelete: ${r.onDelete})`;
        });
        return lines.join("\n");
    };

    const handleCopySchema = () => {
        const schema = generateRelationsSchema();
        navigator.clipboard.writeText(schema).then(() => {
            toast.success("Relations copied to clipboard!");
        });
    };

    // Group relations by fromModel
    const groupedRelations = relations.reduce((acc, rel) => {
        if (!acc[rel.fromModel]) acc[rel.fromModel] = [];
        acc[rel.fromModel].push(rel);
        return acc;
    }, {});

    return (
        <div className="space-y-6 p-2">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        {relations.length} Relations
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopySchema}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Schema
                    </Button>
                    <Button size="sm" onClick={() => setShowAddDialog(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Relation
                    </Button>
                </div>
            </div>

            {/* Visual Relations Diagram */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Relation Diagram
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(groupedRelations).map(([model, rels]) => (
                            <Card key={model} className="bg-muted/30 border-border">
                                <CardHeader className="py-3 px-4">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                                        <Database className="h-4 w-4 text-primary" />
                                        {model}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2 px-4 space-y-2 overflow-hidden">
                                    {rels.map((rel) => (
                                        <div key={rel.id} className="flex items-center gap-1.5 text-xs flex-wrap">
                                            <span className="text-muted-foreground truncate max-w-[100px]" title={rel.fromField}>{rel.fromField}</span>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 whitespace-nowrap shrink-0 ${relationTypeColors[rel.type]}`}>
                                                {rel.type}
                                            </Badge>
                                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                            <span className="text-primary font-medium truncate" title={rel.toModel}>{rel.toModel}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Relations Table */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">All Relations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="text-muted-foreground">From Model</TableHead>
                                <TableHead className="text-muted-foreground">From Field</TableHead>
                                <TableHead className="text-muted-foreground">To Model</TableHead>
                                <TableHead className="text-muted-foreground">To Field</TableHead>
                                <TableHead className="text-muted-foreground">Type</TableHead>
                                <TableHead className="text-muted-foreground">On Delete</TableHead>
                                <TableHead className="text-muted-foreground w-24"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {relations.map((rel) => (
                                <TableRow key={rel.id} className="border-border">
                                    {editingId === rel.id ? (
                                        <>
                                            <TableCell>
                                                <Select value={editForm.fromModel} onValueChange={(v) => setEditForm({ ...editForm, fromModel: v })}>
                                                    <SelectTrigger className="h-8 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {prismaModels.map(m => (
                                                            <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={editForm.fromField}
                                                    onChange={(e) => setEditForm({ ...editForm, fromField: e.target.value })}
                                                    className="h-8 bg-background"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={editForm.toModel} onValueChange={(v) => setEditForm({ ...editForm, toModel: v })}>
                                                    <SelectTrigger className="h-8 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {prismaModels.map(m => (
                                                            <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    value={editForm.toField}
                                                    onChange={(e) => setEditForm({ ...editForm, toField: e.target.value })}
                                                    className="h-8 bg-background"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                                                    <SelectTrigger className="h-8 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {relationTypes.map(t => (
                                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Select value={editForm.onDelete} onValueChange={(v) => setEditForm({ ...editForm, onDelete: v })}>
                                                    <SelectTrigger className="h-8 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {onDeleteActions.map(a => (
                                                            <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditSave}>
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEditCancel}>
                                                        <X className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="font-medium">{rel.fromModel}</TableCell>
                                            <TableCell className="text-muted-foreground">{rel.fromField}</TableCell>
                                            <TableCell className="font-medium">{rel.toModel}</TableCell>
                                            <TableCell className="text-muted-foreground">{rel.toField}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={relationTypeColors[rel.type]}>
                                                    {rel.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {rel.onDelete}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditStart(rel)}>
                                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => handleDelete(rel.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Relation Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Link2 className="h-5 w-5" />
                            Add New Relation
                        </DialogTitle>
                        <DialogDescription>
                            Define a new relationship between two models
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">From Model</label>
                                <Select value={newRelation.fromModel} onValueChange={(v) => setNewRelation({ ...newRelation, fromModel: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prismaModels.map(m => (
                                            <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">From Field</label>
                                <Input
                                    value={newRelation.fromField}
                                    onChange={(e) => setNewRelation({ ...newRelation, fromField: e.target.value })}
                                    placeholder="e.g., userId"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">To Model</label>
                                <Select value={newRelation.toModel} onValueChange={(v) => setNewRelation({ ...newRelation, toModel: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select model" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prismaModels.map(m => (
                                            <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">To Field</label>
                                <Input
                                    value={newRelation.toField}
                                    onChange={(e) => setNewRelation({ ...newRelation, toField: e.target.value })}
                                    placeholder="e.g., id"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Relation Type</label>
                                <Select value={newRelation.type} onValueChange={(v) => setNewRelation({ ...newRelation, type: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {relationTypes.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">On Delete</label>
                                <Select value={newRelation.onDelete} onValueChange={(v) => setNewRelation({ ...newRelation, onDelete: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {onDeleteActions.map(a => (
                                            <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                        <Button onClick={handleAddRelation}>Add Relation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Seed options with icons
const seedOptions = [
    { id: "users", name: "Users", description: "Populate user table", icon: Users, count: 50 },
    { id: "patients", name: "Patients", description: "Populate patient table", icon: Users, count: 100 },
    { id: "doctors", name: "Doctors", description: "Populate doctor table", icon: Stethoscope, count: 30 },
    { id: "services", name: "Services", description: "Populate service table", icon: Package, count: 25 },
    { id: "roles", name: "Roles", description: "Populate role table", icon: Key, count: 10 },
    { id: "permissions", name: "Permissions", description: "Populate permission table", icon: Shield, count: 20 },
    { id: "categories", name: "Categories", description: "Populate categories table", icon: Grid3X3, count: 15 },
    { id: "appointments", name: "Appointments", description: "Populate appointments table", icon: Calendar, count: 200 },
    { id: "departments", name: "Departments", description: "Populate department table", icon: Database, count: 12 },
    { id: "medications", name: "Medications", description: "Populate medications table", icon: Pill, count: 100 },
    { id: "inventories", name: "Inventories", description: "Populate inventories table", icon: Package, count: 150 },
    { id: "invoices", name: "Invoices", description: "Populate invoice table", icon: CreditCard, count: 200 },
];

function SeedTab() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedingItem, setSeedingItem] = useState(null);
    const [progress, setProgress] = useState(0);
    const [seedConfig, setSeedConfig] = useState({
        nameStyle: "indian", // indian, international, mixed
        includeRelations: true,
        randomizeData: true,
    });

    const handleSeed = async (option) => {
        const toastId = toast.loading(`Seeding ${option.name} data...`);
        setIsSeeding(true);
        setSeedingItem(option.id);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsSeeding(false);
                    setSeedingItem(null);
                    toast.success(`${option.count} ${option.name} records seeded successfully`, { id: toastId });
                    return 100;
                }
                return prev + 10;
            });
        }, 150);
    };

    const handleSeedAll = async () => {
        const toastId = toast.loading("Seeding all tables...");
        setIsSeeding(true);
        setSeedingItem("all");
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsSeeding(false);
                    setSeedingItem(null);
                    toast.success("All tables seeded successfully", { id: toastId });
                    return 100;
                }
                return prev + 5;
            });
        }, 100);
    };

    return (
        <div className="space-y-6 p-2">
            {/* Warning Banner */}
            <div className="flex gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                <div>
                    <p className="font-medium text-yellow-600 dark:text-yellow-400">Development Only</p>
                    <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">
                        These tools are intended for development and testing purposes only.
                    </p>
                </div>
            </div>

            {/* Seed Configuration */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Seed Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Name Style</Label>
                        <Select
                            value={seedConfig.nameStyle}
                            onValueChange={(v) => setSeedConfig({ ...seedConfig, nameStyle: v })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="indian">Indian Names</SelectItem>
                                <SelectItem value="international">International Names</SelectItem>
                                <SelectItem value="mixed">Mixed (Both)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Include Relations</Label>
                            <p className="text-xs text-muted-foreground">Link related records automatically</p>
                        </div>
                        <Switch
                            checked={seedConfig.includeRelations}
                            onCheckedChange={(v) => setSeedConfig({ ...seedConfig, includeRelations: v })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Randomize Data</Label>
                            <p className="text-xs text-muted-foreground">Generate random values for fields</p>
                        </div>
                        <Switch
                            checked={seedConfig.randomizeData}
                            onCheckedChange={(v) => setSeedConfig({ ...seedConfig, randomizeData: v })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Progress */}
            {isSeeding && (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">
                                Seeding {seedingItem === "all" ? "all tables" : seedingItem}...
                            </span>
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </CardContent>
                </Card>
            )}

            {/* Seed All Button */}
            <div className="flex justify-end">
                <Button onClick={handleSeedAll} disabled={isSeeding} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Seed All Tables
                </Button>
            </div>

            {/* Seed Options Grid */}
            <div className="grid grid-cols-2 gap-3">
                {seedOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                        <Card key={option.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{option.name}</div>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => handleSeed(option)}
                                    disabled={isSeeding}
                                    className="shrink-0"
                                >
                                    Seed
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export function DatabaseManagementSettings() {
    const [openTabs, setOpenTabs] = useState([]); // Array of open table models
    const [activeTab, setActiveTab] = useState("overview");

    const handleOpenTable = (model) => {
        // Check if already open
        if (!openTabs.find(t => t.name === model.name)) {
            setOpenTabs([...openTabs, model]);
        }
        setActiveTab(model.name);
    };

    const handleCloseTab = (modelName, e) => {
        e.stopPropagation();
        const newTabs = openTabs.filter(t => t.name !== modelName);
        setOpenTabs(newTabs);
        // If closing the active tab, switch to overview or last open tab
        if (activeTab === modelName) {
            setActiveTab(newTabs.length > 0 ? newTabs[newTabs.length - 1].name : "overview");
        }
    };

    const handleSaveSchema = (modelName, fields, schemaText) => {
        console.log("Schema saved for:", modelName);
        console.log("Fields:", fields);
        console.log("Generated schema:\n", schemaText);
    };

    return (
        <div className="flex flex-col h-full">
            <SectionHeader
                title="Database Management"
                description="Overview of all database tables defined in the Prisma schema"
            />

            <ScrollArea className="flex-1  h-[60vh] p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-4 flex-wrap h-auto gap-1">
                        <TabsTrigger value="overview" className="gap-1">
                            <Database className="h-3.5 w-3.5" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="relations" className="gap-1">
                            <Link2 className="h-3.5 w-3.5" />
                            Relations
                        </TabsTrigger>
                        <TabsTrigger value="seed" className="gap-1">
                            <Upload className="h-3.5 w-3.5" />
                            Database Seed
                        </TabsTrigger>
                        {openTabs.map((model) => {
                            const IconComponent = model.icon;
                            return (
                                <TabsTrigger key={model.name} value={model.name} className="gap-1 pr-1">
                                    <IconComponent className="h-3.5 w-3.5" />
                                    {model.name}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-1 hover:bg-destructive/20 rounded-sm"
                                        onClick={(e) => handleCloseTab(model.name, e)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    <TabsContent value="overview">
                        <OverviewAndTablesTab onSelectTable={handleOpenTable} />
                    </TabsContent>

                    <TabsContent value="relations">
                        <RelationsTab />
                    </TabsContent>

                    <TabsContent value="seed">
                        <SeedTab />
                    </TabsContent>

                    {openTabs.map((model) => (
                        <TabsContent key={model.name} value={model.name}>
                            <TableEditor
                                model={model}
                                onSave={handleSaveSchema}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </ScrollArea>
        </div>
    );
}
