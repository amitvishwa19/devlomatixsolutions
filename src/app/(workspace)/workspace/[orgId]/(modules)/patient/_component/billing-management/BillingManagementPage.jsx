import BillingManagementInteractive from "./BillingManagementInteractive";


export const metadata = {
    title: 'Billing Management - PatientCare Pro',
    description: 'Comprehensive financial administration for patient accounts, insurance processing, and payment tracking within the healthcare facility'
};

export default function BillingManagementPage() {
    const billingData = {
        overviewCards: [
            {
                title: 'Total Revenue',
                amount: '$284,750',
                change: '+12.5%',
                changeType: 'increase',
                icon: 'CurrencyDollarIcon',
                iconBg: 'bg-success/10 text-success'
            },
            {
                title: 'Outstanding Balance',
                amount: '$42,890',
                change: '-8.3%',
                changeType: 'decrease',
                icon: 'ExclamationTriangleIcon',
                iconBg: 'bg-warning/10 text-warning'
            },
            {
                title: 'Pending Claims',
                amount: '23',
                change: '+5.2%',
                changeType: 'increase',
                icon: 'DocumentTextIcon',
                iconBg: 'bg-primary/10 text-primary'
            },
            {
                title: 'Processed Today',
                amount: '$18,450',
                change: '+15.7%',
                changeType: 'increase',
                icon: 'CheckCircleIcon',
                iconBg: 'bg-accent/10 text-accent'
            }
        ],
        transactions: [
            {
                id: 1,
                invoiceId: 'INV-2024-1247',
                patientName: 'Sarah Johnson',
                patientId: 'P001',
                date: '12/07/2025',
                amount: '$1,250.00',
                paymentMethod: 'Credit Card',
                status: 'Paid'
            },
            {
                id: 2,
                invoiceId: 'INV-2024-1246',
                patientName: 'Michael Chen',
                patientId: 'P002',
                date: '12/07/2025',
                amount: '$850.00',
                paymentMethod: 'Insurance',
                status: 'Processing'
            },
            {
                id: 3,
                invoiceId: 'INV-2024-1245',
                patientName: 'Emily Rodriguez',
                patientId: 'P003',
                date: '12/06/2025',
                amount: '$2,100.00',
                paymentMethod: 'Check',
                status: 'Pending'
            },
            {
                id: 4,
                invoiceId: 'INV-2024-1244',
                patientName: 'David Martinez',
                patientId: 'P004',
                date: '12/06/2025',
                amount: '$675.00',
                paymentMethod: 'Cash',
                status: 'Paid'
            },
            {
                id: 5,
                invoiceId: 'INV-2024-1243',
                patientName: 'Lisa Anderson',
                patientId: 'P005',
                date: '12/05/2025',
                amount: '$3,450.00',
                paymentMethod: 'Insurance',
                status: 'Overdue'
            },
            {
                id: 6,
                invoiceId: 'INV-2024-1242',
                patientName: 'James Wilson',
                patientId: 'P006',
                date: '12/05/2025',
                amount: '$920.00',
                paymentMethod: 'Credit Card',
                status: 'Paid'
            }
        ],
        claims: [
            {
                id: 1,
                claimId: 'CLM-2024-5678',
                patientName: 'Sarah Johnson',
                submissionDate: '12/01/2025',
                insuranceProvider: 'Blue Cross Blue Shield',
                status: 'Approved',
                claimAmount: '$2,500.00',
                approvedAmount: '$2,200.00',
                patientResponsibility: '$300.00'
            },
            {
                id: 2,
                claimId: 'CLM-2024-5677',
                patientName: 'Michael Chen',
                submissionDate: '12/03/2025',
                insuranceProvider: 'Aetna',
                status: 'Under Review',
                claimAmount: '$1,800.00',
                approvedAmount: '$0.00',
                patientResponsibility: 'TBD'
            },
            {
                id: 3,
                claimId: 'CLM-2024-5676',
                patientName: 'Emily Rodriguez',
                submissionDate: '11/28/2025',
                insuranceProvider: 'UnitedHealthcare',
                status: 'Pending',
                claimAmount: '$3,200.00',
                approvedAmount: '$0.00',
                patientResponsibility: 'TBD'
            },
            {
                id: 4,
                claimId: 'CLM-2024-5675',
                patientName: 'David Martinez',
                submissionDate: '11/25/2025',
                insuranceProvider: 'Cigna',
                status: 'Denied',
                claimAmount: '$1,500.00',
                approvedAmount: '$0.00',
                patientResponsibility: '$1,500.00'
            }
        ],
        chartData: [
            { period: '0-30 Days', amount: 45000 },
            { period: '31-60 Days', amount: 28000 },
            { period: '61-90 Days', amount: 15000 },
            { period: '91-120 Days', amount: 8000 },
            { period: '120+ Days', amount: 4000 }
        ]
    };

    return (
        <>
            <BillingManagementInteractive initialData={billingData} />
        </>
    );
}