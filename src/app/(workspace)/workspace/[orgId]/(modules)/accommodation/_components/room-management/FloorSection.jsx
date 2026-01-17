import { FloorRoomCard } from './FloorRoomCard';

export function FloorSection({ floor, rooms, onRoomClick }) {
    return (
        <section className="mb-8">
            <h3 className="font-display font-bold text-xl mb-4">Floor {floor}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {rooms.map((room) => (
                    <FloorRoomCard
                        key={room.id}
                        room={room}
                        onClick={onRoomClick}
                    />
                ))}
            </div>
        </section>
    );
}
