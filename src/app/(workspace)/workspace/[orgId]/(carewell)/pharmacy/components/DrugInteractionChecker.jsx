import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, AlertCircle, Info, Search, Plus, X, 
  ShieldAlert, CheckCircle, Pill, FileWarning, Zap, Activity
} from 'lucide-react';

// Mock drug interaction database
const DRUG_INTERACTIONS = [
  { drug1: 'Warfarin', drug2: 'Aspirin', severity: 'severe', description: 'Increased risk of bleeding', recommendation: 'Avoid combination or monitor closely' },
  { drug1: 'Metformin', drug2: 'Iodinated Contrast', severity: 'severe', description: 'Risk of lactic acidosis', recommendation: 'Hold metformin 48 hours before/after contrast' },
  { drug1: 'Ciprofloxacin', drug2: 'Theophylline', severity: 'severe', description: 'Increased theophylline levels', recommendation: 'Reduce theophylline dose by 50%' },
  { drug1: 'Amlodipine', drug2: 'Simvastatin', severity: 'moderate', description: 'Increased simvastatin exposure', recommendation: 'Limit simvastatin to 20mg daily' },
  { drug1: 'Omeprazole', drug2: 'Clopidogrel', severity: 'moderate', description: 'Reduced antiplatelet effect', recommendation: 'Consider alternative PPI' },
  { drug1: 'Metformin', drug2: 'Alcohol', severity: 'moderate', description: 'Increased risk of hypoglycemia', recommendation: 'Limit alcohol consumption' },
  { drug1: 'ACE Inhibitors', drug2: 'Potassium', severity: 'moderate', description: 'Risk of hyperkalemia', recommendation: 'Monitor potassium levels' },
  { drug1: 'NSAIDs', drug2: 'Lithium', severity: 'moderate', description: 'Increased lithium levels', recommendation: 'Monitor lithium levels closely' },
  { drug1: 'Paracetamol', drug2: 'Alcohol', severity: 'mild', description: 'Increased hepatotoxicity risk with chronic use', recommendation: 'Limit alcohol with regular paracetamol use' },
  { drug1: 'Antacids', drug2: 'Azithromycin', severity: 'mild', description: 'Reduced absorption', recommendation: 'Separate doses by 2 hours' },
];

// Mock allergy alerts
const ALLERGY_ALERTS = [
  { allergy: 'Penicillin', crossReactive: ['Amoxicillin', 'Ampicillin', 'Cephalosporins'], severity: 'severe' },
  { allergy: 'Sulfa', crossReactive: ['Sulfamethoxazole', 'Sulfasalazine', 'Celecoxib'], severity: 'severe' },
  { allergy: 'Aspirin', crossReactive: ['NSAIDs', 'Ibuprofen', 'Naproxen'], severity: 'moderate' },
  { allergy: 'Codeine', crossReactive: ['Morphine', 'Tramadol', 'Oxycodone'], severity: 'moderate' },
];

export function DrugInteractionChecker({ inventory, patientAllergies = [] }) {
  const [selectedDrugs, setSelectedDrugs] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [interactions, setInteractions] = React.useState([]);
  const [allergyWarnings, setAllergyWarnings] = React.useState([]);

  // Filter available drugs based on search
  const filteredDrugs = React.useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return inventory
      .filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.genericName?.toLowerCase().includes(query)
      )
      .slice(0, 10);
  }, [inventory, searchQuery]);

  // Check interactions when drugs change
  React.useEffect(() => {
    if (selectedDrugs.length < 2) {
      setInteractions([]);
      return;
    }

    const foundInteractions = [];
    for (let i = 0; i < selectedDrugs.length; i++) {
      for (let j = i + 1; j < selectedDrugs.length; j++) {
        const drug1 = selectedDrugs[i];
        const drug2 = selectedDrugs[j];
        
        DRUG_INTERACTIONS.forEach(interaction => {
          const d1Names = [drug1.name, drug1.genericName, drug1.category].filter(Boolean);
          const d2Names = [drug2.name, drug2.genericName, drug2.category].filter(Boolean);
          
          const match1 = d1Names.some(n => 
            n.toLowerCase().includes(interaction.drug1.toLowerCase()) ||
            interaction.drug1.toLowerCase().includes(n.toLowerCase())
          );
          const match2 = d2Names.some(n => 
            n.toLowerCase().includes(interaction.drug2.toLowerCase()) ||
            interaction.drug2.toLowerCase().includes(n.toLowerCase())
          );
          
          if ((match1 && match2) || (d1Names.some(n => n.toLowerCase().includes(interaction.drug2.toLowerCase())) && d2Names.some(n => n.toLowerCase().includes(interaction.drug1.toLowerCase())))) {
            foundInteractions.push({
              ...interaction,
              drugs: [drug1.name, drug2.name],
            });
          }
        });
      }
    }
    setInteractions(foundInteractions);
  }, [selectedDrugs]);

  // Check allergy warnings
  React.useEffect(() => {
    if (selectedDrugs.length === 0 || patientAllergies.length === 0) {
      setAllergyWarnings([]);
      return;
    }

    const warnings = [];
    selectedDrugs.forEach(drug => {
      patientAllergies.forEach(allergy => {
        const allergyData = ALLERGY_ALERTS.find(a => 
          a.allergy.toLowerCase() === allergy.toLowerCase()
        );
        
        if (allergyData) {
          const isContraindicated = allergyData.crossReactive.some(cr =>
            drug.name.toLowerCase().includes(cr.toLowerCase()) ||
            drug.genericName?.toLowerCase().includes(cr.toLowerCase())
          );
          
          if (isContraindicated) {
            warnings.push({
              drug: drug.name,
              allergy: allergy,
              severity: allergyData.severity,
              crossReactive: allergyData.crossReactive,
            });
          }
        }
      });
    });
    setAllergyWarnings(warnings);
  }, [selectedDrugs, patientAllergies]);

  const addDrug = (drug) => {
    if (!selectedDrugs.find(d => d.id === drug.id)) {
      setSelectedDrugs(prev => [...prev, drug]);
    }
    setSearchQuery('');
    setShowSearch(false);
  };

  const removeDrug = (drugId) => {
    setSelectedDrugs(prev => prev.filter(d => d.id !== drugId));
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'severe':
        return { 
          color: 'bg-red-100 border-red-300 dark:bg-red-950/50 dark:border-red-800', 
          icon: ShieldAlert, 
          iconColor: 'text-red-600',
          badge: 'destructive'
        };
      case 'moderate':
        return { 
          color: 'bg-amber-100 border-amber-300 dark:bg-amber-950/50 dark:border-amber-800', 
          icon: AlertTriangle, 
          iconColor: 'text-amber-600',
          badge: 'warning'
        };
      default:
        return { 
          color: 'bg-blue-100 border-blue-300 dark:bg-blue-950/50 dark:border-blue-800', 
          icon: Info, 
          iconColor: 'text-blue-600',
          badge: 'secondary'
        };
    }
  };

  const hasIssues = interactions.length > 0 || allergyWarnings.length > 0;
  const hasSevere = interactions.some(i => i.severity === 'severe') || allergyWarnings.some(w => w.severity === 'severe');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Drug Interaction Checker
            </CardTitle>
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              Real-time Analysis
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Drugs */}
          <div>
            <label className="text-sm font-medium mb-2 block">Selected Medications</label>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-muted/30 rounded-lg border border-dashed">
              {selectedDrugs.map(drug => (
                <Badge 
                  key={drug.id} 
                  variant="secondary" 
                  className="gap-1 pl-2 pr-1 py-1"
                >
                  <Pill className="w-3 h-3" />
                  {drug.name}
                  <button 
                    onClick={() => removeDrug(drug.id)}
                    className="ml-1 p-0.5 hover:bg-muted rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {selectedDrugs.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  Add medications to check for interactions...
                </span>
              )}
            </div>
          </div>

          {/* Add Drug */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search and add medications..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showSearch && filteredDrugs.length > 0 && (
              <Card className="absolute z-10 w-full mt-1 shadow-lg">
                <ScrollArea className="max-h-[200px]">
                  {filteredDrugs.map(drug => (
                    <button
                      key={drug.id}
                      onClick={() => addDrug(drug)}
                      className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm">{drug.name}</p>
                        <p className="text-xs text-muted-foreground">{drug.genericName}</p>
                      </div>
                      <Plus className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ))}
                </ScrollArea>
              </Card>
            )}
          </div>

          {/* Status Indicator */}
          {selectedDrugs.length >= 2 && (
            <div className={`p-4 rounded-lg border ${
              hasSevere 
                ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900' 
                : hasIssues 
                  ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900' 
                  : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
            }`}>
              <div className="flex items-center gap-3">
                {hasSevere ? (
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                ) : hasIssues ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                )}
                <div>
                  <p className={`font-semibold ${
                    hasSevere ? 'text-red-700 dark:text-red-400' : hasIssues ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                  }`}>
                    {hasSevere 
                      ? 'Severe Interactions Detected!' 
                      : hasIssues 
                        ? 'Potential Interactions Found' 
                        : 'No Interactions Detected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {interactions.length} interaction(s), {allergyWarnings.length} allergy warning(s)
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactions List */}
      {interactions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileWarning className="w-4 h-4" />
              Drug-Drug Interactions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {interactions.map((interaction, idx) => {
              const config = getSeverityConfig(interaction.severity);
              const Icon = config.icon;
              
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg border ${config.color}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{interaction.drugs.join(' + ')}</span>
                        <Badge variant={config.badge} className="text-xs capitalize">
                          {interaction.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{interaction.description}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Recommendation:</strong> {interaction.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Allergy Warnings */}
      {allergyWarnings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              Allergy Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allergyWarnings.map((warning, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-lg border bg-red-100 border-red-300 dark:bg-red-950/50 dark:border-red-800"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      {warning.drug} — Patient allergic to {warning.allergy}!
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cross-reactive with: {warning.crossReactive.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {selectedDrugs.length < 2 && (
        <Card className="bg-muted/30">
          <CardContent className="p-6 text-center">
            <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-2">How to Use</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Add at least 2 medications to check for potential drug-drug interactions. 
              The system will automatically analyze and alert you of any known interactions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
