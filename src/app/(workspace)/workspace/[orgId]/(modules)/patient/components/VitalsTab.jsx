import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Heart, Activity, Thermometer, Wind, Scale, TrendingUp, TrendingDown, Minus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { VITAL_TYPES } from '../utils/types';
import { useToast } from '@/hooks/use-toast';
import { useFormValidationToast } from '../../hooks/useFormValidationToast';


const VITAL_ICONS = {
  blood_pressure: Heart,
  heart_rate: Activity,
  temperature: Thermometer,
  oxygen_saturation: Wind,
  respiratory_rate: Wind,
  weight: Scale,
  height: Scale,
  bmi: Scale,
};

// Zod schema for vitals form
const vitalsSchema = z.object({
  blood_pressure_systolic: z.string().optional(),
  blood_pressure_diastolic: z.string().optional(),
  heart_rate: z.string().optional(),
  temperature: z.string().optional(),
  oxygen_saturation: z.string().optional(),
  respiratory_rate: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(),
}).refine(data => {
  // At least one vital must be provided
  return Object.values(data).some(v => v && v.trim() !== '');
}, { message: 'Please enter at least one vital sign' });

export function VitalsTab({ patient, onUpdatePatient }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVitalType, setSelectedVitalType] = useState('blood_pressure');
  const [showChart, setShowChart] = useState(false);
  const { toast } = useToast();
  const { showValidationErrors } = useFormValidationToast();

  const form = useForm({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      blood_pressure_systolic: '',
      blood_pressure_diastolic: '',
      heart_rate: '',
      temperature: '',
      oxygen_saturation: '',
      respiratory_rate: '',
      weight: '',
      height: '',
    },
  });

  const vitals = patient?.vitals || [];

  const getLatestVital = (type) => {
    return vitals.filter(v => v.type === type).sort((a, b) =>
      new Date(b.recordedAt) - new Date(a.recordedAt)
    )[0];
  };

  const getChartData = () => {
    const typeVitals = vitals
      .filter(v => v.type === selectedVitalType)
      .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt))
      .slice(-10);

    return typeVitals.map(v => ({
      date: format(new Date(v.recordedAt), 'dd/MM'),
      value: selectedVitalType === 'blood_pressure'
        ? parseInt(v.value.split('/')[0])
        : parseFloat(v.value),
      diastolic: selectedVitalType === 'blood_pressure'
        ? parseInt(v.value.split('/')[1])
        : null,
    }));
  };

  const onSubmit = (data) => {
    console.log('Vitals Form Data:', data);

    const newVitalsArray = [];
    const now = new Date();

    if (data.blood_pressure_systolic && data.blood_pressure_diastolic) {
      newVitalsArray.push({
        type: 'blood_pressure',
        value: `${data.blood_pressure_systolic}/${data.blood_pressure_diastolic}`,
        recordedAt: now,
      });
    }
    if (data.heart_rate) {
      newVitalsArray.push({ type: 'heart_rate', value: data.heart_rate, recordedAt: now });
    }
    if (data.temperature) {
      newVitalsArray.push({ type: 'temperature', value: data.temperature, recordedAt: now });
    }
    if (data.oxygen_saturation) {
      newVitalsArray.push({ type: 'oxygen_saturation', value: data.oxygen_saturation, recordedAt: now });
    }
    if (data.respiratory_rate) {
      newVitalsArray.push({ type: 'respiratory_rate', value: data.respiratory_rate, recordedAt: now });
    }
    if (data.weight) {
      newVitalsArray.push({ type: 'weight', value: data.weight, recordedAt: now });
    }
    if (data.height) {
      newVitalsArray.push({ type: 'height', value: data.height, recordedAt: now });
    }

    if (newVitalsArray.length === 0) {
      toast({ title: 'No vitals entered', description: 'Please enter at least one vital sign.', variant: 'destructive' });
      return;
    }

    const updatedPatient = {
      ...patient,
      vitals: [...(patient.vitals || []), ...newVitalsArray],
    };

    onUpdatePatient?.(updatedPatient);
    toast({ title: 'Vitals recorded', description: `${newVitalsArray.length} vital sign(s) recorded successfully.` });

    form.reset();
    setShowAddDialog(false);
  };

  const getTrendIcon = (type) => {
    const typeVitals = vitals.filter(v => v.type === type).sort((a, b) =>
      new Date(b.recordedAt) - new Date(a.recordedAt)
    );

    if (typeVitals.length < 2) return <Minus className="w-3 h-3 text-muted-foreground" />;

    const latest = parseFloat(typeVitals[0].value.split('/')[0] || typeVitals[0].value);
    const previous = parseFloat(typeVitals[1].value.split('/')[0] || typeVitals[1].value);

    if (latest > previous) return <TrendingUp className="w-3 h-3 text-amber-500" />;
    if (latest < previous) return <TrendingDown className="w-3 h-3 text-green-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const selectedVitalInfo = VITAL_TYPES.find(v => v.id === selectedVitalType);

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Vital Signs</h4>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showChart ? "default" : "outline"}
            className="gap-1"
            onClick={() => setShowChart(!showChart)}
          >
            <TrendingUp className="w-3 h-3" />
            {showChart ? 'Hide Chart' : 'Show Trends'}
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-3 h-3" />
            Record Vitals
          </Button>
        </div>
      </div>

      {/* Chart Section */}
      {showChart && (
        <div className="p-4 bg-secondary/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-medium">Vital Trends</h5>
            <Select value={selectedVitalType} onValueChange={setSelectedVitalType}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VITAL_TYPES.filter(v => !['height', 'bmi'].includes(v.id)).map((vital) => (
                  <SelectItem key={vital.id} value={vital.id}>{vital.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {getChartData().length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name={selectedVitalType === 'blood_pressure' ? 'Systolic' : selectedVitalInfo?.label}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
                {selectedVitalType === 'blood_pressure' && (
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    name="Diastolic"
                    dot={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data available for this vital type</p>
          )}
        </div>
      )}

      {/* Latest Vitals Grid */}
      <div className="grid grid-cols-2 gap-4">
        {VITAL_TYPES.filter(v => !['bmi'].includes(v.id)).map((vitalType) => {
          const latest = getLatestVital(vitalType.id);
          const Icon = VITAL_ICONS[vitalType.id] || Heart;

          return (
            <div key={vitalType.id} className="p-4 bg-secondary/30 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">{vitalType.label}</p>
                </div>
                {latest && getTrendIcon(vitalType.id)}
              </div>
              <p className="text-xl font-bold text-foreground">
                {latest ? (
                  <>
                    {latest.value} <span className="text-sm font-normal text-muted-foreground">{vitalType.unit}</span>
                  </>
                ) : (
                  <span className="text-sm font-normal text-muted-foreground">Not recorded</span>
                )}
              </p>
              {latest && (
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(latest.recordedAt), 'dd MMM, HH:mm')}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Normal: {vitalType.normalRange}
              </p>
            </div>
          );
        })}
      </div>

      {/* Vitals History */}
      {vitals.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium">Recent Recordings</h5>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vitals
              .sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
              .slice(0, 10)
              .map((vital, index) => {
                const vitalType = VITAL_TYPES.find(v => v.id === vital.type);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded border border-border text-sm">
                    <span className="font-medium">{vitalType?.label}</span>
                    <span>{vital.value} {vitalType?.unit}</span>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(vital.recordedAt), 'dd MMM HH:mm')}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add Vitals Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Record Vital Signs
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, showValidationErrors)} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="blood_pressure_systolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Blood Pressure (Systolic)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="120" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="blood_pressure_diastolic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Blood Pressure (Diastolic)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="80" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heart_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="72" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Temperature (°F)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="98.6" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="oxygen_saturation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">SpO2 (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="98" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="respiratory_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Respiratory Rate (/min)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="16" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="70" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Height (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="175" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save Vitals
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
