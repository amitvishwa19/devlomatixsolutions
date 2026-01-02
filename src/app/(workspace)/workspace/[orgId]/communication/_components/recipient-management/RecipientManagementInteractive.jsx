'use client';

import { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import ContactsTable from './ContactsTable';
import ContactsMobileView from './ContactsMobileView';
import FilterPanel from './FilterPanel';
import DistributionLists from './DistributionLists';
import BulkActionsBar from './BulkActionsBar';
import ContactDetailModal from './ContactDetailModal';
import ImportContactsModal from './ImportContactsModal';



const mockContacts = [
    {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        type: 'patient',
        department: 'Cardiology',
        status: 'active',
        lastContact: '2 days ago',
        communicationPreference: 'email',
        patientId: 'PT-2024-001',
        avatar: "https://images.unsplash.com/photo-1663787033645-acb0efd6f5fb",
        address: '123 Main Street, Springfield, IL 62701',
        dateOfBirth: '03/15/1985',
        emergencyContact: 'Michael Johnson - (555) 987-6543',
        notes: 'Prefers morning appointments. Has history of heart disease.'
    },
    {
        id: '2',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        phone: '(555) 234-5678',
        type: 'doctor',
        department: 'Emergency',
        role: 'Chief Physician',
        status: 'active',
        lastContact: '1 hour ago',
        communicationPreference: 'both',
        employeeId: 'EMP-2024-045',
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1fddf0ca8-1764850236730.png"
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '(555) 345-6789',
        type: 'patient',
        department: 'Pediatrics',
        status: 'active',
        lastContact: '1 week ago',
        communicationPreference: 'sms',
        patientId: 'PT-2024-002',
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1340ea867-1765208979075.png"
    },
    {
        id: '4',
        name: 'James Wilson',
        email: 'james.wilson@hospital.com',
        phone: '(555) 456-7890',
        type: 'staff',
        department: 'Administration',
        role: 'Office Manager',
        status: 'active',
        lastContact: '3 days ago',
        communicationPreference: 'email',
        employeeId: 'EMP-2024-089'
    },
    {
        id: '5',
        name: 'Maria Garcia',
        email: 'maria.garcia@email.com',
        phone: '(555) 567-8901',
        type: 'patient',
        department: 'Orthopedics',
        status: 'inactive',
        lastContact: '2 months ago',
        communicationPreference: 'email',
        patientId: 'PT-2024-003'
    },
    {
        id: '6',
        name: 'Dr. David Kim',
        email: 'david.kim@hospital.com',
        phone: '(555) 678-9012',
        type: 'doctor',
        department: 'Neurology',
        role: 'Neurologist',
        status: 'active',
        lastContact: '5 hours ago',
        communicationPreference: 'both',
        employeeId: 'EMP-2024-067',
        avatar: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg'
    },
    {
        id: '7',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        phone: '(555) 789-0123',
        type: 'patient',
        department: 'Cardiology',
        status: 'unsubscribed',
        lastContact: '3 weeks ago',
        communicationPreference: 'email',
        patientId: 'PT-2024-004'
    },
    {
        id: '8',
        name: 'Robert Taylor',
        email: 'robert.taylor@hospital.com',
        phone: '(555) 890-1234',
        type: 'staff',
        department: 'IT Support',
        role: 'System Administrator',
        status: 'active',
        lastContact: '1 day ago',
        communicationPreference: 'email',
        employeeId: 'EMP-2024-112'
    }];


const mockDistributionLists = [
    {
        id: '1',
        name: 'Cardiology Patients',
        description: 'All active patients in the Cardiology department for appointment reminders and health updates',
        memberCount: 156,
        createdDate: '01/15/2024',
        lastModified: '2 days ago',
        category: 'Patients'
    },
    {
        id: '2',
        name: 'Emergency Department Staff',
        description: 'Emergency department doctors and nurses for urgent communications and shift updates',
        memberCount: 42,
        createdDate: '02/01/2024',
        lastModified: '1 week ago',
        category: 'Staff'
    },
    {
        id: '3',
        name: 'Pediatrics Follow-up',
        description: 'Pediatric patients requiring follow-up appointments and vaccination reminders',
        memberCount: 89,
        createdDate: '03/10/2024',
        lastModified: '3 days ago',
        category: 'Patients'
    },
    {
        id: '4',
        name: 'Administrative Team',
        description: 'Hospital administrative staff for policy updates and general announcements',
        memberCount: 28,
        createdDate: '01/05/2024',
        lastModified: '1 month ago',
        category: 'Staff'
    }];


const mockCommunicationHistory = [
    {
        id: '1',
        type: 'email',
        subject: 'Appointment Reminder - Cardiology Checkup',
        date: '12/28/2024 10:30 AM',
        status: 'delivered'
    },
    {
        id: '2',
        type: 'email',
        subject: 'Lab Results Available',
        date: '12/25/2024 02:15 PM',
        status: 'delivered'
    },
    {
        id: '3',
        type: 'sms',
        subject: 'Prescription Ready for Pickup',
        date: '12/20/2024 09:00 AM',
        status: 'delivered'
    }];


const RecipientManagementInteractive = () => {
    const [isHydrated, setIsHydrated] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        types: [],
        departments: [],
        statuses: [],
        communicationPreferences: []
    });
    const [selectedContact, setSelectedContact] = useState(null);
    const [showContactDetail, setShowContactDetail] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useState(() => {
        setIsHydrated(true);
    });

    const filterOptions = {
        types: ['patient', 'doctor', 'staff'],
        departments: ['Cardiology', 'Emergency', 'Pediatrics', 'Orthopedics', 'Neurology', 'Administration', 'IT Support'],
        statuses: ['active', 'inactive', 'unsubscribed'],
        communicationPreferences: ['email', 'sms', 'both']
    };

    const filteredAndSortedContacts = useMemo(() => {
        let filtered = mockContacts;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (contact) =>
                    contact.name.toLowerCase().includes(query) ||
                    contact.email.toLowerCase().includes(query) ||
                    contact.department.toLowerCase().includes(query) ||
                    contact.phone.includes(query)
            );
        }

        if (activeFilters.types.length > 0) {
            filtered = filtered.filter((contact) => activeFilters.types.includes(contact.type));
        }

        if (activeFilters.departments.length > 0) {
            filtered = filtered.filter((contact) => activeFilters.departments.includes(contact.department));
        }

        if (activeFilters.statuses.length > 0) {
            filtered = filtered.filter((contact) => activeFilters.statuses.includes(contact.status));
        }

        if (activeFilters.communicationPreferences.length > 0) {
            filtered = filtered.filter((contact) =>
                activeFilters.communicationPreferences.includes(contact.communicationPreference)
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === undefined || bValue === undefined) return 0;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' ?
                    aValue.localeCompare(bValue) :
                    bValue.localeCompare(aValue);
            }

            return 0;
        });

        return sorted;
    }, [searchQuery, activeFilters, sortField, sortDirection]);

    const handleSelectContact = (id) => {
        setSelectedContacts((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (selected) => {
        if (selected) {
            setSelectedContacts(filteredAndSortedContacts.map((c) => c.id));
        } else {
            setSelectedContacts([]);
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleViewContact = (contact) => {
        setSelectedContact(contact);
        setShowContactDetail(true);
    };

    const handleEditContact = (contact) => {
        console.log('Edit contact:', contact);
    };

    const handleImport = (file) => {
        console.log('Import file:', file);
    };

    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-[1920px] mx-auto px-6 py-8">
                    <div className="mb-8">
                        <div className="w-64 h-8 bg-muted rounded animate-pulse mb-2" />
                        <div className="w-96 h-5 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                            <div className="w-full h-96 bg-muted rounded animate-pulse" />
                        </div>
                        <div className="lg:col-span-3">
                            <div className="w-full h-96 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>);

    }

    return (
        <>
            <div className="max-w-[1920px] mx-auto px-6 py-8">


                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 w-full sm:max-w-md">
                        <div className="relative">
                            <Icon
                                name="MagnifyingGlassIcon"
                                size={20}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                placeholder="Search contacts by name, email, department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-ring focus:ring-offset-3" />

                        </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-md hover:bg-muted transition-smooth lg:hidden">

                            <Icon name="FunnelIcon" size={18} />
                            <span className="text-sm font-medium">Filters</span>
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-smooth">

                            <Icon name="ArrowUpTrayIcon" size={18} />
                            <span className="text-sm font-medium">Import</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-smooth">
                            <Icon name="PlusIcon" size={18} />
                            <span className="text-sm font-medium">Add Contact</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <FilterPanel
                            filterOptions={filterOptions}
                            activeFilters={activeFilters}
                            onFilterChange={setActiveFilters}
                            resultCount={filteredAndSortedContacts.length} />

                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="hidden md:block">
                            <ContactsTable
                                contacts={filteredAndSortedContacts}
                                selectedContacts={selectedContacts}
                                onSelectContact={handleSelectContact}
                                onSelectAll={handleSelectAll}
                                onViewContact={handleViewContact}
                                onEditContact={handleEditContact}
                                searchQuery={searchQuery}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onSort={handleSort} />

                        </div>

                        <div className="md:hidden">
                            <ContactsMobileView
                                contacts={filteredAndSortedContacts}
                                selectedContacts={selectedContacts}
                                onSelectContact={handleSelectContact}
                                onViewContact={handleViewContact}
                                onEditContact={handleEditContact}
                                searchQuery={searchQuery} />

                        </div>

                        <DistributionLists
                            lists={mockDistributionLists}
                            onCreateList={() => console.log('Create list')}
                            onEditList={(list) => console.log('Edit list:', list)}
                            onDeleteList={(list) => console.log('Delete list:', list)}
                            onViewMembers={(list) => console.log('View members:', list)} />

                    </div>
                </div>
            </div>

            <BulkActionsBar
                selectedCount={selectedContacts.length}
                onAddToList={() => console.log('Add to list')}
                onExport={() => console.log('Export')}
                onUpdateStatus={() => console.log('Update status')}
                onDelete={() => console.log('Delete')}
                onClearSelection={() => setSelectedContacts([])} />


            <ContactDetailModal
                contact={selectedContact}
                isOpen={showContactDetail}
                onClose={() => {
                    setShowContactDetail(false);
                    setSelectedContact(null);
                }}
                onEdit={handleEditContact}
                communicationHistory={mockCommunicationHistory} />


            <ImportContactsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImport} />

        </>);

};

export default RecipientManagementInteractive;