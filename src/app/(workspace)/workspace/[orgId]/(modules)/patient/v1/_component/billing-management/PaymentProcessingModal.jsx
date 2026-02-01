'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function PaymentProcessingModal({ isOpen, onClose, patientData }) {
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [formData, setFormData] = useState({
        amount: '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        checkNumber: '',
        notes: ''
    });

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e?.target?.name]: e?.target?.value
        }));
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        console.log('Processing payment:', { paymentMethod, ...formData });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1030 p-4">
            <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Process Payment</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} className="text-text-secondary" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {patientData && (
                        <div className="bg-muted rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Icon name="UserIcon" size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">{patientData?.name}</h3>
                                    <p className="text-xs text-text-secondary">{patientData?.patientId}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-text-secondary">Outstanding Balance:</span>
                                    <span className="ml-2 font-semibold text-foreground">{patientData?.balance}</span>
                                </div>
                                <div>
                                    <span className="text-text-secondary">Insurance Coverage:</span>
                                    <span className="ml-2 font-semibold text-foreground">{patientData?.insurance}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Payment Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">$</span>
                            <input
                                type="number"
                                name="amount"
                                value={formData?.amount}
                                onChange={handleInputChange}
                                placeholder="0.00"
                                step="0.01"
                                required
                                className="w-full pl-8 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3">Payment Method</label>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { id: 'credit-card', label: 'Credit Card', icon: 'CreditCardIcon' },
                                { id: 'cash', label: 'Cash', icon: 'BanknotesIcon' },
                                { id: 'check', label: 'Check', icon: 'DocumentTextIcon' },
                                { id: 'insurance', label: 'Insurance', icon: 'ShieldCheckIcon' }
                            ]?.map((method) => (
                                <button
                                    key={method?.id}
                                    type="button"
                                    onClick={() => setPaymentMethod(method?.id)}
                                    className={`flex flex-col items-center gap-2 p-4 border rounded-lg transition-all duration-200 ${paymentMethod === method?.id
                                        ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-text-secondary'
                                        }`}
                                >
                                    <Icon name={method?.icon} size={24} />
                                    <span className="text-xs font-medium">{method?.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod === 'credit-card' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Card Number</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData?.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                    required
                                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={formData?.cardName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    required
                                    className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={formData?.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        required
                                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={formData?.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        maxLength="4"
                                        required
                                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'check' && (
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Check Number</label>
                            <input
                                type="text"
                                name="checkNumber"
                                value={formData?.checkNumber}
                                onChange={handleInputChange}
                                placeholder="Enter check number"
                                required
                                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            value={formData?.notes}
                            onChange={handleInputChange}
                            placeholder="Add any additional notes..."
                            rows="3"
                            className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
                        >
                            <Icon name="CheckCircleIcon" size={20} />
                            <span>Process Payment</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors duration-200 font-medium text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

PaymentProcessingModal.propTypes = {
    isOpen: PropTypes?.bool?.isRequired,
    onClose: PropTypes?.func?.isRequired,
    patientData: PropTypes?.shape({
        name: PropTypes?.string?.isRequired,
        patientId: PropTypes?.string?.isRequired,
        balance: PropTypes?.string?.isRequired,
        insurance: PropTypes?.string?.isRequired
    })
};