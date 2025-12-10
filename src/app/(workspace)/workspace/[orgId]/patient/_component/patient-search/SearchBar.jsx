'use client';

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SearchBar({ onSearch, onFilterChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const searchRef = useRef(null);

    const mockSuggestions = [
        { id: 'P001', name: 'Sarah Johnson', type: 'name' },
        { id: 'P002', name: 'Michael Chen', type: 'name' },
        { id: 'P003', name: 'Emily Rodriguez', type: 'name' },
        { id: 'P004', name: 'David Martinez', type: 'name' },
        { id: 'P005', name: 'Lisa Anderson', type: 'name' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchQuery?.trim()?.length > 0) {
            const timer = setTimeout(() => {
                const filtered = mockSuggestions?.filter(item =>
                    item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                    item?.id?.toLowerCase()?.includes(searchQuery?.toLowerCase())
                );
                setSuggestions(filtered);
                setShowSuggestions(true);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchQuery]);

    const handleSearchChange = (e) => {
        setSearchQuery(e?.target?.value);
    };

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        onSearch(searchQuery);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion?.name);
        onSearch(suggestion?.name);
        setShowSuggestions(false);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        onSearch('');
    };

    const toggleAdvancedFilters = () => {
        setIsAdvancedOpen(!isAdvancedOpen);
    };

    return (
        <div ref={searchRef} className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <div className="flex items-center gap-3 bg-card border border-input rounded-lg px-2 py-2  transition-all duration-200 ease-out">
                            <Icon name="MagnifyingGlassIcon" size={24} className="text-text-secondary flex-shrink-0" />
                            <Input
                                type="text"
                                placeholder="Search by patient name, ID, phone, or date of birth..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className='border-0 focus:ring-0 focus:outline-none bg-transparent px-0 py-0'

                            />
                            {searchQuery && (
                                <Button
                                    variant='outline'
                                    onClick={handleClearSearch}

                                    aria-label="Clear search"
                                >
                                    <Icon name="XMarkIcon" size={20} className="text-text-secondary" />
                                </Button>
                            )}
                        </div>

                        {showSuggestions && suggestions?.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                                <div className="p-2">
                                    {suggestions?.map((suggestion) => (
                                        <button
                                            key={suggestion?.id}
                                            type="button"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 ease-out text-left"
                                        >
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Icon name="UserIcon" size={16} className="text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-foreground truncate">
                                                    {suggestion?.name?.split(new RegExp(`(${searchQuery})`, 'gi'))?.map((part, index) =>
                                                        part?.toLowerCase() === searchQuery?.toLowerCase() ? (
                                                            <span key={index} className="bg-primary/20 text-primary">{part}</span>
                                                        ) : (
                                                            <span key={index}>{part}</span>
                                                        )
                                                    )}
                                                </div>
                                                <div className="text-xs text-text-secondary font-mono">{suggestion?.id}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <Button
                        type="submit"
                        variant
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 ease-out flex items-center gap-2"
                    >
                        <Icon name="MagnifyingGlassIcon" size={20} />
                        <span>Search</span>
                    </Button>

                    <button
                        type="button"
                        onClick={toggleAdvancedFilters}
                        className="px-4 py-3 bg-card border border-input text-foreground rounded-lg font-medium hover:bg-muted transition-colors duration-200 ease-out flex items-center gap-2"
                    >
                        <Icon name="AdjustmentsHorizontalIcon" size={20} />
                        <span className="hidden sm:inline">Filters</span>
                    </button>
                </div>
            </form>
            {isAdvancedOpen && (
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-semibold text-foreground">Advanced Filters</h3>
                        <button
                            onClick={toggleAdvancedFilters}
                            className="p-1 rounded hover:bg-muted transition-colors duration-200 ease-out"
                            aria-label="Close filters"
                        >
                            <Icon name="XMarkIcon" size={20} className="text-text-secondary" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Date Range</label>
                            <select
                                onChange={(e) => onFilterChange({ dateRange: e?.target?.value })}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ease-out"
                            >
                                <option value="">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Insurance Provider</label>
                            <select
                                onChange={(e) => onFilterChange({ insurance: e?.target?.value })}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ease-out"
                            >
                                <option value="">All Providers</option>
                                <option value="blue-cross">Blue Cross Blue Shield</option>
                                <option value="aetna">Aetna</option>
                                <option value="united">United Healthcare</option>
                                <option value="cigna">Cigna</option>
                                <option value="medicare">Medicare</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Assigned Doctor</label>
                            <select
                                onChange={(e) => onFilterChange({ doctor: e?.target?.value })}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ease-out"
                            >
                                <option value="">All Doctors</option>
                                <option value="dr-mitchell">Dr. Sarah Mitchell</option>
                                <option value="dr-anderson">Dr. James Anderson</option>
                                <option value="dr-chen">Dr. Lisa Chen</option>
                                <option value="dr-rodriguez">Dr. Maria Rodriguez</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Appointment Status</label>
                            <select
                                onChange={(e) => onFilterChange({ status: e?.target?.value })}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ease-out"
                            >
                                <option value="">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="no-show">No Show</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={() => {
                                onFilterChange({});
                                setIsAdvancedOpen(false);
                            }}
                            className="px-4 py-2 text-text-secondary hover:text-foreground transition-colors duration-200 ease-out"
                        >
                            Clear Filters
                        </button>
                        <button
                            type="button"
                            onClick={toggleAdvancedFilters}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200 ease-out"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

