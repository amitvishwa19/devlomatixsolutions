import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { mockPatientData } from './PatientProfilePage';

export default function MedicationsTab() {
    const medications = mockPatientData.medications
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-success/10 text-success';
            case 'Discontinued':
                return 'bg-muted text-text-secondary';
            case 'Expiring Soon':
                return 'bg-warning/10 text-warning';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    return (
        <div className="space-y-4 w-full">
            {medications?.map((medication) => (
                <div key={medication?.id} className="bg-card border border-border rounded-lg p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-base font-semibold text-foreground">{medication?.name}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(medication?.status)}`}>
                                    {medication?.status}
                                </span>
                            </div>
                            <div className="text-sm text-text-secondary">{medication?.dosage} • {medication?.frequency}</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors duration-200 ease-out" title="Edit medication">
                                <Icon name="PencilIcon" size={18} className="text-text-secondary" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors duration-200 ease-out" title="View history">
                                <Icon name="ClockIcon" size={18} className="text-text-secondary" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <div className="text-xs text-text-secondary mb-1">Prescribed By</div>
                            <div className="text-sm text-foreground font-medium">{medication?.prescribedBy}</div>
                        </div>
                        <div>
                            <div className="text-xs text-text-secondary mb-1">Start Date</div>
                            <div className="text-sm text-foreground">{medication?.startDate}</div>
                        </div>
                        <div>
                            <div className="text-xs text-text-secondary mb-1">Refills Remaining</div>
                            <div className="text-sm text-foreground">{medication?.refillsRemaining}</div>
                        </div>
                        <div>
                            <div className="text-xs text-text-secondary mb-1">Next Refill Date</div>
                            <div className="text-sm text-foreground">{medication?.nextRefillDate}</div>
                        </div>
                    </div>

                    {medication?.notes && (
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-xs text-text-secondary mb-1">Notes</div>
                            <div className="text-sm text-foreground">{medication?.notes}</div>
                        </div>
                    )}

                    {medication?.status === 'Expiring Soon' && (
                        <div className="mt-4 flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                            <Icon name="ExclamationTriangleIcon" size={18} className="text-warning flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-foreground">
                                Prescription expires on {medication?.nextRefillDate}. Please schedule a refill appointment.
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

MedicationsTab.propTypes = {
    medications: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        name: PropTypes?.string?.isRequired,
        dosage: PropTypes?.string?.isRequired,
        frequency: PropTypes?.string?.isRequired,
        status: PropTypes?.string?.isRequired,
        prescribedBy: PropTypes?.string?.isRequired,
        startDate: PropTypes?.string?.isRequired,
        refillsRemaining: PropTypes?.string?.isRequired,
        nextRefillDate: PropTypes?.string?.isRequired,
        notes: PropTypes?.string
    }))?.isRequired
};