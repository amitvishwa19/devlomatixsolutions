import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Droplets, Shield, Edit2, Save, X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { getStatusColor } from '../utils';
import { PATIENT_STATUSES, BLOOD_GROUPS, GENDERS, INSURANCE_PROVIDERS, RELATIONSHIPS } from '../types';
import { useToast } from '@/hooks/use-toast';

export function DemographicsTab({ patient, onUpdatePatient }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const { toast } = useToast();

  const bloodGroup = BLOOD_GROUPS.find((bg) => bg.id === patient?.bloodGroup);
  const insurance = INSURANCE_PROVIDERS.find((i) => i.id === patient?.insurance?.provider);
  const gender = GENDERS.find((g) => g.id === patient?.gender);

  const handleEdit = () => {
    setEditData({ ...patient });
    setIsEditing(true);
  };

  const handleSave = () => {
    // Calculate age from DOB
    const age = editData.dateOfBirth 
      ? Math.floor((new Date() - new Date(editData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : patient.age;
    
    const updatedPatient = {
      ...editData,
      age,
      fullName: `${editData.firstName} ${editData.lastName}`,
    };
    
    onUpdatePatient?.(updatedPatient);
    setIsEditing(false);
    toast({ title: 'Patient updated', description: 'Patient information has been saved.' });
  };

  const handleCancel = () => {
    setEditData(null);
    setIsEditing(false);
  };

  if (!patient) return null;

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-end">
        {!isEditing ? (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleEdit}>
            <Edit2 className="w-4 h-4" />
            Edit Details
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <section>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          Personal Information
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">First Name</Label>
                <Input
                  value={editData.firstName}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Last Name</Label>
                <Input
                  value={editData.lastName}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {editData.dateOfBirth ? format(new Date(editData.dateOfBirth), 'dd MMM yyyy') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editData.dateOfBirth ? new Date(editData.dateOfBirth) : undefined}
                      onSelect={(date) => setEditData({ ...editData, dateOfBirth: date })}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Gender</Label>
                <Select value={editData.gender} onValueChange={(val) => setEditData({ ...editData, gender: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Blood Group</Label>
                <Select value={editData.bloodGroup} onValueChange={(val) => setEditData({ ...editData, bloodGroup: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((bg) => (
                      <SelectItem key={bg.id} value={bg.id}>{bg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={editData.status} onValueChange={(val) => setEditData({ ...editData, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PATIENT_STATUSES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <InfoField label="Full Name" value={patient.fullName} icon={User} />
              <InfoField label="Age" value={`${patient.age} years`} icon={Calendar} />
              <InfoField label="Gender" value={gender?.label || patient.gender} icon={User} />
              <InfoField label="Blood Group" value={bloodGroup?.label || '-'} icon={Droplets} />
              <InfoField label="Date of Birth" value={patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd MMM yyyy') : '-'} icon={Calendar} />
              <InfoField label="Registered" value={patient.registeredAt ? format(new Date(patient.registeredAt), 'dd MMM yyyy') : '-'} icon={Calendar} />
            </>
          )}
        </div>
      </section>

      <Separator />

      {/* Contact Details */}
      <section>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          Contact Details
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-xs text-muted-foreground">Address</Label>
                <Textarea
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  rows={2}
                />
              </div>
            </>
          ) : (
            <>
              <InfoField label="Phone" value={patient.phone} icon={Phone} />
              <InfoField label="Email" value={patient.email} icon={Mail} />
              <div className="col-span-2">
                <InfoField label="Address" value={patient.address} icon={MapPin} />
              </div>
            </>
          )}
        </div>
      </section>

      <Separator />

      {/* Emergency Contact */}
      <section>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          Emergency Contact
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={editData.emergencyContact?.name || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    emergencyContact: { ...editData.emergencyContact, name: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input
                  value={editData.emergencyContact?.phone || ''}
                  onChange={(e) => setEditData({ 
                    ...editData, 
                    emergencyContact: { ...editData.emergencyContact, phone: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Relationship</Label>
                <Select 
                  value={editData.emergencyContact?.relationship || ''} 
                  onValueChange={(val) => setEditData({ 
                    ...editData, 
                    emergencyContact: { ...editData.emergencyContact, relationship: val }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIPS.map((rel) => (
                      <SelectItem key={rel.id} value={rel.id}>{rel.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <InfoField label="Name" value={patient.emergencyContact?.name || '-'} icon={User} />
              <InfoField label="Phone" value={patient.emergencyContact?.phone || '-'} icon={Phone} />
              <InfoField label="Relationship" value={
                RELATIONSHIPS.find(r => r.id === patient.emergencyContact?.relationship)?.label || 
                patient.emergencyContact?.relationship || '-'
              } icon={User} />
            </>
          )}
        </div>
      </section>

      <Separator />

      {/* Insurance */}
      <section>
        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Insurance
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <Select 
                  value={editData.insurance?.provider || 'none'} 
                  onValueChange={(val) => setEditData({ 
                    ...editData, 
                    insurance: { ...editData.insurance, provider: val }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURANCE_PROVIDERS.map((ins) => (
                      <SelectItem key={ins.id} value={ins.id}>{ins.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editData.insurance?.provider !== 'none' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Policy Number</Label>
                  <Input
                    value={editData.insurance?.policyNumber || ''}
                    onChange={(e) => setEditData({ 
                      ...editData, 
                      insurance: { ...editData.insurance, policyNumber: e.target.value }
                    })}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <InfoField label="Provider" value={insurance?.label || 'Self Pay'} icon={Shield} />
              <InfoField label="Policy Number" value={patient.insurance?.policyNumber || '-'} icon={FileText} />
              <InfoField label="Valid Until" value={patient.insurance?.validUntil ? format(new Date(patient.insurance.validUntil), 'dd MMM yyyy') : '-'} icon={Calendar} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoField({ label, value, icon: Icon }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{value || '-'}</p>
    </div>
  );
}
