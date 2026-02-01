import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function InsuranceClaimsPanel({ claims, onProcessClaim }) {
    const getClaimStatusColor = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-success/10 text-success';
            case 'Pending':
                return 'bg-warning/10 text-warning';
            case 'Denied':
                return 'bg-error/10 text-error';
            case 'Under Review':
                return 'bg-primary/10 text-primary';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg">
            <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Insurance Claims</h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium">
                        <Icon name="PlusIcon" size={16} />
                        <span>New Claim</span>
                    </button>
                </div>
            </div>
            <div className="divide-y divide-border">
                {claims?.map((claim) => (
                    <div key={claim?.id} className="p-6 hover:bg-muted/30 transition-colors duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon name="ShieldCheckIcon" size={24} className="text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground mb-1">{claim?.patientName}</h3>
                                    <p className="text-xs text-text-secondary mb-2">Claim ID: {claim?.claimId}</p>
                                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                                        <span className="flex items-center gap-1">
                                            <Icon name="CalendarIcon" size={14} />
                                            {claim?.submissionDate}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Icon name="BuildingOfficeIcon" size={14} />
                                            {claim?.insuranceProvider}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getClaimStatusColor(claim?.status)}`}>
                                {claim?.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-text-secondary mb-1">Claim Amount</p>
                                <p className="text-sm font-semibold text-foreground">{claim?.claimAmount}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary mb-1">Approved Amount</p>
                                <p className="text-sm font-semibold text-foreground">{claim?.approvedAmount}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-secondary mb-1">Patient Responsibility</p>
                                <p className="text-sm font-semibold text-foreground">{claim?.patientResponsibility}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onProcessClaim(claim?.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
                            >
                                <Icon name="DocumentCheckIcon" size={16} />
                                <span>Process Claim</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors duration-200 text-sm font-medium text-foreground">
                                <Icon name="DocumentTextIcon" size={16} />
                                <span>View Details</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

InsuranceClaimsPanel.propTypes = {
    claims: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            claimId: PropTypes?.string?.isRequired,
            patientName: PropTypes?.string?.isRequired,
            submissionDate: PropTypes?.string?.isRequired,
            insuranceProvider: PropTypes?.string?.isRequired,
            status: PropTypes?.string?.isRequired,
            claimAmount: PropTypes?.string?.isRequired,
            approvedAmount: PropTypes?.string?.isRequired,
            patientResponsibility: PropTypes?.string?.isRequired
        })
    )?.isRequired,
    onProcessClaim: PropTypes?.func?.isRequired
};