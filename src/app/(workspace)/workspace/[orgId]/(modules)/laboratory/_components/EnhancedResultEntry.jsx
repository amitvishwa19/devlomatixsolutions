import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
  User, 
  TestTube, 
  Calendar, 
  Stethoscope, 
  FileText,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pending', variant: 'pending' },
  processing: { label: 'Processing', variant: 'processing' },
  completed: { label: 'Completed', variant: 'completed' },
};

export function EnhancedResultEntry({ order, open, onOpenChange, onUpdateOrder, onCriticalAlert }) {
  const [resultParametersByTest, setResultParametersByTest] = useState({});
  const [resultNote, setResultNote] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [validatedBy, setValidatedBy] = useState('');
  const [activeTestTab, setActiveTestTab] = useState('');

  useEffect(() => {
    if (order && open) {
      const paramsByTest = {};
      
      order.tests.forEach(test => {
        if (order.resultParameters) {
          const testParams = order.resultParameters.filter(rp => 
            test.parameters?.some(p => p.id === rp.parameterId)
          );
          if (testParams.length > 0) {
            paramsByTest[test.id] = testParams;
          }
        }
        
        if (!paramsByTest[test.id] && test.parameters) {
          paramsByTest[test.id] = test.parameters.map(param => ({
            parameterId: param.id,
            name: param.name,
            value: '',
            unit: param.unit,
            normalRange: param.normalRangeMin !== undefined && param.normalRangeMax !== undefined
              ? `${param.normalRangeMin} - ${param.normalRangeMax}`
              : param.normalRangeText || '-',
            isAbnormal: false,
          }));
        }
      });
      
      setResultParametersByTest(paramsByTest);
      setResultNote(order.resultNote || '');
      setTechnicianName(order.technicianName || '');
      setValidatedBy(order.validatedBy || '');
      setActiveTestTab(order.tests[0]?.id || '');
    }
  }, [order?.id, open]);

  if (!order) return null;

  const handleValueChange = (testId, parameterId, value) => {
    setResultParametersByTest(prev => {
      const testParams = prev[testId] || [];
      return {
        ...prev,
        [testId]: testParams.map(param => {
          if (param.parameterId !== parameterId) return param;
          
          const test = order.tests.find(t => t.id === testId);
          const testParam = test?.parameters?.find(p => p.id === parameterId);
          let isAbnormal = false;
          let flag;
          
          if (testParam && value) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              if (testParam.criticalMin !== undefined && numValue < testParam.criticalMin) {
                isAbnormal = true;
                flag = 'critical';
              } else if (testParam.criticalMax !== undefined && numValue > testParam.criticalMax) {
                isAbnormal = true;
                flag = 'critical';
              } else if (testParam.normalRangeMin !== undefined && numValue < testParam.normalRangeMin) {
                isAbnormal = true;
                flag = 'low';
              } else if (testParam.normalRangeMax !== undefined && numValue > testParam.normalRangeMax) {
                isAbnormal = true;
                flag = 'high';
              }
            }
          }
          
          return { ...param, value, isAbnormal, flag };
        })
      };
    });
  };

  const allResultParameters = Object.values(resultParametersByTest).flat();
  const hasAbnormalResults = allResultParameters.some(p => p.isAbnormal);
  const hasCriticalResults = allResultParameters.some(p => p.flag === 'critical');
  const allFieldsFilled = allResultParameters.every(p => p.value.trim() !== '');

  const handleSaveResult = () => {
    if (!allFieldsFilled) {
      toast.error('Please fill in all parameter values');
      return;
    }
    if (!technicianName) {
      toast.error('Please enter technician name');
      return;
    }

    const criticalParams = allResultParameters.filter(p => p.flag === 'critical');
    const alerts = criticalParams.map(p => ({
      id: crypto.randomUUID(),
      orderId: order.orderId,
      patientName: order.patient.name,
      testName: order.tests.find(t => t.parameters?.some(tp => tp.id === p.parameterId))?.testName || '',
      parameterName: p.name,
      value: `${p.value} ${p.unit}`,
      criticalRange: p.normalRange,
      flag: parseFloat(p.value) < parseFloat(p.normalRange.split(' - ')[0]) ? 'critical-low' : 'critical-high',
      createdAt: new Date(),
    }));

    alerts.forEach(alert => {
      onCriticalAlert?.(alert);
    });

    const resultString = allResultParameters
      .map(p => `${p.name}: ${p.value} ${p.unit}${p.isAbnormal ? ` (${p.flag?.toUpperCase()})` : ''}`)
      .join(', ');

    onUpdateOrder(order.id, {
      result: resultString,
      resultNote,
      resultParameters: allResultParameters,
      technicianName,
      validatedBy,
      validatedAt: validatedBy ? new Date() : undefined,
      status: 'completed',
      completedAt: new Date(),
      criticalAlerts: alerts.length > 0 ? alerts : undefined,
    });
    
    if (hasCriticalResults) {
      toast.warning('Critical values detected! Notify physician immediately.', {
        duration: 10000,
        icon: <Bell className="h-5 w-5 text-destructive" />,
      });
    } else {
      toast.success('Results saved successfully');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl">Enter Lab Results</span>
            <div className="flex items-center gap-2">
              {hasCriticalResults && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Critical
                </Badge>
              )}
              <Badge variant={statusConfig[order.status].variant}>
                {statusConfig[order.status].label}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">{order.patient.name}</p>
                <p className="text-sm text-muted-foreground">{order.patient.mrn}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-info/10 text-info">
                <TestTube className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tests</p>
                <p className="font-medium">{order.tests.length} test(s)</p>
                <p className="text-sm text-muted-foreground">{order.tests.map(t => t.testCode).join(', ')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Specimen</p>
                <p className="font-medium">{order.specimenId}</p>
                <p className="text-sm text-muted-foreground">
                  Collected: {format(order.collectedAt, 'MMM dd, HH:mm')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/10 text-success">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ordered By</p>
                <p className="font-medium">{order.orderedBy}</p>
              </div>
            </div>
          </div>

          {order.status !== 'pending' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Test Parameters</h3>
              </div>

              {order.tests.length > 1 ? (
                <Tabs value={activeTestTab} onValueChange={setActiveTestTab}>
                  <TabsList className="bg-muted/50">
                    {order.tests.map(test => (
                      <TabsTrigger key={test.id} value={test.id} className="text-xs">
                        {test.testCode}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {order.tests.map(test => (
                    <TabsContent key={test.id} value={test.id} className="space-y-3 mt-4">
                      <ParameterList
                        parameters={resultParametersByTest[test.id] || []}
                        testId={test.id}
                        onValueChange={handleValueChange}
                        disabled={order.status === 'completed'}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <ParameterList
                  parameters={resultParametersByTest[order.tests[0]?.id] || []}
                  testId={order.tests[0]?.id || ''}
                  onValueChange={handleValueChange}
                  disabled={order.status === 'completed'}
                />
              )}

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label>Clinical Notes / Interpretation</Label>
                  <Textarea
                    value={resultNote}
                    onChange={(e) => setResultNote(e.target.value)}
                    placeholder="Add clinical notes, interpretation, or recommendations..."
                    className="bg-input border-border min-h-[80px]"
                    disabled={order.status === 'completed'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Technician Name *</Label>
                    <Input
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      placeholder="Enter technician name"
                      className="bg-input border-border"
                      disabled={order.status === 'completed'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Validated By (Optional)</Label>
                    <Input
                      value={validatedBy}
                      onChange={(e) => setValidatedBy(e.target.value)}
                      placeholder="Pathologist/Supervisor name"
                      className="bg-input border-border"
                      disabled={order.status === 'completed'}
                    />
                  </div>
                </div>

                {order.status === 'processing' && (
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      {hasAbnormalResults && (
                        <Badge variant="warning">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {allResultParameters.filter(p => p.isAbnormal).length} abnormal value(s)
                        </Badge>
                      )}
                    </div>
                    <Button 
                      onClick={handleSaveResult} 
                      variant={hasCriticalResults ? 'destructive' : 'success'}
                      disabled={!allFieldsFilled}
                    >
                      {hasCriticalResults ? 'Complete (Critical Alert)' : 'Complete & Save Results'}
                    </Button>
                  </div>
                )}

                {order.completedAt && (
                  <p className="text-sm text-muted-foreground pt-2">
                    Completed: {format(order.completedAt, 'MMM dd, yyyy HH:mm')}
                    {order.validatedAt && ` • Validated: ${format(order.validatedAt, 'MMM dd, yyyy HH:mm')}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {order.status === 'pending' && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>This order is still pending. Start processing to enter results.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ParameterList({ parameters, testId, onValueChange, disabled }) {
  return (
    <div className="space-y-3">
      {parameters.map((param) => (
        <div 
          key={param.parameterId} 
          className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
            param.flag === 'critical' 
              ? 'bg-destructive/10 border-destructive/50' 
              : param.isAbnormal 
                ? 'bg-warning/10 border-warning/50' 
                : 'bg-muted/30 border-border'
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{param.name}</span>
              {param.flag && (
                <Badge 
                  variant={param.flag === 'critical' ? 'destructive' : 'warning'}
                  className="text-xs"
                >
                  {param.flag === 'high' && <ArrowUp className="h-3 w-3 mr-1" />}
                  {param.flag === 'low' && <ArrowDown className="h-3 w-3 mr-1" />}
                  {param.flag === 'critical' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {param.flag.toUpperCase()}
                </Badge>
              )}
              {param.value && !param.isAbnormal && (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Normal: {param.normalRange} {param.unit}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={param.value}
              onChange={(e) => onValueChange(testId, param.parameterId, e.target.value)}
              placeholder="Value"
              className={`w-24 bg-input border-border text-center ${
                param.isAbnormal ? 'font-bold' : ''
              }`}
              disabled={disabled}
            />
            <span className="text-sm text-muted-foreground w-16">{param.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
