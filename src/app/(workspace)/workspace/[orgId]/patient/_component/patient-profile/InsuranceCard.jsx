import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function InsuranceCard({ insurance }) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Icon name="ShieldCheckIcon" size={24} className="text-primary" />
                    Insurance Information
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${insurance?.status === 'Active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                    {insurance?.status}
                </span>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Insurance Provider</label>
                        <div className="text-base font-semibold text-foreground">{insurance?.provider}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Plan Type</label>
                        <div className="text-base text-foreground">{insurance?.planType}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Policy Number</label>
                        <div className="text-base text-foreground font-mono">{insurance?.policyNumber}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Group Number</label>
                        <div className="text-base text-foreground font-mono">{insurance?.groupNumber}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Effective Date</label>
                        <div className="text-base text-foreground">{insurance?.effectiveDate}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Expiration Date</label>
                        <div className="text-base text-foreground">{insurance?.expirationDate}</div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">Coverage Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Copay</label>
                            <div className="text-base font-semibold text-foreground">{insurance?.copay}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Deductible</label>
                            <div className="text-base font-semibold text-foreground">{insurance?.deductible}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Out-of-Pocket Max</label>
                            <div className="text-base font-semibold text-foreground">{insurance?.outOfPocketMax}</div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">Subscriber Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Subscriber Name</label>
                            <div className="text-base text-foreground">{insurance?.subscriberName}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Relationship to Patient</label>
                            <div className="text-base text-foreground">{insurance?.relationshipToPatient}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Subscriber DOB</label>
                            <div className="text-base text-foreground">{insurance?.subscriberDOB}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Subscriber ID</label>
                            <div className="text-base text-foreground font-mono">{insurance?.subscriberId}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

InsuranceCard.propTypes = {
    insurance: PropTypes?.shape({
        provider: PropTypes?.string?.isRequired,
        planType: PropTypes?.string?.isRequired,
        policyNumber: PropTypes?.string?.isRequired,
        groupNumber: PropTypes?.string?.isRequired,
        effectiveDate: PropTypes?.string?.isRequired,
        expirationDate: PropTypes?.string?.isRequired,
        status: PropTypes?.string?.isRequired,
        copay: PropTypes?.string?.isRequired,
        deductible: PropTypes?.string?.isRequired,
        outOfPocketMax: PropTypes?.string?.isRequired,
        subscriberName: PropTypes?.string?.isRequired,
        relationshipToPatient: PropTypes?.string?.isRequired,
        subscriberDOB: PropTypes?.string?.isRequired,
        subscriberId: PropTypes?.string?.isRequired
    })?.isRequired
};