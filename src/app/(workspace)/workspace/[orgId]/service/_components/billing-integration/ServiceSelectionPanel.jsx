'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ServiceSelectionPanel = ({ services, selectedServices, onAddService, onRemoveService, onUpdateQuantity }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Consultation', 'Diagnostic', 'Laboratory', 'Procedure', 'Emergency'];

    const filteredServices = services?.filter(service => {
        const matchesSearch = service?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
            service?.code?.toLowerCase()?.includes(searchQuery?.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || service?.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAddService = (service) => {
        onAddService({
            ...service,
            quantity: 1,
            subtotal: service?.price
        });
    };

    const isServiceSelected = (serviceId) => {
        return selectedServices?.some(s => s?.id === serviceId);
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Add Services</h3>

                <div className="space-y-3">
                    <div className="relative">
                        <Icon name="MagnifyingGlassIcon" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e?.target?.value)}
                            placeholder="Search services or codes..."
                            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories?.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${selectedCategory === category
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {filteredServices?.length > 0 ? (
                    <div className="divide-y divide-border">
                        {filteredServices?.map(service => (
                            <div key={service?.id} className="p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-medium text-foreground truncate">{service?.name}</h4>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                                                {service?.code}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-2">{service?.description}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Icon name="TagIcon" size={14} />
                                                {service?.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon name="ClockIcon" size={14} />
                                                {service?.duration}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-lg font-bold text-foreground whitespace-nowrap">
                                            ${service?.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                        {isServiceSelected(service?.id) ? (
                                            <button
                                                onClick={() => onRemoveService(service?.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-error bg-error/10 border border-error/20 rounded-md hover:bg-error/20 transition-colors"
                                            >
                                                <Icon name="MinusCircleIcon" size={16} />
                                                Remove
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleAddService(service)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                                            >
                                                <Icon name="PlusCircleIcon" size={16} />
                                                Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Icon name="MagnifyingGlassIcon" size={48} className="mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">No services found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

ServiceSelectionPanel.propTypes = {
    services: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        name: PropTypes?.string?.isRequired,
        code: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        category: PropTypes?.string?.isRequired,
        price: PropTypes?.number?.isRequired,
        duration: PropTypes?.string?.isRequired
    }))?.isRequired,
    selectedServices: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        quantity: PropTypes?.number?.isRequired,
        subtotal: PropTypes?.number?.isRequired
    }))?.isRequired,
    onAddService: PropTypes?.func?.isRequired,
    onRemoveService: PropTypes?.func?.isRequired,
    onUpdateQuantity: PropTypes?.func?.isRequired
};

export default ServiceSelectionPanel;