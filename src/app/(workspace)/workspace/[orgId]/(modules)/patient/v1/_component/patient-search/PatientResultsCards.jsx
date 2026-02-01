'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function PatientResultsCards({ patients }) {
    const getInsuranceStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-success/10 text-success';
            case 'Pending':
                return 'bg-warning/10 text-warning';
            case 'Expired':
                return 'bg-error/10 text-error';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4">
            {patients?.map((patient) => (
                <div key={patient?.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon name="UserIcon" size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-foreground mb-1">{patient?.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                                <span className="font-mono">{patient?.id}</span>
                                <span>•</span>
                                <span>{patient?.phone}</span>
                            </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getInsuranceStatusColor(patient?.insuranceStatus)}`}>
                            {patient?.insuranceStatus}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <div className="text-xs text-text-secondary mb-1">Date of Birth</div>
                            <div className="text-sm font-medium text-foreground">{patient?.dob}</div>
                        </div>
                        <div>
                            <div className="text-xs text-text-secondary mb-1">Last Visit</div>
                            <div className="text-sm font-medium text-foreground">{patient?.lastVisit}</div>
                        </div>
                        <div className="col-span-2">
                            <div className="text-xs text-text-secondary mb-1">Assigned Provider</div>
                            <div className="text-sm font-medium text-foreground">{patient?.provider}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                        <Link
                            href="/patient-profile"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 ease-out"
                        >
                            <Icon name="UserCircleIcon" size={18} />
                            <span>View Profile</span>
                        </Link>
                        <Link
                            href="/patient-profile"
                            className="p-2 border border-input rounded-lg hover:bg-muted transition-colors duration-200 ease-out"
                            title="Schedule Appointment"
                        >
                            <Icon name="CalendarIcon" size={20} className="text-foreground" />
                        </Link>
                        <button
                            className="p-2 border border-input rounded-lg hover:bg-muted transition-colors duration-200 ease-out"
                            title="Add Note"
                        >
                            <Icon name="DocumentTextIcon" size={20} className="text-foreground" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

PatientResultsCards.propTypes = {
    patients: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.string?.isRequired,
            name: PropTypes?.string?.isRequired,
            phone: PropTypes?.string?.isRequired,
            dob: PropTypes?.string?.isRequired,
            lastVisit: PropTypes?.string?.isRequired,
            provider: PropTypes?.string?.isRequired,
            insuranceStatus: PropTypes?.string?.isRequired
        })
    )?.isRequired
};