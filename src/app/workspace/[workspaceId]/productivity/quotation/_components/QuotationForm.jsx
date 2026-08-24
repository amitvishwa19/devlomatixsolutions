import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Save, RotateCcw, ChevronDown, Upload, X, Pencil } from 'lucide-react';
import { defaultModules, defaultTermsAndConditions, defaultNotes, currencies } from "../_types/quotation";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const STORAGE_KEYS = {
  notes: 'quotation_default_notes',
  terms: 'quotation_default_terms',
  customModules: 'quotation_custom_modules',
};

const getStoredOrDefault = (key, fallback) => {
  const stored = localStorage.getItem(key);
  return stored || fallback.join('\n');
};

const getStoredModules = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.customModules);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export function QuotationForm({ onGenerate }) {
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [quotationNumber, setQuotationNumber] = useState('PRO-001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validTill, setValidTill] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [quotationTitle, setQuotationTitle] = useState('Quotation for Hospital Management Software');
  const [totalBeds, setTotalBeds] = useState(100);
  const [perBedPrice, setPerBedPrice] = useState(7000);
  const [gstPercent, setGstPercent] = useState(18);
  const [selectedModules, setSelectedModules] = useState(
    defaultModules.map((m) => m.id)
  );
  const [customLineItems, setCustomLineItems] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [notes, setNotes] = useState('');

  // Company Info States
  const [companyName, setCompanyName] = useState('CareWell');
  const [companyTagline, setCompanyTagline] = useState('The Health Care Software');
  const [companyEmail, setCompanyEmail] = useState('info@carewell.com');
  const [companyWebsite, setCompanyWebsite] = useState('www.carewell.com');
  const [companyPhone1, setCompanyPhone1] = useState('+91 79849 58806');
  const [companyPhone2, setCompanyPhone2] = useState('+91 97279 70451');
  const [companyAddress, setCompanyAddress] = useState('');
  const [customLogo, setCustomLogo] = useState(null);

  // Currency State
  const [currency, setCurrency] = useState('INR');

  // Discount State
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  // Custom Modules State
  const [customModules, setCustomModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleFeatures, setNewModuleFeatures] = useState('');
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);

  useEffect(() => {
    setNotes(getStoredOrDefault(STORAGE_KEYS.notes, defaultNotes));
    setTermsAndConditions(getStoredOrDefault(STORAGE_KEYS.terms, defaultTermsAndConditions));
    setCustomModules(getStoredModules());
  }, []);

  const saveNotesAsDefault = () => {
    localStorage.setItem(STORAGE_KEYS.notes, notes);
    toast({ title: 'Notes saved as default', description: 'Your notes will be used for future quotations.' });
  };

  const saveTermsAsDefault = () => {
    localStorage.setItem(STORAGE_KEYS.terms, termsAndConditions);
    toast({ title: 'Terms saved as default', description: 'Your terms will be used for future quotations.' });
  };

  const resetNotesToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.notes);
    setNotes(defaultNotes.join('\n'));
    toast({ title: 'Notes reset', description: 'Notes have been reset to original defaults.' });
  };

  const resetTermsToDefault = () => {
    localStorage.removeItem(STORAGE_KEYS.terms);
    setTermsAndConditions(defaultTermsAndConditions.join('\n'));
    toast({ title: 'Terms reset', description: 'Terms have been reset to original defaults.' });
  };

  // Logo Upload Handler
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Please upload an image smaller than 2MB.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogo(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setCustomLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Custom Module Handlers
  const saveCustomModules = (modules) => {
    localStorage.setItem(STORAGE_KEYS.customModules, JSON.stringify(modules));
  };

  const addOrUpdateModule = () => {
    if (!newModuleName.trim()) {
      toast({ title: 'Module name required', variant: 'destructive' });
      return;
    }

    const features = newModuleFeatures.split('\n').filter(f => f.trim());
    const moduleData = {
      id: editingModule?.id || `custom-${Date.now()}`,
      name: newModuleName.trim(),
      features,
      isCustom: true,
    };

    let updatedModules;
    if (editingModule) {
      updatedModules = customModules.map(m => m.id === editingModule.id ? moduleData : m);
    } else {
      updatedModules = [...customModules, moduleData];
      setSelectedModules(prev => [...prev, moduleData.id]);
    }

    setCustomModules(updatedModules);
    saveCustomModules(updatedModules);
    resetModuleForm();
    toast({ title: editingModule ? 'Module updated' : 'Module added' });
  };

  const deleteModule = (moduleId) => {
    const updatedModules = customModules.filter(m => m.id !== moduleId);
    setCustomModules(updatedModules);
    saveCustomModules(updatedModules);
    setSelectedModules(prev => prev.filter(id => id !== moduleId));
    toast({ title: 'Module deleted' });
  };

  const editModule = (module) => {
    setEditingModule(module);
    setNewModuleName(module.name);
    setNewModuleFeatures(module.features.join('\n'));
    setIsModuleDialogOpen(true);
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setNewModuleName('');
    setNewModuleFeatures('');
    setIsModuleDialogOpen(false);
  };

  const companyInfo = {
    name: companyName,
    tagline: companyTagline,
    email: companyEmail,
    website: companyWebsite,
    phone1: companyPhone1,
    phone2: companyPhone2,
    address: companyAddress,
    customLogo,
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  };

  const toggleModule = (moduleId) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const addCustomLineItem = () => {
    setCustomLineItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
      },
    ]);
  };

  const updateCustomLineItem = (id, field, value) => {
    setCustomLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updated.amount = updated.quantity * updated.rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeCustomLineItem = (id) => {
    setCustomLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleGenerate = () => {
    const mainAmount = totalBeds * perBedPrice;
    const mainLineItem = {
      id: 'main',
      description: 'Hospital Management Software',
      quantity: 1,
      rate: mainAmount,
      amount: mainAmount,
    };

    const allLineItems = [mainLineItem, ...customLineItems.filter((item) => item.description)];
    const subtotal = allLineItems.reduce((sum, item) => sum + item.amount, 0);

    // Calculate discount
    const discountAmount = discountType === 'percentage'
      ? (subtotal * discountValue) / 100
      : discountValue;
    const afterDiscount = subtotal - discountAmount;

    const gstAmount = (afterDiscount * gstPercent) / 100;
    const total = afterDiscount + gstAmount;

    const allModules = [...defaultModules, ...customModules];
    const selectedModuleData = allModules.filter((m) =>
      selectedModules.includes(m.id)
    );

    const quotationData = {
      quotationNumber,
      date: formatDate(date),
      validTill: formatDate(validTill),
      clientName: clientName || 'Client Name',
      clientAddress,
      quotationTitle,
      lineItems: allLineItems,
      totalBeds,
      perBedPrice,
      modules: selectedModuleData,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      gstPercent,
      gstAmount,
      total,
      currency,
      termsAndConditions: termsAndConditions.split('\n').filter(term => term.trim()),
      notes: notes.split('\n').filter(note => note.trim()),
      companyInfo,
    };

    onGenerate(quotationData);
  };

  const allModules = [...defaultModules, ...customModules];

  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Collapsible defaultOpen={false}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Company Information</CardTitle>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Custom Logo Upload */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {customLogo ? (
                    <div className="relative">
                      <img src={customLogo} alt="Custom logo" className="h-16 w-auto object-contain border rounded p-1" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={removeLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-16 w-32 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground text-sm">
                      No logo
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-1" />
                      {customLogo ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">Max 2MB, PNG/JPG recommended</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyTagline">Tagline</Label>
                  <Input
                    id="companyTagline"
                    value={companyTagline}
                    onChange={(e) => setCompanyTagline(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone1">Phone 1</Label>
                  <Input
                    id="companyPhone1"
                    value={companyPhone1}
                    onChange={(e) => setCompanyPhone1(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone2">Phone 2</Label>
                  <Input
                    id="companyPhone2"
                    value={companyPhone2}
                    onChange={(e) => setCompanyPhone2(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address (Optional)</Label>
                <Textarea
                  id="companyAddress"
                  placeholder="Enter company address"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Basic Information */}
      <Collapsible defaultOpen={true}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Basic Information</CardTitle>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quotationNumber">Quotation Number</Label>
                  <Input
                    id="quotationNumber"
                    value={quotationNumber}
                    onChange={(e) => setQuotationNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTill">Valid Till</Label>
                  <Input
                    id="validTill"
                    type="date"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Client Information */}
      <Collapsible defaultOpen={true}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Client Information</CardTitle>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client/Hospital Name</Label>
                <Input
                  id="clientName"
                  placeholder="Enter hospital name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientAddress">Address (Optional)</Label>
                <Textarea
                  id="clientAddress"
                  placeholder="Enter address"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quotationTitle">Quotation Title</Label>
                <Input
                  id="quotationTitle"
                  value={quotationTitle}
                  onChange={(e) => setQuotationTitle(e.target.value)}
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Pricing */}
      <Collapsible defaultOpen={true}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display">Pricing</CardTitle>
                <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Currency Selector */}
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.code} - {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalBeds">Total Beds</Label>
                  <Input
                    id="totalBeds"
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perBedPrice">Per Bed Price ({currencies.find(c => c.code === currency)?.symbol})</Label>
                  <Input
                    id="perBedPrice"
                    type="number"
                    value={perBedPrice}
                    onChange={(e) => setPerBedPrice(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstPercent">GST/Tax (%)</Label>
                  <Input
                    id="gstPercent"
                    type="number"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Discount Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select value={discountType} onValueChange={setDiscountType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Discount {discountType === 'percentage' ? '(%)' : `(${currencies.find(c => c.code === currency)?.symbol})`}
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Additional Line Items</h4>
                  <Button variant="outline" size="sm" onClick={addCustomLineItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                {customLineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-5">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                          updateCustomLineItem(item.id, 'description', e.target.value)
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCustomLineItem(item.id, 'quantity', Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) =>
                          updateCustomLineItem(item.id, 'rate', Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={item.amount}
                        readOnly
                        className="bg-secondary"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomLineItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Modules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Select Modules</CardTitle>
          <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => resetModuleForm()}>
                <Plus className="h-4 w-4 mr-1" />
                Add Custom Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingModule ? 'Edit Module' : 'Add Custom Module'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="moduleName">Module Name</Label>
                  <Input
                    id="moduleName"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    placeholder="e.g., Blood Bank Management"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moduleFeatures">Features (one per line)</Label>
                  <Textarea
                    id="moduleFeatures"
                    value={newModuleFeatures}
                    onChange={(e) => setNewModuleFeatures(e.target.value)}
                    placeholder="Enter features, one per line"
                    rows={6}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetModuleForm}>Cancel</Button>
                  <Button onClick={addOrUpdateModule}>
                    {editingModule ? 'Update' : 'Add'} Module
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allModules.map((module) => (
              <div
                key={module.id}
                className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
              >
                <Checkbox
                  id={module.id}
                  checked={selectedModules.includes(module.id)}
                  onCheckedChange={() => toggleModule(module.id)}
                />
                <Label
                  htmlFor={module.id}
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  {module.name}
                  {module.isCustom && (
                    <span className="ml-2 text-xs text-primary">(Custom)</span>
                  )}
                </Label>
                {module.isCustom && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.preventDefault();
                        editModule(module);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        deleteModule(module.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Notes</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetNotesToDefault}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="secondary" size="sm" onClick={saveNotesAsDefault}>
              <Save className="h-4 w-4 mr-1" />
              Save as Default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Enter each note on a new line</Label>
            <Textarea
              id="notes"
              placeholder="Enter notes (one per line)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display">Terms & Conditions</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetTermsToDefault}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button variant="secondary" size="sm" onClick={saveTermsAsDefault}>
              <Save className="h-4 w-4 mr-1" />
              Save as Default
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="terms">Enter each term on a new line</Label>
            <Textarea
              id="terms"
              placeholder="Enter terms and conditions (one per line)"
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleGenerate} className="w-full" size="lg">
        Generate Quotation
      </Button>
    </div>
  );
}