import { PrescriptionCard } from './PrescriptionCard';

export function PrescriptionList({ prescriptions, onSelectPrescription }) {
  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No prescriptions found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prescriptions.map((prescription) => (
        <PrescriptionCard
          key={prescription.id}
          prescription={prescription}
          onClick={onSelectPrescription}
        />
      ))}
    </div>
  );
}
