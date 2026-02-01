import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function InteractiveWalkthrough({ walkthrough }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  if (!walkthrough || !walkthrough.steps || walkthrough.steps.length === 0) return null;

  const steps = walkthrough.steps;
  const progress = (completedSteps.length / steps.length) * 100;

  const handleNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const handleStepClick = (index) => {
    setCurrentStep(index);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>📚</span>
            {walkthrough.title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{completedSteps.length} of {steps.length} completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {steps.map((step, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                currentStep === index
                  ? 'bg-primary text-primary-foreground'
                  : completedSteps.includes(index)
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
            >
              {completedSteps.includes(index) ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3.5 h-3.5" />
              )}
              Step {index + 1}
            </button>
          ))}
        </div>

        {/* Current step content */}
        <div className="p-6 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary">{currentStep + 1}</span>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">{steps[currentStep].title}</h3>
              <p className="text-muted-foreground">{steps[currentStep].description}</p>
              {steps[currentStep].tip && (
                <div className="mt-3 p-3 rounded-md bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary">💡 Tip: {steps[currentStep].tip}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1 && completedSteps.includes(currentStep)}
            className="gap-1"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
