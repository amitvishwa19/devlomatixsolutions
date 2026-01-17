'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import SearchBar from './SearchBar';
import PatientResultsTable from './PatientResultsTable';
import PatientResultsCards from './PatientResultsCards';
import Icon from '@/components/ui/AppIcon';

export default function PatientSearchInteractive({ initialPatients }) {
    const [patients, setPatients] = useState(initialPatients);
    const [filteredPatients, setFilteredPatients] = useState(initialPatients);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let results = [...patients];

        if (searchQuery?.trim()) {
            results = results?.filter(patient =>
                patient?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                patient?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                patient?.phone?.includes(searchQuery) ||
                patient?.dob?.includes(searchQuery)
            );
        }

        if (filters?.insurance) {
            results = results?.filter(patient =>
                patient?.insurance?.toLowerCase() === filters?.insurance?.toLowerCase()
            );
        }

        if (filters?.doctor) {
            results = results?.filter(patient =>
                patient?.provider?.toLowerCase()?.includes(filters?.doctor?.toLowerCase())
            );
        }

        if (filters?.status) {
            results = results?.filter(patient =>
                patient?.insuranceStatus?.toLowerCase() === filters?.status?.toLowerCase()
            );
        }

        setFilteredPatients(results);
    }, [searchQuery, filters, patients]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleSort = (key, direction) => {
        const sorted = [...filteredPatients]?.sort((a, b) => {
            let aValue = a?.[key];
            let bValue = b?.[key];

            if (key === 'dob' || key === 'lastVisit') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredPatients(sorted);
    };

    const handleRecentSearchClick = (query) => {
        setSearchQuery(query);
    };

    return (
        <div className="space-y-6">
            <SearchBar onSearch={handleSearch} onFilterChange={handleFilterChange} />

            {filteredPatients?.length > 0 ? (
                <>
                    <div className="hidden lg:block">
                        <PatientResultsTable patients={filteredPatients} onSort={handleSort} />
                    </div>
                    <div className="lg:hidden">
                        <PatientResultsCards patients={filteredPatients} />
                    </div>
                </>
            ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="MagnifyingGlassIcon" size={32} className="text-text-secondary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No patients found</h3>
                    <p className="text-sm text-text-secondary max-w-md mx-auto">
                        Try adjusting your search criteria or filters to find the patient you're looking for.
                    </p>
                </div>
            )}
        </div>
    );
}

