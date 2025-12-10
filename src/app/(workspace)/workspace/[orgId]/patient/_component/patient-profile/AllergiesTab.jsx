import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { mockPatientData } from './PatientProfilePage';

export default function AllergiesTab() {
    const allergies = mockPatientData.allergies

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Severe':
                return 'bg-error text-error-foreground';
            case 'Moderate':
                return 'bg-warning text-warning-foreground';
            case 'Mild':
                return 'bg-success text-success-foreground';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'Severe':
                return 'ExclamationTriangleIcon';
            case 'Moderate':
                return 'ExclamationCircleIcon';
            case 'Mild':
                return 'InformationCircleIcon';
            default:
                return 'InformationCircleIcon';
        }
    };

    return (
        <div className="space-y-4 w-full">
            {allergies?.length > 0 ? (
                allergies?.map((allergy) => (
                    <div key={allergy?.id} className="bg-card border border-border rounded-lg p-5 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getSeverityColor(allergy?.severity)}`}>
                                <Icon name={getSeverityIcon(allergy?.severity)} size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                    <div>
                                        <h3 className="text-base font-semibold text-foreground mb-1">{allergy?.allergen}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSeverityColor(allergy?.severity)}`}>
                                                {allergy?.severity}
                                            </span>
                                            <span className="text-xs text-text-secondary">{allergy?.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-text-secondary mb-1">Reaction</div>
                                        <div className="text-sm text-foreground">{allergy?.reaction}</div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-text-secondary mb-1">First Occurrence</div>
                                            <div className="text-sm text-foreground">{allergy?.firstOccurrence}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-text-secondary mb-1">Last Occurrence</div>
                                            <div className="text-sm text-foreground">{allergy?.lastOccurrence}</div>
                                        </div>
                                    </div>

                                    {allergy?.notes && (
                                        <div>
                                            <div className="text-xs text-text-secondary mb-1">Additional Notes</div>
                                            <div className="text-sm text-foreground">{allergy?.notes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="CheckCircleIcon" size={32} className="text-success" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">No Known Allergies</h3>
                    <p className="text-sm text-text-secondary">This patient has no recorded allergies in the system.</p>
                </div>
            )}
        </div>
    );
}

AllergiesTab.propTypes = {
    allergies: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        allergen: PropTypes?.string?.isRequired,
        type: PropTypes?.string?.isRequired,
        severity: PropTypes?.string?.isRequired,
        reaction: PropTypes?.string?.isRequired,
        firstOccurrence: PropTypes?.string?.isRequired,
        lastOccurrence: PropTypes?.string?.isRequired,
        notes: PropTypes?.string
    }))?.isRequired
};