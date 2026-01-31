import { useState, useMemo } from 'react';
import { useLocalStorage } from '@/carewell/hooks/useLocalStorage';
import { mockPatients } from './mockPatients';
import { calculatePatientStats, filterPatients } from './utils';
import { PatientStatsCards } from './PatientStatsCards';
import { PatientFilters } from './PatientFilters';
import { PatientList } from './PatientList';
import { PatientTableView } from './PatientTableView';
import { PatientDetailSheet } from './PatientDetailSheet';
import { NewPatientDialog } from './NewPatientDialog';

export default function PatientDashboard() {
  const [patients, setPatients] = useLocalStorage('hms_patients', mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  const stats = useMemo(() => calculatePatientStats(patients), [patients]);

  const filteredPatients = useMemo(() => {
    let result = filterPatients(patients, {
      search: searchQuery,
      status: statusFilter,
      gender: genderFilter,
      bloodGroup: bloodGroupFilter,
    });
    
    // Apply tag filter
    if (tagFilter.length > 0) {
      result = result.filter((patient) =>
        tagFilter.some((tagId) => patient.tags?.includes(tagId))
      );
    }
    
    return result;
  }, [patients, searchQuery, statusFilter, genderFilter, bloodGroupFilter, tagFilter]);

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setDetailSheetOpen(true);
  };

  const handleAddPatient = (newPatient) => {
    console.log('Adding patient:', newPatient);
    setPatients((prev) => [newPatient, ...prev]);
  };

  const handleUpdatePatient = (updatedPatient) => {
    console.log('Updating patient:', updatedPatient);
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    setSelectedPatient(updatedPatient);
  };

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="p-6 space-y-6 flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Patient Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View, register, and manage all patient records
            </p>
          </div>
          <NewPatientDialog onAddPatient={handleAddPatient} />
        </div>

        {/* Stats Cards */}
        <div className="shrink-0">
          <PatientStatsCards stats={stats} />
        </div>

        {/* Filters */}
        <div className="shrink-0">
          <PatientFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            genderFilter={genderFilter}
            onGenderFilterChange={setGenderFilter}
            bloodGroupFilter={bloodGroupFilter}
            onBloodGroupFilterChange={setBloodGroupFilter}
            tagFilter={tagFilter}
            onTagFilterChange={setTagFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Patient View */}
        <div className="flex-1 overflow-y-auto pb-4">
          {viewMode === 'list' && (
            <PatientList
              patients={filteredPatients}
              onPatientClick={handlePatientClick}
            />
          )}
          {viewMode === 'table' && (
            <PatientTableView
              patients={filteredPatients}
              onPatientClick={handlePatientClick}
            />
          )}
        </div>

        {/* Patient Detail Sheet */}
        <PatientDetailSheet
          patient={selectedPatient}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          onUpdatePatient={handleUpdatePatient}
        />
      </div>
    </div>
  );
}
