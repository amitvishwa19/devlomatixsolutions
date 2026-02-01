'use client'
import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar';
import { Download, Plus } from 'lucide-react';
import { mockServices } from './utils/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { calculateServiceStats, filterServices } from './utils/utils';
import { useToast } from '@/hooks/use-toast';
import { ServiceStatsCards } from './components/ServiceStatsCards';
import { ServiceFilters } from './components/ServiceFilters';
import { ServiceList } from './components/ServiceList';
import { ServiceTableView } from './components/ServiceTableView';
import { ServiceAnalytics } from './components';
import { ServiceDetailSheet } from './components/ServiceDetailSheet';
import { NewServiceDialog } from './components/NewServiceDialog';

export default function ServicePage() {
    const { toast } = useToast();

    // Data state with localStorage persistence
    const [services, setServices] = useLocalStorage('hms_services', mockServices);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name_asc');
    const [viewMode, setViewMode] = useState('grid');

    // Sheet/Dialog states
    const [selectedService, setSelectedService] = useState(null);
    const [detailSheetOpen, setDetailSheetOpen] = useState(false);
    const [newServiceDialogOpen, setNewServiceDialogOpen] = useState(false);
    const [editService, setEditService] = useState(null);

    // Computed data
    const stats = useMemo(() => calculateServiceStats(services), [services]);

    const filteredServices = useMemo(() => {
        return filterServices(services, {
            search: searchQuery,
            status: statusFilter,
            category: categoryFilter,
            department: departmentFilter,
            serviceType: serviceTypeFilter,
            sortBy,
        });
    }, [services, searchQuery, statusFilter, categoryFilter, departmentFilter, serviceTypeFilter, sortBy]);

    // Handlers
    const handleServiceClick = (service) => {
        setSelectedService(service);
        setDetailSheetOpen(true);
    };

    const handleAddService = (newService) => {
        if (editService) {
            setServices(prev => prev.map(s => s.id === newService.id ? newService : s));
            setEditService(null);
        } else {
            setServices(prev => [...prev, newService]);
        }
    };

    const handleEditService = (service) => {
        setEditService(service);
        setDetailSheetOpen(false);
        setNewServiceDialogOpen(true);
    };

    const handleDuplicateService = (service) => {
        const duplicated = {
            ...service,
            id: `SVC-${String(services.length + 1).padStart(4, '0')}`,
            code: `${service.code}-COPY`,
            name: `${service.name} (Copy)`,
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setServices(prev => [...prev, duplicated]);
        setDetailSheetOpen(false);
        toast({
            title: 'Service Duplicated',
            description: `${duplicated.name} has been created.`,
        });
    };

    const handleDeleteService = (service) => {
        setServices(prev => prev.filter(s => s.id !== service.id));
        setDetailSheetOpen(false);
        toast({
            title: 'Service Deleted',
            description: `${service.name} has been removed.`,
            variant: 'destructive',
        });
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(services, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'services-export.json';
        a.click();
        URL.revokeObjectURL(url);
        toast({
            title: 'Export Complete',
            description: `${services.length} services exported successfully.`,
        });
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Service Catalog Dashboard'
                description='Manage hospital services, pricing, and categories'
                icon='hand-helping'
                actionComp={<div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button size="sm" onClick={() => setNewServiceDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service
                    </Button>
                </div>}
            />

            {/* Stats Cards */}
            <div className="shrink-0">
                <ServiceStatsCards stats={stats} />
            </div>

            {/* Filters */}
            <div className="shrink-0">
                <ServiceFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                    categoryFilter={categoryFilter}
                    onCategoryFilterChange={setCategoryFilter}
                    departmentFilter={departmentFilter}
                    onDepartmentFilterChange={setDepartmentFilter}
                    serviceTypeFilter={serviceTypeFilter}
                    onServiceTypeFilterChange={setServiceTypeFilter}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </div>

            {/* Results Count */}
            <div className="shrink-0 text-sm text-muted-foreground">
                Showing {filteredServices.length} of {services.length} services
            </div>


            <ScrollArea className='h-[65vh] flex flex-grow   rounded-md '>
                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pb-4">
                    {viewMode === 'grid' && (
                        <ServiceList
                            services={filteredServices}
                            onServiceClick={handleServiceClick}
                        />
                    )}
                    {viewMode === 'list' && (
                        <ServiceList
                            services={filteredServices}
                            onServiceClick={handleServiceClick}
                        />
                    )}
                    {viewMode === 'table' && (
                        <ServiceTableView
                            services={filteredServices}
                            onServiceClick={handleServiceClick}
                            onEditService={handleEditService}
                        />
                    )}
                    {viewMode === 'analytics' && (
                        <ServiceAnalytics services={services} />
                    )}
                </div>
            </ScrollArea>

            <div>
                {/* Detail Sheet */}
                <ServiceDetailSheet
                    service={selectedService}
                    open={detailSheetOpen}
                    onOpenChange={setDetailSheetOpen}
                    onEdit={handleEditService}
                    onDuplicate={handleDuplicateService}
                    onDelete={handleDeleteService}
                />

                {/* New/Edit Service Dialog */}
                <NewServiceDialog
                    open={newServiceDialogOpen}
                    onOpenChange={(open) => {
                        setNewServiceDialogOpen(open);
                        if (!open) setEditService(null);
                    }}
                    onAdd={handleAddService}
                    editService={editService}
                    totalServices={services.length}
                />
            </div>

        </div >
    )
}
