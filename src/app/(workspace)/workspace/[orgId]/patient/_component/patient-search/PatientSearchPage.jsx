import PatientSearchInteractive from "./PatientSearchInteractive";



export const metadata = {
    title: 'Patient Search - PatientCare Pro',
    description: 'Search and manage patient records efficiently with advanced filtering and quick access to patient profiles, appointments, and medical history.'
};

export default function PatientSearchPage() {


    const mockPatients = [
        {
            id: 'P001',
            name: 'Sarah Johnson',
            phone: '555-0123',
            dob: '03/15/1985',
            lastVisit: '12/05/2025',
            provider: 'Dr. Sarah Mitchell',
            insurance: 'Blue Cross Blue Shield',
            insuranceStatus: 'Active'
        },
        {
            id: 'P002',
            name: 'Michael Chen',
            phone: '555-0124',
            dob: '07/22/1992',
            lastVisit: '12/04/2025',
            provider: 'Dr. James Anderson',
            insurance: 'Aetna',
            insuranceStatus: 'Active'
        },
        {
            id: 'P003',
            name: 'Emily Rodriguez',
            phone: '555-0125',
            dob: '11/30/1978',
            lastVisit: '12/03/2025',
            provider: 'Dr. Lisa Chen',
            insurance: 'United Healthcare',
            insuranceStatus: 'Pending'
        },
        {
            id: 'P004',
            name: 'David Martinez',
            phone: '555-0126',
            dob: '05/18/1990',
            lastVisit: '12/02/2025',
            provider: 'Dr. Maria Rodriguez',
            insurance: 'Cigna',
            insuranceStatus: 'Active'
        },
        {
            id: 'P005',
            name: 'Lisa Anderson',
            phone: '555-0127',
            dob: '09/25/1988',
            lastVisit: '12/01/2025',
            provider: 'Dr. Sarah Mitchell',
            insurance: 'Medicare',
            insuranceStatus: 'Active'
        },
        {
            id: 'P006',
            name: 'James Wilson',
            phone: '555-0128',
            dob: '02/14/1975',
            lastVisit: '11/30/2025',
            provider: 'Dr. James Anderson',
            insurance: 'Blue Cross Blue Shield',
            insuranceStatus: 'Expired'
        },
        {
            id: 'P007',
            name: 'Maria Garcia',
            phone: '555-0129',
            dob: '08/10/1995',
            lastVisit: '11/29/2025',
            provider: 'Dr. Lisa Chen',
            insurance: 'Aetna',
            insuranceStatus: 'Active'
        },
        {
            id: 'P008',
            name: 'Robert Taylor',
            phone: '555-0130',
            dob: '12/05/1982',
            lastVisit: '11/28/2025',
            provider: 'Dr. Maria Rodriguez',
            insurance: 'United Healthcare',
            insuranceStatus: 'Active'
        },
        {
            id: 'P009',
            name: 'Jennifer Lee',
            phone: '555-0131',
            dob: '04/20/1987',
            lastVisit: '11/27/2025',
            provider: 'Dr. Sarah Mitchell',
            insurance: 'Cigna',
            insuranceStatus: 'Pending'
        },
        {
            id: 'P010',
            name: 'Christopher Brown',
            phone: '555-0132',
            dob: '10/15/1993',
            lastVisit: '11/26/2025',
            provider: 'Dr. James Anderson',
            insurance: 'Medicare',
            insuranceStatus: 'Active'
        },
        {
            id: 'P011',
            name: 'Amanda White',
            phone: '555-0133',
            dob: '06/08/1980',
            lastVisit: '11/25/2025',
            provider: 'Dr. Lisa Chen',
            insurance: 'Blue Cross Blue Shield',
            insuranceStatus: 'Active'
        },
        {
            id: 'P012',
            name: 'Daniel Harris',
            phone: '555-0134',
            dob: '01/30/1991',
            lastVisit: '11/24/2025',
            provider: 'Dr. Maria Rodriguez',
            insurance: 'Aetna',
            insuranceStatus: 'Active'
        }
    ];

    return <PatientSearchInteractive initialPatients={mockPatients} />
}