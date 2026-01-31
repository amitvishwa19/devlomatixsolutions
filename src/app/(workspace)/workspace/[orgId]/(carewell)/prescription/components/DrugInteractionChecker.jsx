import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info, ShieldAlert, X, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DRUG_INTERACTIONS_DB } from '../drugInteractionsData';

export function DrugInteractionChecker({ open, onOpenChange, medicines = [], patientMedications = [] }) {
  const [interactions, setInteractions] = useState([]);
  const [searchMed, setSearchMed] = useState('');
  const [checkedMeds, setCheckedMeds] = useState([]);

  // Combine new prescriptions with existing patient medications
  useEffect(() => {
    const allMeds = [...medicines.map(m => m.name), ...patientMedications.map(m => m.name)];
    setCheckedMeds(allMeds);
    checkInteractions(allMeds);
  }, [medicines, patientMedications]);

  const checkInteractions = (medList) => {
    const found = [];
    
    // Check each pair of medications
    for (let i = 0; i < medList.length; i++) {
      for (let j = i + 1; j < medList.length; j++) {
        const med1 = medList[i].toLowerCase();
        const med2 = medList[j].toLowerCase();
        
        // Check in database
        const interaction = DRUG_INTERACTIONS_DB.find(
          int => (int.drug1.toLowerCase() === med1 && int.drug2.toLowerCase() === med2) ||
                 (int.drug1.toLowerCase() === med2 && int.drug2.toLowerCase() === med1)
        );
        
        if (interaction) {
          found.push({
            ...interaction,
            drugA: medList[i],
            drugB: medList[j],
          });
        }
      }
    }
    
    setInteractions(found);
  };

  const handleAddMed = () => {
    if (searchMed && !checkedMeds.includes(searchMed)) {
      const newMeds = [...checkedMeds, searchMed];
      setCheckedMeds(newMeds);
      checkInteractions(newMeds);
      setSearchMed('');
    }
  };

  const handleRemoveMed = (med) => {
    const newMeds = checkedMeds.filter(m => m !== med);
    setCheckedMeds(newMeds);
    checkInteractions(newMeds);
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'severe':
        return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100', label: 'Severe' };
      case 'moderate':
        return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Moderate' };
      case 'minor':
        return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Minor' };
      default:
        return { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }
  };

  const severeCount = interactions.filter(i => i.severity === 'severe').length;
  const moderateCount = interactions.filter(i => i.severity === 'moderate').length;
  const minorCount = interactions.filter(i => i.severity === 'minor').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            Drug Interaction Checker
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add medication */}
          <div className="flex gap-2">
            <Input
              placeholder="Add medication to check..."
              value={searchMed}
              onChange={(e) => setSearchMed(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMed()}
            />
            <Button onClick={handleAddMed} variant="outline" className="gap-1">
              <Search className="w-4 h-4" />
              Check
            </Button>
          </div>

          {/* Current medications */}
          <div className="flex flex-wrap gap-2">
            {checkedMeds.map((med) => (
              <Badge key={med} variant="secondary" className="gap-1 pr-1">
                {med}
                <button
                  onClick={() => handleRemoveMed(med)}
                  className="ml-1 rounded-full hover:bg-secondary p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Summary */}
          <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
            {interactions.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">No interactions detected</span>
              </div>
            ) : (
              <>
                <span className="text-sm font-medium">Found {interactions.length} interaction(s):</span>
                {severeCount > 0 && (
                  <Badge className="bg-red-100 text-red-700">{severeCount} Severe</Badge>
                )}
                {moderateCount > 0 && (
                  <Badge className="bg-amber-100 text-amber-700">{moderateCount} Moderate</Badge>
                )}
                {minorCount > 0 && (
                  <Badge className="bg-blue-100 text-blue-700">{minorCount} Minor</Badge>
                )}
              </>
            )}
          </div>

          {/* Interactions list */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-3 pr-4">
              {interactions
                .sort((a, b) => {
                  const order = { severe: 0, moderate: 1, minor: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((interaction, index) => {
                  const config = getSeverityConfig(interaction.severity);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        interaction.severity === 'severe' 
                          ? 'border-red-300 bg-red-50 dark:bg-red-950/20' 
                          : interaction.severity === 'moderate'
                          ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20'
                          : 'border-blue-300 bg-blue-50 dark:bg-blue-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <config.icon className={`w-5 h-5 ${config.color}`} />
                          <span className="font-semibold">
                            {interaction.drugA} + {interaction.drugB}
                          </span>
                        </div>
                        <Badge className={`${config.bg} ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {interaction.description}
                      </p>
                      <div className="text-xs">
                        <span className="font-medium">Recommendation: </span>
                        <span className="text-muted-foreground">{interaction.recommendation}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
