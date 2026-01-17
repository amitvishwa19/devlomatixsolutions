'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const InvoiceBuilder = ({ selectedServices, patientInfo, onUpdateService, onRemoveService, onApplyDiscount, onGenerateInvoice }) => {
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentPlan, setPaymentPlan] = useState('full');

    const subtotal = selectedServices?.reduce((sum, service) => sum + service?.subtotal, 0);
    const taxRate = 0.08;
    const discountAmount = discountType === 'percentage'
        ? (subtotal * (parseFloat(discountValue) || 0)) / 100
        : parseFloat(discountValue) || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * taxRate;
    const total = taxableAmount + taxAmount;

    const handleQuantityChange = (serviceId, newQuantity) => {
        const quantity = Math.max(1, parseInt(newQuantity) || 1);
        onUpdateService(serviceId, quantity);
    };

    const handleApplyDiscount = () => {
        if (discountValue) {
            onApplyDiscount({
                type: discountType,
                value: parseFloat(discountValue),
                amount: discountAmount
            });
        }
    };

    const handleGenerateInvoice = () => {
        onGenerateInvoice({
            services: selectedServices,
            subtotal,
            discount: discountAmount,
            tax: taxAmount,
            total,
            notes,
            paymentPlan
        });
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Invoice Builder</h3>
                        {patientInfo && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Patient: {patientInfo?.name} (ID: {patientInfo?.id})
                            </p>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {new Date()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
            </div>
            <div className="p-4 space-y-4">
                {selectedServices?.length > 0 ? (
                    <>
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground">Selected Services</h4>
                            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                                {selectedServices?.map(service => (
                                    <div key={service?.id} className="p-3 bg-background">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h5 className="text-sm font-medium text-foreground">{service?.name}</h5>
                                                    <span className="text-xs text-muted-foreground">({service?.code})</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{service?.category}</p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs text-muted-foreground">Qty:</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={service?.quantity}
                                                        onChange={(e) => handleQuantityChange(service?.id, e?.target?.value)}
                                                        className="w-16 px-2 py-1 text-sm text-center bg-background border border-input rounded focus:outline-none focus:ring-2 focus:ring-ring"
                                                    />
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        ${service?.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        ${service?.price?.toFixed(2)} each
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => onRemoveService(service?.id)}
                                                    className="p-1 text-error hover:bg-error/10 rounded transition-colors"
                                                    aria-label="Remove service"
                                                >
                                                    <Icon name="XMarkIcon" size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-sm font-semibold text-foreground">Discount</h4>
                            <div className="flex gap-2">
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e?.target?.value)}
                                    className="px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ($)</option>
                                </select>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e?.target?.value)}
                                    placeholder="Enter discount"
                                    className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <button
                                    onClick={handleApplyDiscount}
                                    className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-sm font-semibold text-foreground">Payment Plan</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {['full', 'installment', 'insurance']?.map(plan => (
                                    <button
                                        key={plan}
                                        onClick={() => setPaymentPlan(plan)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${paymentPlan === plan
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        {plan?.charAt(0)?.toUpperCase() + plan?.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="text-sm font-semibold text-foreground">Notes</h4>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e?.target?.value)}
                                placeholder="Add billing notes or special instructions..."
                                rows={3}
                                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            />
                        </div>

                        <div className="border-t border-border pt-4 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium text-foreground">
                                    ${subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span className="font-medium text-success">
                                        -${discountAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Tax (8%)</span>
                                <span className="font-medium text-foreground">
                                    ${taxAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-border">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">
                                    ${total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={handleGenerateInvoice}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                            >
                                <Icon name="DocumentTextIcon" size={20} />
                                Generate Invoice
                            </button>
                            <button className="px-4 py-3 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors">
                                <Icon name="PrinterIcon" size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <Icon name="ShoppingCartIcon" size={48} className="mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">No services selected</p>
                        <p className="text-xs text-muted-foreground mt-1">Add services to build an invoice</p>
                    </div>
                )}
            </div>
        </div>
    );
};

InvoiceBuilder.propTypes = {
    selectedServices: PropTypes?.arrayOf(PropTypes?.shape({
        id: PropTypes?.string?.isRequired,
        name: PropTypes?.string?.isRequired,
        code: PropTypes?.string?.isRequired,
        category: PropTypes?.string?.isRequired,
        price: PropTypes?.number?.isRequired,
        quantity: PropTypes?.number?.isRequired,
        subtotal: PropTypes?.number?.isRequired
    }))?.isRequired,
    patientInfo: PropTypes?.shape({
        name: PropTypes?.string?.isRequired,
        id: PropTypes?.string?.isRequired
    }),
    onUpdateService: PropTypes?.func?.isRequired,
    onRemoveService: PropTypes?.func?.isRequired,
    onApplyDiscount: PropTypes?.func?.isRequired,
    onGenerateInvoice: PropTypes?.func?.isRequired
};

export default InvoiceBuilder;