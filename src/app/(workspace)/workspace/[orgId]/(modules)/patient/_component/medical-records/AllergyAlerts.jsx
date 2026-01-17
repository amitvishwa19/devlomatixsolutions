import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function AllergyAlerts({ allergies }) {
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'severe':
                return 'bg-error/10 text-error border-error/20';
            case 'moderate':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'mild':
                return 'bg-primary/10 text-primary border-primary/20';
            default:
                return 'bg-muted text-text-secondary border-border';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'severe':
                return 'ExclamationTriangleIcon';
            case 'moderate':
                return 'ExclamationCircleIcon';
            case 'mild':
                return 'InformationCircleIcon';
            default:
                return 'InformationCircleIcon';
        }
    };

    if (!allergies || allergies?.length === 0) {
        return (
            <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Icon name="ShieldCheckIcon" size={20} className="text-accent" />
                    <h2 className="text-lg font-semibold text-foreground">Allergies & Alerts</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                        <Icon name="ShieldCheckIcon" size={32} className="text-accent" />
                    </div>
                    <p className="text-sm text-text-secondary">No known allergies recorded</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <Icon name="ExclamationTriangleIcon" size={20} className="text-error" />
                <h2 className="text-lg font-semibold text-foreground">Allergies & Alerts</h2>
            </div>
            <div className="space-y-3">
                {allergies?.map((allergy) => (
                    <div
                        key={allergy?.id}
                        className={`p-4 rounded-lg border-2 ${getSeverityColor(allergy?.severity)}`}
                    >
                        <div className="flex items-start gap-3">
                            <Icon name={getSeverityIcon(allergy?.severity)} size={20} className="flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-base font-semibold">{allergy?.allergen}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-current/10">
                                        {allergy?.severity?.charAt(0)?.toUpperCase() + allergy?.severity?.slice(1)}
                                    </span>
                                </div>
                                <p className="text-sm mb-2">{allergy?.reaction}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <span>Diagnosed: {allergy?.diagnosedDate}</span>
                                    {allergy?.verifiedBy && <span>Verified by: {allergy?.verifiedBy}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

AllergyAlerts.propTypes = {
    allergies: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            allergen: PropTypes?.string?.isRequired,
            reaction: PropTypes?.string?.isRequired,
            severity: PropTypes?.oneOf(['mild', 'moderate', 'severe'])?.isRequired,
            diagnosedDate: PropTypes?.string?.isRequired,
            verifiedBy: PropTypes?.string
        })
    )?.isRequired
};