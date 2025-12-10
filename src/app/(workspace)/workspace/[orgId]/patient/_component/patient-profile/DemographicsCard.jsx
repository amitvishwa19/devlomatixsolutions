import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function DemographicsCard({ demographics }) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Icon name="UserCircleIcon" size={24} className="text-primary" />
                    Demographics & Contact
                </h2>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                        <div className="text-base text-foreground">{demographics?.fullName}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Date of Birth</label>
                        <div className="text-base text-foreground">{demographics?.dateOfBirth}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Gender</label>
                        <div className="text-base text-foreground">{demographics?.gender}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Marital Status</label>
                        <div className="text-base text-foreground">{demographics?.maritalStatus}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Social Security Number</label>
                        <div className="text-base text-foreground font-mono">{demographics?.ssn}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Preferred Language</label>
                        <div className="text-base text-foreground">{demographics?.language}</div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Primary Phone</label>
                            <div className="text-base text-foreground">{demographics?.primaryPhone}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Secondary Phone</label>
                            <div className="text-base text-foreground">{demographics?.secondaryPhone}</div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                            <div className="text-base text-foreground">{demographics?.email}</div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-2">Home Address</label>
                            <div className="text-base text-foreground">{demographics?.address}</div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Contact Name</label>
                            <div className="text-base text-foreground">{demographics?.emergencyContact?.name}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Relationship</label>
                            <div className="text-base text-foreground">{demographics?.emergencyContact?.relationship}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                            <div className="text-base text-foreground">{demographics?.emergencyContact?.phone}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                            <div className="text-base text-foreground">{demographics?.emergencyContact?.email}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

DemographicsCard.propTypes = {
    demographics: PropTypes?.shape({
        fullName: PropTypes?.string?.isRequired,
        dateOfBirth: PropTypes?.string?.isRequired,
        gender: PropTypes?.string?.isRequired,
        maritalStatus: PropTypes?.string?.isRequired,
        ssn: PropTypes?.string?.isRequired,
        language: PropTypes?.string?.isRequired,
        primaryPhone: PropTypes?.string?.isRequired,
        secondaryPhone: PropTypes?.string?.isRequired,
        email: PropTypes?.string?.isRequired,
        address: PropTypes?.string?.isRequired,
        emergencyContact: PropTypes?.shape({
            name: PropTypes?.string?.isRequired,
            relationship: PropTypes?.string?.isRequired,
            phone: PropTypes?.string?.isRequired,
            email: PropTypes?.string?.isRequired
        })?.isRequired
    })?.isRequired
};