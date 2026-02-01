'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const PricingEditorModal = ({ isOpen, onClose, selectedService, onSave }) => {
    const [formData, setFormData] = useState({
        serviceName: '',
        serviceCode: '',
        category: '',
        basePrice: '',
        insuranceRate: '',
        discount: '',
        effectiveDate: '',
        expiryDate: '',
        taxRate: '',
        notes: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (selectedService) {
            setFormData({
                serviceName: selectedService?.serviceName || '',
                serviceCode: selectedService?.serviceCode || '',
                category: selectedService?.category || '',
                basePrice: selectedService?.basePrice?.toString() || '',
                insuranceRate: selectedService?.insuranceRate?.toString() || '',
                discount: selectedService?.discount?.toString() || '',
                effectiveDate: selectedService?.effectiveDate || '',
                expiryDate: selectedService?.expiryDate || '',
                taxRate: selectedService?.taxRate?.toString() || '8.5',
                notes: selectedService?.notes || '',
            });
        }
    }, [selectedService]);

    const handleChange = (e) => {
        const { name, value } = e?.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors?.[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const calculateFinalPrice = () => {
        const base = parseFloat(formData?.basePrice) || 0;
        const discount = parseFloat(formData?.discount) || 0;
        const tax = parseFloat(formData?.taxRate) || 0;
        const discountedPrice = base - (base * discount) / 100;
        const finalPrice = discountedPrice + (discountedPrice * tax) / 100;
        return finalPrice?.toFixed(2);
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData?.basePrice || parseFloat(formData?.basePrice) <= 0) {
            newErrors.basePrice = 'Base price must be greater than 0';
        }
        if (!formData?.insuranceRate || parseFloat(formData?.insuranceRate) <= 0) {
            newErrors.insuranceRate = 'Insurance rate must be greater than 0';
        }
        if (!formData?.effectiveDate) {
            newErrors.effectiveDate = 'Effective date is required';
        }
        if (formData?.discount && (parseFloat(formData?.discount) < 0 || parseFloat(formData?.discount) > 100)) {
            newErrors.discount = 'Discount must be between 0 and 100';
        }
        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (validateForm()) {
            onSave({
                ...selectedService,
                ...formData,
                basePrice: parseFloat(formData?.basePrice),
                insuranceRate: parseFloat(formData?.insuranceRate),
                discount: parseFloat(formData?.discount) || 0,
                taxRate: parseFloat(formData?.taxRate),
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                        {selectedService ? 'Edit Pricing' : 'Create Pricing Tier'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Service Name <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="serviceName"
                                value={formData?.serviceName}
                                onChange={handleChange}
                                disabled
                                className="w-full px-3 py-2 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Service Code <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                name="serviceCode"
                                value={formData?.serviceCode}
                                onChange={handleChange}
                                disabled
                                className="w-full px-3 py-2 bg-muted border border-input rounded-md text-sm text-muted-foreground cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Base Price (USD) <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                name="basePrice"
                                value={formData?.basePrice}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors?.basePrice ? 'border-error' : 'border-input'
                                    }`}
                            />
                            {errors?.basePrice && <p className="text-xs text-error mt-1">{errors?.basePrice}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Insurance Rate (USD) <span className="text-error">*</span>
                            </label>
                            <input
                                type="number"
                                name="insuranceRate"
                                value={formData?.insuranceRate}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                className={`w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors?.insuranceRate ? 'border-error' : 'border-input'
                                    }`}
                            />
                            {errors?.insuranceRate && <p className="text-xs text-error mt-1">{errors?.insuranceRate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Discount (%)</label>
                            <input
                                type="number"
                                name="discount"
                                value={formData?.discount}
                                onChange={handleChange}
                                step="0.1"
                                min="0"
                                max="100"
                                className={`w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors?.discount ? 'border-error' : 'border-input'
                                    }`}
                            />
                            {errors?.discount && <p className="text-xs text-error mt-1">{errors?.discount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Tax Rate (%)</label>
                            <input
                                type="number"
                                name="taxRate"
                                value={formData?.taxRate}
                                onChange={handleChange}
                                step="0.1"
                                min="0"
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Effective Date <span className="text-error">*</span>
                            </label>
                            <input
                                type="date"
                                name="effectiveDate"
                                value={formData?.effectiveDate}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errors?.effectiveDate ? 'border-error' : 'border-input'
                                    }`}
                            />
                            {errors?.effectiveDate && <p className="text-xs text-error mt-1">{errors?.effectiveDate}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData?.expiryDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                        <textarea
                            name="notes"
                            value={formData?.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            placeholder="Add any additional notes or comments..."
                        />
                    </div>

                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Price Calculation</span>
                            <Icon name="CalculatorIcon" size={20} className="text-accent" />
                        </div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Base Price:</span>
                                <span className="text-foreground font-medium">${formData?.basePrice || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount ({formData?.discount || 0}%):</span>
                                <span className="text-error font-medium">
                                    -${((parseFloat(formData?.basePrice) || 0) * (parseFloat(formData?.discount) || 0)) / 100 || '0.00'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tax ({formData?.taxRate || 0}%):</span>
                                <span className="text-foreground font-medium">
                                    +$
                                    {(
                                        ((parseFloat(formData?.basePrice) || 0) -
                                            ((parseFloat(formData?.basePrice) || 0) * (parseFloat(formData?.discount) || 0)) / 100) *
                                        (parseFloat(formData?.taxRate) || 0)
                                    ) / 100 || '0.00'}
                                </span>
                            </div>
                            <div className="border-t border-accent/20 pt-2 mt-2 flex justify-between">
                                <span className="text-foreground font-semibold">Final Price:</span>
                                <span className="text-accent font-bold text-lg">${calculateFinalPrice()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

PricingEditorModal.propTypes = {
    isOpen: PropTypes?.bool?.isRequired,
    onClose: PropTypes?.func?.isRequired,
    selectedService: PropTypes?.shape({
        id: PropTypes?.number,
        serviceName: PropTypes?.string,
        serviceCode: PropTypes?.string,
        category: PropTypes?.string,
        basePrice: PropTypes?.number,
        insuranceRate: PropTypes?.number,
        discount: PropTypes?.number,
        effectiveDate: PropTypes?.string,
        expiryDate: PropTypes?.string,
        taxRate: PropTypes?.number,
        notes: PropTypes?.string,
    }),
    onSave: PropTypes?.func?.isRequired,
};

export default PricingEditorModal;