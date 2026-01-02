import { format, isSameDay } from 'date-fns';
import { AppointmentCard } from './AppointmentCard';



const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
});

export function DayView({ currentDate, appointments, onAppointmentClick }) {
    const dayAppointments = appointments.filter(apt => isSameDay(apt.date, currentDate));

    const getAppointmentsForTime = (timeSlot) => {
        const slotHour = parseInt(timeSlot.split(':')[0]);
        return dayAppointments.filter(apt => {
            const aptHour = parseInt(apt.startTime.split(':')[0]);
            return aptHour === slotHour;
        });
    };

    return (
        <div className="bg-card rounded-md border  overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/50">
                <h2 className="text-lg font-semibold text-foreground">
                    {format(currentDate, 'EEEE, MMMM d, yyyy')}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} scheduled
                </p>
            </div>

            <div className="">
                {TIME_SLOTS.map((timeSlot) => {
                    const slotAppointments = getAppointmentsForTime(timeSlot);

                    return (
                        <div
                            key={timeSlot}
                            className="flex border-b border-border last:border-b-0 min-h-[80px]"
                        >
                            <div className="w-20 shrink-0 py-4 px-4 text-sm text-muted-foreground text-right bg-secondary/30 border-r border-border">
                                {timeSlot}
                            </div>
                            <div className="flex-1 p-3 space-y-2">
                                {slotAppointments.map((apt) => (
                                    <AppointmentCard
                                        key={apt.id}
                                        appointment={apt}
                                        onClick={onAppointmentClick}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
