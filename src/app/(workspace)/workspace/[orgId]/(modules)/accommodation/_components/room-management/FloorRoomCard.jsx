const roomTypeLabels = {
    general: 'General',
    icu: 'Icu',
    private: 'Private',
    'semi-private': 'Semi Private',
    emergency: 'Emergency',
    maternity: 'Maternity',
    pediatric: 'Pediatric',
};

const statusStyles = {
    available: { border: 'border-success', dot: 'bg-success' },
    occupied: { border: 'border-warning', dot: 'bg-warning' },
    reserved: { border: 'border-primary', dot: 'bg-primary' },
    maintenance: { border: 'border-amber-500', dot: 'bg-amber-500' },
};

export function FloorRoomCard({ room, onClick }) {
    return (
        <div
            className="bg-card rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onClick?.(room)}
        >
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-display font-semibold">Room {room.roomNumber}</h4>
                <span className="text-xs text-muted-foreground capitalize">
                    {roomTypeLabels[room.roomType]}
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {room.beds.map((bed, index) => {
                    const styles = statusStyles[bed.status];
                    return (
                        <div
                            key={bed.id}
                            className={`relative flex items-center justify-center px-3 py-1.5 rounded-md border-2 ${styles.border} bg-muted/50 min-w-[48px]`}
                        >
                            <span className="text-xs font-medium">B{index + 1}</span>
                            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${styles.dot}`} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
