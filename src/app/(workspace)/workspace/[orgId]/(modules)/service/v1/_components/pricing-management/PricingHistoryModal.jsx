'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const PricingHistoryModal = ({ isOpen, onClose, service, historyData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Pricing History</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {service?.serviceName} ({service?.serviceCode})
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {historyData?.map((entry, index) => (
                            <div
                                key={entry?.id}
                                className={`border border-border rounded-lg p-4 ${index === 0 ? 'bg-accent/5' : 'bg-card'}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${index === 0 ? 'bg-accent/20' : 'bg-muted'}`}>
                                            <Icon
                                                name={entry?.action === 'Created' ? 'PlusCircleIcon' : 'PencilSquareIcon'}
                                                size={20}
                                                className={index === 0 ? 'text-accent' : 'text-muted-foreground'}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{entry?.action}</p>
                                            <p className="text-xs text-muted-foreground">{entry?.date}</p>
                                        </div>
                                    </div>
                                    {index === 0 && (
                                        <span className="px-2 py-1 text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-md">
                                            Current
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Base Price</p>
                                        <p className="text-sm font-medium text-foreground">${entry?.basePrice?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Insurance Rate</p>
                                        <p className="text-sm font-medium text-foreground">${entry?.insuranceRate?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Discount</p>
                                        <p className="text-sm font-medium text-accent">{entry?.discount}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Status</p>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${entry?.status === 'Active' ? 'bg-success/10 text-success border border-success/20' : 'bg-muted text-muted-foreground border border-border'
                                                }`}
                                        >
                                            {entry?.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <Icon name="UserCircleIcon" size={16} className="text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Modified by: {entry?.modifiedBy}</span>
                                    </div>
                                    {entry?.notes && (
                                        <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                                            <Icon name="DocumentTextIcon" size={14} />
                                            View Notes
                                        </button>
                                    )}
                                </div>

                                {entry?.changes && entry?.changes?.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-border">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Changes:</p>
                                        <div className="space-y-1">
                                            {entry?.changes?.map((change, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs">
                                                    <Icon name="ArrowRightIcon" size={12} className="text-muted-foreground" />
                                                    <span className="text-muted-foreground">{change}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

PricingHistoryModal.propTypes = {
    isOpen: PropTypes?.bool?.isRequired,
    onClose: PropTypes?.func?.isRequired,
    service: PropTypes?.shape({
        serviceName: PropTypes?.string,
        serviceCode: PropTypes?.string,
    }),
    historyData: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            action: PropTypes?.string?.isRequired,
            date: PropTypes?.string?.isRequired,
            basePrice: PropTypes?.number?.isRequired,
            insuranceRate: PropTypes?.number?.isRequired,
            discount: PropTypes?.number?.isRequired,
            status: PropTypes?.string?.isRequired,
            modifiedBy: PropTypes?.string?.isRequired,
            notes: PropTypes?.string,
            changes: PropTypes?.arrayOf(PropTypes?.string),
        })
    )?.isRequired,
};

export default PricingHistoryModal;