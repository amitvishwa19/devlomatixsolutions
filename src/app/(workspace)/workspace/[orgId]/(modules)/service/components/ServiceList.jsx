import { ServiceCard } from './ServiceCard';

export function ServiceList({ services, onServiceClick }) {
  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No services found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onClick={onServiceClick}
        />
      ))}
    </div>
  );
}
