'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const ServiceEditModal = ({ isOpen, service, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        category: '',
        subcategory: '',
        description: '',
        price: '',
        insurancePrice: '',
        billingCode: '',
        status: 'Active'
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (service) {
            setFormData({
                name: service?.name || '',
                code: service?.code || '',
                category: service?.category || '',
                subcategory: service?.subcategory || '',
                description: service?.description || '',
                price: service?.price?.toString() || '',
                insurancePrice: service?.insurancePrice?.toString() || '',
                billingCode: service?.billingCode || '',
                status: service?.status || 'Active'
            });
        } else if (isOpen) {
            // Reset form when opening modal for new service
            setFormData({
                name: '',
                code: '',
                category: '',
                subcategory: '',
                description: '',
                price: '',
                insurancePrice: '',
                billingCode: '',
                status: 'Active'
            });
            setErrors({});
        }
    }, [service, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e?.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors?.[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData?.name?.trim()) newErrors.name = 'Service name is required';
        if (!formData?.code?.trim()) newErrors.code = 'Service code is required';
        if (!formData?.category) newErrors.category = 'Category is required';
        if (!formData?.price || parseFloat(formData?.price) <= 0) newErrors.price = 'Valid price is required';

        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (validateForm()) {
            onSave({
                ...service,
                ...formData,
                price: parseFloat(formData?.price),
                insurancePrice: formData?.insurancePrice ? parseFloat(formData?.insurancePrice) : null
            });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-3xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                        {service?.id ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Service Name <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData?.name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors?.name ? 'border-error' : 'border-input'
                                        }`}
                                    placeholder="Enter service name"
                                />
                                {errors?.name && <p className="text-xs text-error mt-1">{errors?.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Service Code <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData?.code}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors?.code ? 'border-error' : 'border-input'
                                        }`}
                                    placeholder="e.g., SVC-001"
                                />
                                {errors?.code && <p className="text-xs text-error mt-1">{errors?.code}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Category <span className="text-error">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData?.category}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors?.category ? 'border-error' : 'border-input'
                                        }`}
                                >
                                    <option value="">Select category</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Diagnostics">Diagnostics</option>
                                    <option value="Laboratory">Laboratory</option>
                                    <option value="Surgery">Surgery</option>
                                </select>
                                {errors?.category && <p className="text-xs text-error mt-1">{errors?.category}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Subcategory</label>
                                <input
                                    type="text"
                                    name="subcategory"
                                    value={formData?.subcategory}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Enter subcategory"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Standard Price (USD) <span className="text-error">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData?.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className={`w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring ${errors?.price ? 'border-error' : 'border-input'
                                        }`}
                                    placeholder="0.00"
                                />
                                {errors?.price && <p className="text-xs text-error mt-1">{errors?.price}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Insurance Price (USD)</label>
                                <input
                                    type="number"
                                    name="insurancePrice"
                                    value={formData?.insurancePrice}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Billing Code</label>
                                <input
                                    type="text"
                                    name="billingCode"
                                    value={formData?.billingCode}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="e.g., CPT-12345"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData?.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData?.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                placeholder="Enter service description"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/30">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-muted transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors duration-200"
                        >
                            {service?.id ? 'Save Changes' : 'Add Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

ServiceEditModal.propTypes = {
    isOpen: PropTypes?.bool?.isRequired,
    service: PropTypes?.shape({
        id: PropTypes?.number,
        name: PropTypes?.string,
        code: PropTypes?.string,
        category: PropTypes?.string,
        subcategory: PropTypes?.string,
        description: PropTypes?.string,
        price: PropTypes?.number,
        insurancePrice: PropTypes?.number,
        billingCode: PropTypes?.string,
        status: PropTypes?.string
    }),
    onClose: PropTypes?.func?.isRequired,
    onSave: PropTypes?.func?.isRequired
};

export default ServiceEditModal;