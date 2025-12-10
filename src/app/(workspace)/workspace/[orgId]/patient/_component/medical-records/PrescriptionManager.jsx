'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function PrescriptionManager({ prescriptions }) {
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [showInteractions, setShowInteractions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-accent bg-accent/10';
      case 'expired':
        return 'text-text-secondary bg-muted';
      case 'discontinued':
        return 'text-error bg-error/10';
      default:
        return 'text-text-secondary bg-muted';
    }
  };

  const handleMedicationClick = (medication) => {
    setSelectedMedication(medication);
  };

  const handleCloseDetails = () => {
    setSelectedMedication(null);
  };

  const handleRenew = (medicationId) => {
    console.log('Renewing prescription:', medicationId);
  };

  const handleDiscontinue = (medicationId) => {
    console.log('Discontinuing prescription:', medicationId);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Current Medications</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInteractions(!showInteractions)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${showInteractions
                ? 'bg-warning/10 text-warning' : 'bg-muted text-text-secondary hover:bg-muted/80'
              }`}
          >
            <Icon name="ExclamationTriangleIcon" size={16} />
            <span>Interactions</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors duration-200">
            <Icon name="PlusIcon" size={16} />
            <span>New Prescription</span>
          </button>
        </div>
      </div>
      {showInteractions && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="ExclamationTriangleIcon" size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-warning mb-2">Drug Interaction Warning</h3>
              <p className="text-sm text-foreground mb-2">
                Potential interaction detected between Lisinopril and Ibuprofen. May increase risk of kidney problems.
              </p>
              <button className="text-sm text-warning hover:text-warning/80 font-medium">
                View Full Interaction Report →
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {prescriptions?.map((prescription) => (
          <div
            key={prescription?.id}
            className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            onClick={() => handleMedicationClick(prescription)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">{prescription?.medication}</h3>
                <p className="text-sm text-text-secondary">{prescription?.dosage}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription?.status)}`}>
                {prescription?.status?.charAt(0)?.toUpperCase() + prescription?.status?.slice(1)}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="ClockIcon" size={16} className="text-text-secondary" />
                <span className="text-foreground">{prescription?.frequency}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="CalendarIcon" size={16} className="text-text-secondary" />
                <span className="text-foreground">Started: {prescription?.startDate}</span>
              </div>
              {prescription?.renewalDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="ArrowPathIcon" size={16} className="text-text-secondary" />
                  <span className="text-foreground">Renewal: {prescription?.renewalDate}</span>
                </div>
              )}
            </div>

            {prescription?.status === 'active' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleRenew(prescription?.id);
                  }}
                  className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors duration-200"
                >
                  Renew
                </button>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    handleDiscontinue(prescription?.id);
                  }}
                  className="flex-1 px-3 py-2 bg-error/10 text-error rounded-lg text-sm font-medium hover:bg-error/20 transition-colors duration-200"
                >
                  Discontinue
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {selectedMedication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Medication Details</h2>
              <button
                onClick={handleCloseDetails}
                className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
              >
                <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{selectedMedication?.medication}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMedication?.status)}`}>
                  {selectedMedication?.status?.charAt(0)?.toUpperCase() + selectedMedication?.status?.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background p-4 rounded-lg">
                  <span className="text-xs font-medium text-text-secondary block mb-1">Dosage</span>
                  <span className="text-base font-semibold text-foreground">{selectedMedication?.dosage}</span>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <span className="text-xs font-medium text-text-secondary block mb-1">Frequency</span>
                  <span className="text-base font-semibold text-foreground">{selectedMedication?.frequency}</span>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <span className="text-xs font-medium text-text-secondary block mb-1">Start Date</span>
                  <span className="text-base font-semibold text-foreground">{selectedMedication?.startDate}</span>
                </div>
                <div className="bg-background p-4 rounded-lg">
                  <span className="text-xs font-medium text-text-secondary block mb-1">Prescribed By</span>
                  <span className="text-base font-semibold text-foreground">{selectedMedication?.prescribedBy}</span>
                </div>
              </div>

              {selectedMedication?.instructions && (
                <div className="bg-background p-4 rounded-lg">
                  <span className="text-sm font-medium text-text-secondary block mb-2">Instructions</span>
                  <p className="text-sm text-foreground">{selectedMedication?.instructions}</p>
                </div>
              )}

              {selectedMedication?.sideEffects && (
                <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                  <span className="text-sm font-medium text-warning block mb-2">Possible Side Effects</span>
                  <p className="text-sm text-foreground">{selectedMedication?.sideEffects}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

PrescriptionManager.propTypes = {
  prescriptions: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.string?.isRequired,
      medication: PropTypes?.string?.isRequired,
      dosage: PropTypes?.string?.isRequired,
      frequency: PropTypes?.string?.isRequired,
      status: PropTypes?.oneOf(['active', 'expired', 'discontinued'])?.isRequired,
      startDate: PropTypes?.string?.isRequired,
      renewalDate: PropTypes?.string,
      prescribedBy: PropTypes?.string?.isRequired,
      instructions: PropTypes?.string,
      sideEffects: PropTypes?.string
    })
  )?.isRequired
};