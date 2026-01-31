import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { topMedications } from '../mockReportingData';

export function TopMedicationsCard() {
  const maxCount = Math.max(...topMedications.map((m) => m.count));

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-base">Top Prescribed Medications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topMedications.slice(0, 6).map((medication, index) => (
            <div key={medication.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {index + 1}. {medication.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({medication.category})
                  </span>
                </div>
                <span className="text-muted-foreground">{medication.count}</span>
              </div>
              <Progress
                value={(medication.count / maxCount) * 100}
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
