import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function PatientHeader({ patient }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return 'bg-success/10 text-success';
            case 'Inactive':
                return 'bg-muted text-text-secondary';
            case 'Critical':
                return 'bg-error/10 text-error';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today?.getFullYear() - birthDate?.getFullYear();
        const monthDiff = today?.getMonth() - birthDate?.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today?.getDate() < birthDate?.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-primary/20">
                        <AppImage
                            src={patient?.avatar}
                            alt={patient?.avatarAlt}
                            className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-card ${patient?.status === 'Active' ? 'bg-success' : 'bg-muted'
                            }`} />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-foreground">{patient?.name}</h1>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient?.status)}`}>
                                    {patient?.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                                <span className="flex items-center gap-1.5">
                                    <Icon name="IdentificationIcon" size={16} />
                                    <span className="font-mono">{patient?.mrn}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Icon name="CalendarIcon" size={16} />
                                    <span>{calculateAge(patient?.dob)} years old</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Icon name="UserIcon" size={16} />
                                    <span>{patient?.gender}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="PhoneIcon" size={20} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs text-text-secondary mb-0.5">Phone</div>
                                <div className="text-sm font-medium text-foreground truncate">{patient?.phone}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="EnvelopeIcon" size={20} className="text-accent" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs text-text-secondary mb-0.5">Email</div>
                                <div className="text-sm font-medium text-foreground truncate">{patient?.email}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="MapPinIcon" size={20} className="text-warning" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs text-text-secondary mb-0.5">Blood Type</div>
                                <div className="text-sm font-medium text-foreground">{patient?.bloodType}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                            <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="HeartIcon" size={20} className="text-error" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs text-text-secondary mb-0.5">Last Visit</div>
                                <div className="text-sm font-medium text-foreground">{patient?.lastVisit}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {patient?.alerts && patient?.alerts?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-start gap-3 p-3 bg-error/5 border border-error/20 rounded-lg">
                        <Icon name="ExclamationTriangleIcon" size={20} className="text-error flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-error mb-1">Medical Alerts</div>
                            <div className="space-y-1">
                                {patient?.alerts?.map((alert, index) => (
                                    <div key={index} className="text-sm text-foreground">{alert}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

PatientHeader.propTypes = {
    patient: PropTypes?.shape({
        name: PropTypes?.string?.isRequired,
        mrn: PropTypes?.string?.isRequired,
        dob: PropTypes?.string?.isRequired,
        gender: PropTypes?.string?.isRequired,
        phone: PropTypes?.string?.isRequired,
        email: PropTypes?.string?.isRequired,
        bloodType: PropTypes?.string?.isRequired,
        lastVisit: PropTypes?.string?.isRequired,
        status: PropTypes?.string?.isRequired,
        avatar: PropTypes?.string?.isRequired,
        avatarAlt: PropTypes?.string?.isRequired,
        alerts: PropTypes?.arrayOf(PropTypes?.string)
    })?.isRequired
};