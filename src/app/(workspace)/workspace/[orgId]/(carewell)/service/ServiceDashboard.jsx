import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';

import { ServiceStatsCards } from './ServiceStatsCards';
import { ServiceFilters } from './ServiceFilters';
import { ServiceList } from './ServiceList';
import { ServiceTableView } from './ServiceTableView';
import { ServiceDetailSheet } from './ServiceDetailSheet';
import { NewServiceDialog } from './NewServiceDialog';
import { ServiceAnalytics } from './components/ServiceAnalytics';

import { mockServices } from './mockData';
import { calculateServiceStats, filterServices } from './utils';

export default function ServiceDashboard() {
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
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground">Service Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage hospital services, pricing, and categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={() => setNewServiceDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

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
    </div>
  );
}
