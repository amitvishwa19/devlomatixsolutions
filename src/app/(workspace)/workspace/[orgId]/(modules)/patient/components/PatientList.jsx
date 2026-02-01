import { PatientCard } from './PatientCard';

export function PatientList({ patients, onPatientClick }) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">No patients found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {patients.map((patient) => (
        <PatientCard
          key={patient.id}
          patient={patient}
          onClick={onPatientClick}
        />
      ))}
    </div>
  );
}
