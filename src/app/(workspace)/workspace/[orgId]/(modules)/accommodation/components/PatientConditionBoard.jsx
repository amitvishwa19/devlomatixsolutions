import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, AlertCircle, TrendingUp, TrendingDown, 
  Heart, Thermometer, Wind, Droplet, CheckCircle
} from 'lucide-react';
import { getRoomTypeById, getBedStatusById } from '../utils/utils';

const PATIENT_CONDITIONS = [
  { id: 'stable', name: 'Stable', color: 'bg-green-500', icon: CheckCircle },
  { id: 'improving', name: 'Improving', color: 'bg-emerald-500', icon: TrendingUp },
  { id: 'guarded', name: 'Guarded', color: 'bg-amber-500', icon: Activity },
  { id: 'serious', name: 'Serious', color: 'bg-orange-500', icon: AlertCircle },
  { id: 'critical', name: 'Critical', color: 'bg-red-500', icon: AlertCircle },
  { id: 'deteriorating', name: 'Deteriorating', color: 'bg-red-600', icon: TrendingDown },
];

const VITAL_INDICATORS = [
  { id: 'heart_rate', name: 'HR', icon: Heart, unit: 'bpm', normalRange: [60, 100] },
  { id: 'temperature', name: 'Temp', icon: Thermometer, unit: '°F', normalRange: [97, 99.5] },
  { id: 'bp_systolic', name: 'BP', icon: Activity, unit: 'mmHg', normalRange: [90, 140] },
  { id: 'spo2', name: 'SpO2', icon: Wind, unit: '%', normalRange: [95, 100] },
];

export function PatientConditionBoard({ rooms, onUpdateCondition }) {
  const [filterCondition, setFilterCondition] = React.useState('all');
  const [filterFloor, setFilterFloor] = React.useState('all');

  // Get all occupied beds with patient data
  const patients = React.useMemo(() => {
    const list = [];
    rooms.forEach(room => {
      room.beds.forEach(bed => {
        if (bed.status === 'occupied' && bed.patient) {
          list.push({
            bed,
            room,
            roomType: getRoomTypeById(room.type),
            condition: bed.patientCondition || 'stable',
            vitals: bed.vitals || generateMockVitals(),
            lastUpdated: bed.conditionUpdatedAt || new Date(),
          });
        }
      });
    });
    return list;
  }, [rooms]);

  const filteredPatients = React.useMemo(() => {
    return patients.filter(p => {
      if (filterCondition !== 'all' && p.condition !== filterCondition) return false;
      if (filterFloor !== 'all' && p.room.floor !== filterFloor) return false;
      return true;
    });
  }, [patients, filterCondition, filterFloor]);

  const conditionStats = React.useMemo(() => {
    const stats = {};
    PATIENT_CONDITIONS.forEach(c => {
      stats[c.id] = patients.filter(p => p.condition === c.id).length;
    });
    return stats;
  }, [patients]);

  const getCondition = (conditionId) => {
    return PATIENT_CONDITIONS.find(c => c.id === conditionId) || PATIENT_CONDITIONS[0];
  };

  const isVitalAbnormal = (indicator, value) => {
    const [min, max] = indicator.normalRange;
    return value < min || value > max;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Patient Condition Board
        </h3>
        <div className="flex items-center gap-2">
          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {PATIENT_CONDITIONS.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Condition Summary */}
      <div className="grid grid-cols-6 gap-2">
        {PATIENT_CONDITIONS.map(condition => {
          const count = conditionStats[condition.id] || 0;
          const Icon = condition.icon;
          return (
            <Card 
              key={condition.id}
              className={`cursor-pointer transition-all ${
                filterCondition === condition.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setFilterCondition(filterCondition === condition.id ? 'all' : condition.id)}
            >
              <CardContent className="p-2 text-center">
                <div className={`w-6 h-6 rounded-full ${condition.color} mx-auto flex items-center justify-center mb-1`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-[10px] text-muted-foreground truncate">{condition.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Patient Cards */}
      <ScrollArea className="h-[calc(100vh-420px)]">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pr-4">
          {filteredPatients.map(({ bed, room, roomType, condition, vitals }) => {
            const conditionInfo = getCondition(condition);
            const ConditionIcon = conditionInfo.icon;
            const hasAbnormalVitals = VITAL_INDICATORS.some(v => 
              vitals[v.id] && isVitalAbnormal(v, vitals[v.id])
            );

            return (
              <Card 
                key={bed.id}
                className={`transition-all hover:shadow-md ${
                  condition === 'critical' || condition === 'deteriorating' 
                    ? 'border-red-300 bg-red-50/30' 
                    : hasAbnormalVitals 
                    ? 'border-amber-300 bg-amber-50/30'
                    : ''
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm truncate">{bed.patient.name}</p>
                      <Badge className={`${roomType.color} text-[10px]`}>{bed.bedNumber}</Badge>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={`w-8 h-8 rounded-full ${conditionInfo.color} flex items-center justify-center`}>
                          <ConditionIcon className="h-4 w-4 text-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{conditionInfo.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Vitals Quick View */}
                  <div className="grid grid-cols-4 gap-1 mt-2">
                    {VITAL_INDICATORS.map(indicator => {
                      const value = vitals[indicator.id];
                      const Icon = indicator.icon;
                      const abnormal = value && isVitalAbnormal(indicator, value);
                      
                      return (
                        <Tooltip key={indicator.id}>
                          <TooltipTrigger>
                            <div className={`p-1 rounded text-center ${abnormal ? 'bg-red-100' : 'bg-muted/50'}`}>
                              <Icon className={`h-3 w-3 mx-auto ${abnormal ? 'text-red-600' : 'text-muted-foreground'}`} />
                              <p className={`text-xs font-medium ${abnormal ? 'text-red-600' : ''}`}>
                                {value || '-'}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{indicator.name}: {value} {indicator.unit}</p>
                            <p className="text-xs text-muted-foreground">
                              Normal: {indicator.normalRange.join('-')}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>

                  {/* Quick Update */}
                  <Select
                    value={condition}
                    onValueChange={(v) => onUpdateCondition?.(bed.id, v)}
                  >
                    <SelectTrigger className="h-7 mt-2 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PATIENT_CONDITIONS.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// Helper function to generate mock vitals
function generateMockVitals() {
  return {
    heart_rate: Math.floor(Math.random() * 40) + 60,
    temperature: (Math.random() * 3 + 97).toFixed(1),
    bp_systolic: Math.floor(Math.random() * 60) + 100,
    spo2: Math.floor(Math.random() * 8) + 93,
  };
}
