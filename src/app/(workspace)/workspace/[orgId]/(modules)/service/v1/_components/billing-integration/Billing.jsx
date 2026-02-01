import Icon from '@/components/ui/AppIcon';
import React from 'react'
import BillingIntegrationInteractive from './BillingIntegrationInteractive';

export default function Billing() {


    const mockBillingQueue = [
        {
            id: 'BIL-001',
            patientName: 'Sarah Johnson',
            patientId: 'PAT-12345',
            date: '12/06/2025',
            time: '09:30 AM',
            serviceCount: 3,
            primaryService: 'Cardiology Consultation',
            totalAmount: 1250.00,
            discount: 125.00,
            insuranceProvider: 'Blue Cross',
            insuranceStatus: 'Approved',
            status: 'Pending'
        },
        {
            id: 'BIL-002',
            patientName: 'Michael Chen',
            patientId: 'PAT-12346',
            date: '12/06/2025',
            time: '10:15 AM',
            serviceCount: 2,
            primaryService: 'MRI Scan',
            totalAmount: 2800.00,
            discount: 0,
            insuranceProvider: 'Aetna',
            insuranceStatus: 'Pending',
            status: 'Processing'
        },
        {
            id: 'BIL-003',
            patientName: 'Emily Rodriguez',
            patientId: 'PAT-12347',
            date: '12/06/2025',
            time: '11:00 AM',
            serviceCount: 5,
            primaryService: 'Blood Test Panel',
            totalAmount: 450.00,
            discount: 45.00,
            insuranceProvider: 'United Healthcare',
            insuranceStatus: 'Approved',
            status: 'Completed'
        },
        {
            id: 'BIL-004',
            patientName: 'David Thompson',
            patientId: 'PAT-12348',
            date: '12/06/2025',
            time: '02:30 PM',
            serviceCount: 1,
            primaryService: 'Emergency Care',
            totalAmount: 3500.00,
            discount: 0,
            insuranceProvider: 'Medicare',
            insuranceStatus: 'Denied',
            status: 'Failed'
        },
        {
            id: 'BIL-005',
            patientName: 'Lisa Anderson',
            patientId: 'PAT-12349',
            date: '12/06/2025',
            time: '03:45 PM',
            serviceCount: 4,
            primaryService: 'Physical Therapy',
            totalAmount: 680.00,
            discount: 68.00,
            insuranceProvider: 'Cigna',
            insuranceStatus: 'Approved',
            status: 'Pending'
        }
    ];

    const mockAnalytics = [
        {
            id: 'metric-1',
            type: 'revenue',
            label: 'Daily Revenue',
            value: 8680.00,
            prefix: '$',
            subtitle: 'Today\'s total revenue',
            trend: 12.5,
            progress: 75
        },
        {
            id: 'metric-2',
            type: 'pending',
            label: 'Pending Payments',
            value: 1930.00,
            prefix: '$',
            subtitle: '2 invoices awaiting payment',
            trend: -5.2,
            progress: 45
        },
        {
            id: 'metric-3',
            type: 'insurance',
            label: 'Insurance Reimbursements',
            value: 5200.00,
            prefix: '$',
            subtitle: '3 claims approved',
            trend: 8.7,
            progress: 85
        },
        {
            id: 'metric-4',
            type: 'outstanding',
            label: 'Outstanding Balances',
            value: 3500.00,
            prefix: '$',
            subtitle: '1 claim denied',
            trend: 0,
            progress: 30
        }
    ];

    const mockAvailableServices = [
        {
            id: 'SRV-001',
            name: 'Cardiology Consultation',
            code: 'CPT-99213',
            description: 'Comprehensive cardiovascular examination and consultation',
            category: 'Consultation',
            price: 350.00,
            duration: '45 min'
        },
        {
            id: 'SRV-002',
            name: 'MRI Scan - Brain',
            code: 'CPT-70553',
            description: 'Magnetic resonance imaging of brain with contrast',
            category: 'Diagnostic',
            price: 1400.00,
            duration: '60 min'
        },
        {
            id: 'SRV-003',
            name: 'Complete Blood Count',
            code: 'CPT-85025',
            description: 'Comprehensive blood analysis panel',
            category: 'Laboratory',
            price: 85.00,
            duration: '15 min'
        },
        {
            id: 'SRV-004',
            name: 'X-Ray Chest',
            code: 'CPT-71046',
            description: 'Chest radiography, 2 views',
            category: 'Diagnostic',
            price: 120.00,
            duration: '20 min'
        },
        {
            id: 'SRV-005',
            name: 'Physical Therapy Session',
            code: 'CPT-97110',
            description: 'Therapeutic exercises and rehabilitation',
            category: 'Procedure',
            price: 170.00,
            duration: '60 min'
        },
        {
            id: 'SRV-006',
            name: 'Emergency Room Visit',
            code: 'CPT-99285',
            description: 'Emergency department visit, high severity',
            category: 'Emergency',
            price: 1800.00,
            duration: '120 min'
        },
        {
            id: 'SRV-007',
            name: 'Ultrasound Abdomen',
            code: 'CPT-76700',
            description: 'Abdominal ultrasound examination',
            category: 'Diagnostic',
            price: 280.00,
            duration: '30 min'
        },
        {
            id: 'SRV-008',
            name: 'ECG 12-Lead',
            code: 'CPT-93000',
            description: 'Electrocardiogram with interpretation',
            category: 'Diagnostic',
            price: 95.00,
            duration: '15 min'
        }
    ];

    const initialData = {
        billingQueue: mockBillingQueue,
        analytics: mockAnalytics,
        availableServices: mockAvailableServices
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">


            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon name="CurrencyDollarIcon" size={28} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Billing Integration</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Process payments, generate invoices, and manage financial transactions
                        </p>
                    </div>
                </div>
            </div>

            <BillingIntegrationInteractive initialData={initialData} />
        </div>
    )
}
