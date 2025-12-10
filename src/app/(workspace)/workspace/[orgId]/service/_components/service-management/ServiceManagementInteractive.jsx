'use client';

import { useState, useEffect } from 'react';
import ServiceToolbar from './ServiceToolbar';
import ServiceTable from './ServiceTable';
import ServiceHierarchy from './ServiceHierarchy';
import ServiceEditModal from './ServiceEditModal';
import MobileServiceCard from './MobileServiceCard';


const ServiceManagementInteractive = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ category: 'all', status: 'all' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    const mockServices = [
        {
            id: 1,
            name: 'Cardiology Consultation',
            code: 'CARD-001',
            category: 'Cardiology',
            subcategory: 'General Consultation',
            description: 'Comprehensive cardiovascular examination and consultation with a board-certified cardiologist',
            price: 250.00,
            insurancePrice: 200.00,
            billingCode: 'CPT-99213',
            status: 'Active',
            lastUpdated: '2025-12-05T14:30:00'
        },
        {
            id: 2,
            name: 'Emergency Room Visit',
            code: 'EMER-001',
            category: 'Emergency',
            subcategory: 'Level 3 Emergency',
            description: 'Emergency department visit for moderate to severe conditions requiring immediate attention',
            price: 850.00,
            insurancePrice: 750.00,
            billingCode: 'CPT-99284',
            status: 'Active',
            lastUpdated: '2025-12-04T09:15:00'
        },
        {
            id: 3,
            name: 'MRI Scan - Brain',
            code: 'DIAG-MRI-001',
            category: 'Diagnostics',
            subcategory: 'Magnetic Resonance Imaging',
            description: 'High-resolution brain MRI scan with contrast for detailed neurological assessment',
            price: 1200.00,
            insurancePrice: 950.00,
            billingCode: 'CPT-70553',
            status: 'Active',
            lastUpdated: '2025-12-03T16:45:00'
        },
        {
            id: 4,
            name: 'Complete Blood Count',
            code: 'LAB-CBC-001',
            category: 'Laboratory',
            subcategory: 'Hematology',
            description: 'Comprehensive blood test measuring red cells, white cells, and platelets',
            price: 45.00,
            insurancePrice: 35.00,
            billingCode: 'CPT-85025',
            status: 'Active',
            lastUpdated: '2025-12-02T11:20:00'
        },
        {
            id: 5,
            name: 'Appendectomy',
            code: 'SURG-APP-001',
            category: 'Surgery',
            subcategory: 'General Surgery',
            description: 'Laparoscopic surgical removal of the appendix',
            price: 8500.00,
            insurancePrice: 7200.00,
            billingCode: 'CPT-44970',
            status: 'Active',
            lastUpdated: '2025-12-01T08:00:00'
        },
        {
            id: 6,
            name: 'Echocardiogram',
            code: 'CARD-ECHO-001',
            category: 'Cardiology',
            subcategory: 'Cardiac Imaging',
            description: 'Ultrasound examination of the heart to assess structure and function',
            price: 450.00,
            insurancePrice: 380.00,
            billingCode: 'CPT-93306',
            status: 'Pending',
            lastUpdated: '2025-11-30T13:30:00'
        },
        {
            id: 7,
            name: 'X-Ray - Chest',
            code: 'DIAG-XRAY-001',
            category: 'Diagnostics',
            subcategory: 'Radiology',
            description: 'Two-view chest X-ray for lung and heart assessment',
            price: 120.00,
            insurancePrice: 95.00,
            billingCode: 'CPT-71046',
            status: 'Inactive',
            lastUpdated: '2025-11-29T10:15:00'
        },
        {
            id: 8,
            name: 'Physical Therapy Session',
            code: 'THER-PT-001',
            category: 'Emergency',
            subcategory: 'Rehabilitation',
            description: 'One-hour physical therapy session for injury recovery and mobility improvement',
            price: 150.00,
            insurancePrice: 120.00,
            billingCode: 'CPT-97110',
            status: 'Active',
            lastUpdated: '2025-11-28T15:45:00'
        }
    ];

    const hierarchyData = [
        {
            id: 1,
            name: 'Cardiology',
            serviceCount: 2,
            subcategories: [
                { id: 11, name: 'General Consultation', serviceCount: 1 },
                { id: 12, name: 'Cardiac Imaging', serviceCount: 1 }
            ]
        },
        {
            id: 2,
            name: 'Emergency',
            serviceCount: 2,
            subcategories: [
                { id: 21, name: 'Level 3 Emergency', serviceCount: 1 },
                { id: 22, name: 'Rehabilitation', serviceCount: 1 }
            ]
        },
        {
            id: 3,
            name: 'Diagnostics',
            serviceCount: 2,
            subcategories: [
                { id: 31, name: 'Magnetic Resonance Imaging', serviceCount: 1 },
                { id: 32, name: 'Radiology', serviceCount: 1 }
            ]
        },
        {
            id: 4,
            name: 'Laboratory',
            serviceCount: 1,
            subcategories: [
                { id: 41, name: 'Hematology', serviceCount: 1 }
            ]
        },
        {
            id: 5,
            name: 'Surgery',
            serviceCount: 1,
            subcategories: [
                { id: 51, name: 'General Surgery', serviceCount: 1 }
            ]
        }
    ];

    useEffect(() => {
        setServices(mockServices);
        setFilteredServices(mockServices);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let filtered = [...services];

        if (searchQuery?.trim()) {
            filtered = filtered?.filter(service =>
                service?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                service?.code?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                service?.category?.toLowerCase()?.includes(searchQuery?.toLowerCase())
            );
        }

        if (filters?.category !== 'all') {
            filtered = filtered?.filter(service => service?.category === filters?.category);
        }

        if (filters?.status !== 'all') {
            filtered = filtered?.filter(service => service?.status === filters?.status);
        }

        setFilteredServices(filtered);
    }, [searchQuery, filters, services]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleAddService = () => {
        setSelectedService(null);
        setIsModalOpen(true);
    };

    const handleEditService = (service) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    const handleDeleteService = (service) => {
        if (window.confirm(`Are you sure you want to delete "${service?.name}"?`)) {
            setServices(prev => prev?.filter(s => s?.id !== service?.id));
        }
    };

    const handleDuplicateService = (service) => {
        const newService = {
            ...service,
            id: Math.max(...services?.map(s => s?.id)) + 1,
            name: `${service?.name} (Copy)`,
            code: `${service?.code}-COPY`,
            status: 'Pending',
            lastUpdated: new Date()?.toISOString()
        };
        setServices(prev => [...prev, newService]);
    };

    const handleToggleStatus = (service) => {
        const newStatus = service?.status === 'Active' ? 'Inactive' : 'Active';
        setServices(prev =>
            prev?.map(s =>
                s?.id === service?.id
                    ? { ...s, status: newStatus, lastUpdated: new Date()?.toISOString() }
                    : s
            )
        );
    };

    const handleSaveService = (serviceData) => {
        if (serviceData?.id) {
            setServices(prev =>
                prev?.map(s =>
                    s?.id === serviceData?.id
                        ? { ...serviceData, lastUpdated: new Date()?.toISOString() }
                        : s
                )
            );
        } else {
            const newService = {
                ...serviceData,
                id: Math.max(...services?.map(s => s?.id)) + 1,
                lastUpdated: new Date()?.toISOString()
            };
            setServices(prev => [...prev, newService]);
        }
        setIsModalOpen(false);
    };

    const handleBulkAction = (action) => {
        switch (action) {
            case 'activate': alert('Bulk activate functionality would be implemented here');
                break;
            case 'deactivate': alert('Bulk deactivate functionality would be implemented here');
                break;
            case 'export':
                alert('Export functionality would be implemented here');
                break;
            case 'delete':
                if (window.confirm('Are you sure you want to delete selected services?')) {
                    alert('Bulk delete functionality would be implemented here');
                }
                break;
            default:
                break;
        }
    };

    return (
        <div className="space-y-6">

            <ServiceToolbar
                onAddService={handleAddService}
                onBulkAction={handleBulkAction}
                onFilterChange={handleFilterChange}
            />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    {isMobile ? (
                        <div className="space-y-4">
                            {filteredServices?.map((service) => (
                                <MobileServiceCard
                                    key={service?.id}
                                    service={service}
                                    onEdit={handleEditService}
                                    onDelete={handleDeleteService}
                                    onDuplicate={handleDuplicateService}
                                    onToggleStatus={handleToggleStatus}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                            <ServiceTable
                                services={filteredServices}
                                onEdit={handleEditService}
                                onDelete={handleDeleteService}
                                onDuplicate={handleDuplicateService}
                                onToggleStatus={handleToggleStatus}
                            />
                        </div>
                    )}

                    {filteredServices?.length === 0 && (
                        <div className="bg-card border border-border rounded-lg p-12 text-center">
                            <p className="text-muted-foreground">No services found matching your criteria</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <ServiceHierarchy hierarchyData={hierarchyData} />
                </div>
            </div>
            <ServiceEditModal
                isOpen={isModalOpen}
                service={selectedService}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveService}
            />
        </div>
    );
};

export default ServiceManagementInteractive;