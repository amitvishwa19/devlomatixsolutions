export const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
    { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
];

export const defaultModules = [
    {
        id: 'opd',
        name: 'OPD Management System',
        features: [
            'OPD appointments',
            'OPD new / follow-up case management',
            'OPD billing and payment management',
            'User-wise revenue collection report',
            'Medicine prescription management',
            'Patient health certificates issue management',
            'OPD-based all types of analysis report',
            'Different types of comparison reports',
            'Different types of reports to analyse hospital performance',
        ],
    },
    {
        id: 'ipd',
        name: 'IPD Management System',
        features: [
            'Indoor admission & discharge',
            'Day-to-day billing entry',
            'Lock bill on final bill generation so that only authorized person can change it',
            'User-wise revenue collection Report',
            'Patient room transfer Management',
            'Medical discharge summary report',
            'TPA and company payment',
            'Management Company wise charge list',
            'Bed Vacancy Report',
            'Bed occupancy Report',
        ],
    },
    {
        id: 'pharmacy',
        name: 'Pharmacy Management System',
        features: [
            'Cloud based system - Access your software anytime anywhere',
            'Integration of pharmacy with Hospital software',
            'Pharmacy sales & sales return management',
            'Pharmacy purchase and purchase return management',
            'Suppliers and their ledger management',
            'Supplier wise auto Expiry product list',
            'User wise revenue collection report',
        ],
    },
    {
        id: 'inventory',
        name: 'Inventory Management & Reports',
        features: [
            'Financial reports and analytics',
            'GST reports',
            'Schedule H drug reports',
            'User wise access restrictions',
            'And many more features...',
        ],
    },
    {
        id: 'pathology',
        name: 'Pathology Management System',
        features: [
            'Cloud based system - Access your software anytime anywhere',
            'Dynamic Dashboard',
            'Patient Record Management',
            'Pathology Billing and Payment System',
            'Pathology Investigations predefined templates',
            'Create & Customise investigation template as per your need',
            'User wise access restrictions',
            'Financial Reports',
            'Investigation Analysis Reports',
        ],
    },
    {
        id: 'radiology',
        name: 'Radiology Management System',
        features: [
            'Cloud based system - Access your software anytime anywhere',
            'Dynamic Dashboard',
            'Patient Record Management',
            'Radiology Billing and Payment System',
            'Radiology Investigations predefined templates',
            'Create & Customise investigation template as per your need',
            'User wise access restrictions',
            'Financial Reports',
            'Investigation Analysis Reports',
        ],
    },
    {
        id: 'centralStore',
        name: 'Central Store Management',
        features: [
            'Cloud based system - Access your software anytime anywhere',
            'Integration of central store with Hospital software',
            'Inventory issue & issue return management',
            'Inventory purchase and purchase return management',
            'Suppliers and their ledger management',
            'Supplier wise auto Expiry product list',
            'User wise revenue collection report',
            'Inventory management & reports',
            'Financial reports and analytics',
            'GST reports',
            'User wise access restrictions',
        ],
    },
    {
        id: 'doctorSharing',
        name: 'Doctor Sharing Management',
        features: [
            'Doctor-wise sharing policy for every patient',
            'Service-wise percentage / rupees sharing to related doctors',
            'Referring doctor sharing policy management',
            'Sharing statement for every doctor by the hospital as per sharing policy defined',
            'TDS report for every doctor\'s sharing payment',
            'Mail sharing statement to doctors',
            'Customized sharing policy for every doctor',
        ],
    },
    {
        id: 'tallyIntegration',
        name: 'Tally Integration Interface',
        features: [
            'Catalyst Tally module to transfer Catalyst Hospital and Catalyst Pharmacy module data to Tally software',
        ],
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp Integration',
        features: [
            'Send a Welcome message to the patient',
            'Send a Thanks message to Ref. Dr.',
            'Send all the Transactional Messages to Patients',
            'Send Reports etc.',
        ],
    },
];

export const defaultTermsAndConditions = [
    'First-time Software training will be provided by the catalyst software team.',
    'Yearly renewal changes for catalyst software will be 20% from next year onwards of Invoice.',
    'Payment terms will be as the first installment of 70% at the time of placing a purchase order and the second installment of 30% after training completed.',
    'This given price is for existing software and features of the catalyst. New modules development as per the requirement of the hospital will be charged extra, at the time of requirement, based on technical possibility and man work hours required by the catalyst development team based on requirements of the client hospital.',
    'As per Govt. regulation, an extra 18% GST charge will be applicable on the bill amount.',
];

export const defaultNotes = [
    'Catalyst Tally interface module will only transfer Catalyst software data into Tally software (a third party software). It will not receive any data from Tally software.',
    'Once data is imported in Tally software, Catalyst software will have no control over that imported data in tally. It will be sole responsibility of Hospital team to verify and secure that data.',
    'We are giving you the first 10000 WhatsApp messages free for 1 year.',
    'After the messages are exhausted, there will be a charge of Rs. 0.50 per message (Minimum package 5000 messages).',
];