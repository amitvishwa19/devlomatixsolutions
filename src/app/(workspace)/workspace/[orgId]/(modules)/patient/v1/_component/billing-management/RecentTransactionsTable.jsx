import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function RecentTransactionsTable({ transactions, onViewDetails }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid':
                return 'bg-success/10 text-success';
            case 'Pending':
                return 'bg-warning/10 text-warning';
            case 'Overdue':
                return 'bg-error/10 text-error';
            case 'Processing':
                return 'bg-primary/10 text-primary';
            default:
                return 'bg-muted text-text-secondary';
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'Credit Card':
                return 'CreditCardIcon';
            case 'Cash':
                return 'BanknotesIcon';
            case 'Check':
                return 'DocumentTextIcon';
            case 'Insurance':
                return 'ShieldCheckIcon';
            default:
                return 'CurrencyDollarIcon';
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Invoice ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Patient Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Payment Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {transactions?.map((transaction) => (
                            <tr key={transaction?.id} className="hover:bg-muted/50 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-mono font-medium text-foreground">{transaction?.invoiceId}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Icon name="UserIcon" size={16} className="text-primary" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-foreground">{transaction?.patientName}</div>
                                            <div className="text-xs text-text-secondary">{transaction?.patientId}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-foreground">{transaction?.date}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-semibold text-foreground">{transaction?.amount}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Icon name={getPaymentMethodIcon(transaction?.paymentMethod)} size={16} className="text-text-secondary" />
                                        <span className="text-sm text-foreground">{transaction?.paymentMethod}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction?.status)}`}>
                                        {transaction?.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => onViewDetails(transaction?.id)}
                                        className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

RecentTransactionsTable.propTypes = {
    transactions: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            invoiceId: PropTypes?.string?.isRequired,
            patientName: PropTypes?.string?.isRequired,
            patientId: PropTypes?.string?.isRequired,
            date: PropTypes?.string?.isRequired,
            amount: PropTypes?.string?.isRequired,
            paymentMethod: PropTypes?.string?.isRequired,
            status: PropTypes?.string?.isRequired
        })
    )?.isRequired,
    onViewDetails: PropTypes?.func?.isRequired
};