'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

const ServiceSearchBar = ({
    onSearch,
    placeholder = 'Search services...',
    searchType = 'patient',
    showFilters = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const debounceTimer = useRef(null);

    const mockSuggestions = searchType === 'admin'
        ? ['Cardiology Services', 'Emergency Care', 'Diagnostic Imaging', 'Laboratory Tests', 'CPT-12345']
        : ['Cardiology Consultation', 'MRI Scan', 'Blood Test', 'X-Ray', 'Physical Therapy'];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
                setShowSuggestions(false);
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        const value = e?.target?.value;
        setSearchQuery(value);

        if (debounceTimer?.current) {
            clearTimeout(debounceTimer?.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (value?.trim()?.length > 0) {
                const filtered = mockSuggestions?.filter((item) =>
                    item?.toLowerCase()?.includes(value?.toLowerCase())
                );
                setSuggestions(filtered);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }

            if (onSearch) {
                onSearch(value);
            }
        }, 300);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        if (onSearch) {
            onSearch(suggestion);
        }
    };

    const handleSearchSubmit = (e) => {
        e?.preventDefault();
        setShowSuggestions(false);
        if (onSearch) {
            onSearch(searchQuery);
        }
    };

    const toggleFilters = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const highlightMatch = (text, query) => {
        if (!query?.trim()) return text;
        const parts = text?.split(new RegExp(`(${query})`, 'gi'));
        return parts?.map((part, index) =>
            part?.toLowerCase() === query?.toLowerCase() ? (
                <mark key={index} className="bg-accent/20 text-accent-foreground font-medium">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div ref={searchRef} className="relative w-full">
            <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex flex-row items-center">


                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={placeholder}
                        className=""
                    />

                    {showFilters && (
                        <button
                            type="button"
                            onClick={toggleFilters}
                            className={`absolute right-2 p-1.5 rounded-md transition-all duration-200 ease-out ${isFilterOpen ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                                }`}
                            aria-label="Toggle filters"
                        >
                            <Icon name="AdjustmentsHorizontalIcon" size={20} />
                        </button>
                    )}
                </div>
            </form>
            {showSuggestions && suggestions?.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-modal z-[200] max-h-64 overflow-y-auto">
                    <ul className="py-2">
                        {suggestions?.map((suggestion, index) => (
                            <li key={index}>
                                <button
                                    type="button"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="w-full px-4 py-2 text-left text-sm text-popover-foreground hover:bg-muted transition-colors duration-200 ease-out"
                                >
                                    {highlightMatch(suggestion, searchQuery)}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {isFilterOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-md shadow-modal z-[200] p-4">
                    <h3 className="text-sm font-semibold text-popover-foreground mb-3">Filters</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                            <Select className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                                <SelectTrigger className="">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All Categories</SelectItem>
                                    <SelectItem value='c'>Cardiology</SelectItem>
                                    <SelectItem value='e'>Emergency</SelectItem>
                                    <SelectItem value='d'>Diagnostics</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Price Range</label>
                            <Select className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select price" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='a'>All Prices</SelectItem>
                                    <SelectItem value='100'>Under $100</SelectItem>
                                    <SelectItem value='500'>$100 - $500</SelectItem>
                                    <SelectItem value='3-00'>Over $500</SelectItem>
                                </SelectContent>
                            </Select>

                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-md hover:bg-muted/80 transition-colors duration-200 ease-out"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors duration-200 ease-out"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceSearchBar;