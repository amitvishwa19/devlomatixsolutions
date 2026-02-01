import React, { forwardRef } from 'react';
import { format } from 'date-fns';

// Hospital details - should match the invoice template
const HOSPITAL_DETAILS = {
  name: 'CareWell Hospital',
  address: '123 Medical Center Drive',
  city: 'Bangalore, Karnataka 560001',
  phone: '+91 80 4567 8900',
  email: 'contact@carewell.com',
  gstin: '29AABCU9603R1ZM',
};

/**
 * Printable Prescription Template with hospital letterhead
 * This component is designed to be printed or converted to PDF
 */
const PrescriptionPrintTemplate = forwardRef(({ prescription, patient, doctor }, ref) => {
  if (!prescription) return null;

  const currentDate = new Date();

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto print:p-0 print:m-0"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Hospital Header / Letterhead */}
      <div className="border-b-2 border-primary pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{HOSPITAL_DETAILS.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{HOSPITAL_DETAILS.address}</p>
            <p className="text-sm text-gray-600">{HOSPITAL_DETAILS.city}</p>
            <div className="flex gap-4 mt-2 text-xs text-gray-600">
              <span>Phone: {HOSPITAL_DETAILS.phone}</span>
              <span>Email: {HOSPITAL_DETAILS.email}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary tracking-wider">℞</div>
            <div className="text-xl font-semibold text-gray-700 mt-1">PRESCRIPTION</div>
          </div>
        </div>
      </div>

      {/* Doctor & Patient Info */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border border-gray-300 rounded p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Prescribing Doctor</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-lg">{doctor?.name || prescription.doctorName || 'Dr. Unknown'}</p>
            <p className="text-gray-600">{doctor?.specialty || prescription.department || 'General Medicine'}</p>
            <p className="text-gray-600 text-xs">Reg. No: {doctor?.regNo || 'KA-MED-12345'}</p>
          </div>
        </div>

        <div className="border border-gray-300 rounded p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Patient Details</h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{patient?.fullName || prescription.patientName}</p>
            <p className="text-gray-600">MRN: {patient?.mrn || prescription.patientId}</p>
            <p className="text-gray-600">
              {patient?.age || prescription.patientAge} yrs, {patient?.gender || prescription.patientGender}
            </p>
            {patient?.phone && <p className="text-gray-600">Phone: {patient.phone}</p>}
          </div>
        </div>
      </div>

      {/* Prescription Details */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex gap-2">
          <span className="text-gray-600">Prescription ID:</span>
          <span className="font-semibold font-mono">{prescription.id}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-600">Date:</span>
          <span className="font-semibold">{format(new Date(prescription.date), 'dd MMM yyyy')}</span>
        </div>
        {prescription.diagnosis && (
          <div className="col-span-2 flex gap-2">
            <span className="text-gray-600">Diagnosis:</span>
            <span className="font-semibold">{prescription.diagnosis}</span>
          </div>
        )}
      </div>

      {/* Medications Table */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-primary text-xl">℞</span> Medications
        </h3>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left w-10">#</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Medicine</th>
              <th className="border border-gray-300 px-3 py-2 text-center w-24">Dosage</th>
              <th className="border border-gray-300 px-3 py-2 text-center w-32">Frequency</th>
              <th className="border border-gray-300 px-3 py-2 text-center w-24">Duration</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Instructions</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines?.map((medicine, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-3 py-3 text-gray-600">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-3">
                  <div className="font-medium">{medicine.name}</div>
                  {medicine.generic && (
                    <div className="text-xs text-gray-500">({medicine.generic})</div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-center font-medium">
                  {medicine.dosage}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-center">
                  <div>{medicine.frequency}</div>
                  {medicine.timing && (
                    <div className="text-xs text-gray-500">{medicine.timing}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-center">
                  {medicine.duration}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-xs text-gray-600">
                  {medicine.instructions || medicine.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Special Instructions */}
      {prescription.notes && (
        <div className="mb-6 border border-gray-300 rounded p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Special Instructions</h3>
          <p className="text-sm whitespace-pre-wrap">{prescription.notes}</p>
        </div>
      )}

      {/* Follow-up */}
      {prescription.followUp && (
        <div className="mb-6 border border-gray-300 rounded p-4 bg-blue-50">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Follow-up</h3>
          <p className="text-sm font-medium">
            Please visit again on: {format(new Date(prescription.followUp), 'dd MMM yyyy')}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 mt-auto">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Important:</p>
            <ul className="list-disc ml-4 space-y-0.5">
              <li>Take medicines as prescribed.</li>
              <li>Complete the full course even if symptoms improve.</li>
              <li>Report any adverse reactions immediately.</li>
              <li>Keep medicines out of reach of children.</li>
            </ul>
          </div>
          <div className="text-right">
            <div className="border-t border-gray-400 pt-2 mt-12 inline-block w-48">
              <p className="text-sm font-medium">{doctor?.name || prescription.doctorName}</p>
              <p className="text-xs text-gray-600">Signature & Stamp</p>
            </div>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 mt-6">
          <p>This is a computer-generated prescription. Valid only with doctor's signature and stamp.</p>
          <p>Generated on: {format(currentDate, 'dd MMM yyyy HH:mm')}</p>
        </div>
      </div>
    </div>
  );
});

PrescriptionPrintTemplate.displayName = 'PrescriptionPrintTemplate';

export { PrescriptionPrintTemplate };
