import Icon from '@/components/ui/AppIcon';




export default function ScheduledEmailCard({ emails }) {
    return (
        <div className="bg-card rounded-lg p-6 shadow-elevation-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                    Scheduled Emails
                </h3>
                <Icon name="CalendarIcon" size={20} className="text-primary" />
            </div>
            {emails.length === 0 ? (
                <div className="text-center py-8">
                    <Icon
                        name="CalendarDaysIcon"
                        size={48}
                        className="mx-auto text-muted-foreground mb-2"
                    />
                    <p className="text-sm text-muted-foreground">
                        No scheduled emails
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {emails.slice(0, 2).map((email) => (
                        <div
                            key={email.id}
                            className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-smooth"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-foreground line-clamp-1">
                                    {email.subject}
                                </h4>
                                <Icon
                                    name="ClockIcon"
                                    size={16}
                                    className="text-warning flex-shrink-0 ml-2"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                                {email.template}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center space-x-1">
                                    <Icon name="UsersIcon" size={14} />
                                    <span>{email.recipientCount} recipients</span>
                                </span>
                                <span>{email.scheduledTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}