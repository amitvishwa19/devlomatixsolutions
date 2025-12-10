import { Building2, MapPin, Phone, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";



const hospitalTypes = [
    "General Hospital",
    "Specialty Hospital",
    "Teaching Hospital",
    "Community Hospital",
    "Clinic",
    "Medical Center",
];

export function HospitalInfoStep({
    data,
    updateData,
    onNext,
}) {
    const isValid =
        data.hospitalName && data.hospitalType && data.phone && data.email;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">
                    Hospital Information
                </h3>
                <p className="text-sm text-muted-foreground">
                    Enter your hospital or clinic's basic details
                </p>
            </div>

            <div className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="hospitalName" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Hospital Name
                    </Label>
                    <Input
                        id="hospitalName"
                        placeholder="Enter hospital name"
                        value={data.hospitalName}
                        onChange={(e) => updateData({ hospitalName: e.target.value })}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="hospitalType" className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        Hospital Type
                    </Label>
                    <Select
                        value={data.hospitalType}
                        onValueChange={(value) => updateData({ hospitalType: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select hospital type" />
                        </SelectTrigger>
                        <SelectContent>
                            {hospitalTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        Address
                    </Label>
                    <Input
                        id="address"
                        placeholder="Enter full address"
                        value={data.address}
                        onChange={(e) => updateData({ address: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />
                            Phone Number
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={data.phone}
                            onChange={(e) => updateData({ phone: e.target.value })}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            Contact Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="contact@hospital.com"
                            value={data.email}
                            onChange={(e) => updateData({ email: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={onNext} disabled={!isValid} size="lg">
                    Continue
                </Button>
            </div>
        </div>
    );
}
