import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { mockPatientData } from './PatientProfilePage';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '../../../(misc)/_components/CustomBadge';

export default function VisitHistoryTab() {
    const visits = mockPatientData.visitHistory

    const getVisitTypeColor = (type) => {
        switch (type) {
            case 'Emergency':
                return 'bg-error/10 text-error';
            case 'Follow-up':
                return 'bg-primary/10 text-primary';
            case 'Routine':
                return 'bg-success/10 text-success';
            case 'Consultation':
                return 'bg-accent/10 text-accent';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                {visits?.map((visit, index) => (
                    <div key={visit?.id} className="relative pl-16 pb-8 last:pb-0">
                        <div className="absolute left-3 top-0 w-6 h-6 bg-primary rounded-full border-4 border-background flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                        </div>

                        <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-base font-semibold text-foreground">{visit?.date}</h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getVisitTypeColor(visit?.type)}`}>
                                            {visit?.type}
                                        </span>
                                    </div>
                                    <div className="text-sm text-text-secondary">{visit?.provider} • {visit?.department}</div>
                                </div>
                                <Button variant={'outline'} size={'sm'} className="">
                                    View Details
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-xs text-text-secondary mb-1">Chief Complaint</div>
                                    <div className="text-sm text-foreground">{visit?.chiefComplaint}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-text-secondary mb-1">Diagnosis</div>
                                    <div className="text-sm text-foreground">{visit?.diagnosis}</div>
                                </div>

                                <div>
                                    <div className="text-xs text-text-secondary mb-1">Treatment</div>
                                    <div className="text-sm text-foreground">{visit?.treatment}</div>
                                </div>

                                {visit?.prescriptions && visit?.prescriptions?.length > 0 && (
                                    <div>
                                        <div className="text-xs text-text-secondary mb-2">Prescriptions</div>
                                        <div className="flex flex-wrap gap-2">
                                            {visit?.prescriptions?.map((prescription, idx) => (
                                                <CustomBadge status='progress' key={idx} className="inline-flex items-center px-3 py-1 bg-muted rounded-full text-xs text-foreground">
                                                    {prescription}
                                                </CustomBadge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {visit?.labTests && visit?.labTests?.length > 0 && (
                                    <div>
                                        <div className="text-xs text-text-secondary mb-2">Lab Tests Ordered</div>
                                        <div className="flex flex-wrap gap-2">
                                            {visit?.labTests?.map((test, idx) => (
                                                <CustomBadge status='info' key={idx} className="info inline-flex items-center px-3 py-1 bg-accent/10 text-accent rounded-full text-xs">
                                                    {test}
                                                </CustomBadge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {visit?.followUp && (
                                    <div className="pt-3 border-t border-border">
                                        <div className="flex items-start gap-2">
                                            <Icon name="CalendarIcon" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-xs text-text-secondary mb-1">Follow-up Scheduled</div>
                                                <div className="text-sm text-foreground">{visit?.followUp}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

VisitHistoryTab.propTypes = {
    visits: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        date: PropTypes?.string?.isRequired,
        type: PropTypes?.string?.isRequired,
        provider: PropTypes?.string?.isRequired,
        department: PropTypes?.string?.isRequired,
        chiefComplaint: PropTypes?.string?.isRequired,
        diagnosis: PropTypes?.string?.isRequired,
        treatment: PropTypes?.string?.isRequired,
        prescriptions: PropTypes?.arrayOf(PropTypes?.string),
        labTests: PropTypes?.arrayOf(PropTypes?.string),
        followUp: PropTypes?.string
    }))?.isRequired
};