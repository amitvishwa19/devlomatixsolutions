'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const PaymentProcessingModal = ({ isOpen, onClose, billingInfo, onProcessPayment }) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setIsProcessing(true);

        setTimeout(() => {
            onProcessPayment({
                method: paymentMethod,
                amount: billingInfo?.totalAmount,
                transactionId: `TXN-${Date.now()}`,
                status: 'completed'
            });
            setIsProcessing(false);
            onClose();
        }, 2000);
    };

    const formatCardNumber = (value) => {
        const cleaned = value?.replace(/\s/g, '');
        const formatted = cleaned?.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted?.slice(0, 19);
    };

    const formatExpiryDate = (value) => {
        const cleaned = value?.replace(/\D/g, '');
        if (cleaned?.length >= 2) {
            return `${cleaned?.slice(0, 2)}/${cleaned?.slice(2, 4)}`;
        }
        return cleaned;
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Process Payment</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        aria-label="Close modal"
                    >
                        <Icon name="XMarkIcon" size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-muted/30 border border-border rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Billing Summary</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Patient</span>
                                <span className="font-medium text-foreground">{billingInfo?.patientName}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Services</span>
                                <span className="font-medium text-foreground">{billingInfo?.serviceCount} items</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Insurance Coverage</span>
                                <span className="font-medium text-foreground">{billingInfo?.insuranceProvider}</span>
                            </div>
                            <div className="flex items-center justify-between text-lg font-bold pt-2 border-t border-border">
                                <span className="text-foreground">Amount Due</span>
                                <span className="text-primary">
                                    ${billingInfo?.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground">Payment Method</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'card', label: 'Credit Card', icon: 'CreditCardIcon' },
                                { id: 'cash', label: 'Cash', icon: 'BanknotesIcon' },
                                { id: 'insurance', label: 'Insurance', icon: 'ShieldCheckIcon' }
                            ]?.map(method => (
                                <button
                                    key={method?.id}
                                    onClick={() => setPaymentMethod(method?.id)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${paymentMethod === method?.id
                                        ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                                        }`}
                                >
                                    <Icon
                                        name={method?.icon}
                                        size={24}
                                        className={paymentMethod === method?.id ? 'text-primary' : 'text-muted-foreground'}
                                    />
                                    <span className={`text-sm font-medium ${paymentMethod === method?.id ? 'text-primary' : 'text-foreground'
                                        }`}>
                                        {method?.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod === 'card' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Cardholder Name
                                </label>
                                <input
                                    type="text"
                                    value={cardholderName}
                                    onChange={(e) => setCardholderName(e?.target?.value)}
                                    placeholder="John Doe"
                                    required
                                    className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Card Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(formatCardNumber(e?.target?.value))}
                                        placeholder="1234 5678 9012 3456"
                                        required
                                        maxLength={19}
                                        className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                    <Icon name="CreditCardIcon" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="text"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(formatExpiryDate(e?.target?.value))}
                                        placeholder="MM/YY"
                                        required
                                        maxLength={5}
                                        className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        value={cvv}
                                        onChange={(e) => setCvv(e?.target?.value?.replace(/\D/g, '')?.slice(0, 4))}
                                        placeholder="123"
                                        required
                                        maxLength={4}
                                        className="w-full px-4 py-2.5 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-md">
                                <Icon name="ShieldCheckIcon" size={20} className="text-accent flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">
                                    Your payment information is encrypted and secure
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Icon name="CheckCircleIcon" size={20} />
                                            Process Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {paymentMethod === 'cash' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Icon name="ExclamationTriangleIcon" size={20} className="text-warning flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground mb-1">Cash Payment</p>
                                        <p className="text-xs text-muted-foreground">
                                            Please collect ${billingInfo?.totalAmount?.toFixed(2)} in cash and provide a receipt to the patient.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onProcessPayment({ method: 'cash', amount: billingInfo?.totalAmount })}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    <Icon name="CheckCircleIcon" size={20} />
                                    Confirm Cash Payment
                                </button>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'insurance' && (
                        <div className="space-y-4">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <Icon name="InformationCircleIcon" size={20} className="text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground mb-1">Insurance Claim</p>
                                        <p className="text-xs text-muted-foreground">
                                            This will submit a claim to {billingInfo?.insuranceProvider} for processing.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onProcessPayment({ method: 'insurance', amount: billingInfo?.totalAmount })}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                                >
                                    <Icon name="PaperAirplaneIcon" size={20} />
                                    Submit Insurance Claim
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

PaymentProcessingModal.propTypes = {
    isOpen: PropTypes?.bool?.isRequired,
    onClose: PropTypes?.func?.isRequired,
    billingInfo: PropTypes?.shape({
        patientName: PropTypes?.string?.isRequired,
        serviceCount: PropTypes?.number?.isRequired,
        insuranceProvider: PropTypes?.string?.isRequired,
        totalAmount: PropTypes?.number?.isRequired
    }),
    onProcessPayment: PropTypes?.func?.isRequired
};

export default PaymentProcessingModal;