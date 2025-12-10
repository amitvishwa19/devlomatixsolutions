'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Button } from '@/components/ui/button';

const ServiceToolbar = ({ onAddService, onBulkAction, onFilterChange }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

    const handleCategoryChange = (e) => {
        const value = e?.target?.value;
        setSelectedCategory(value);
        onFilterChange({ category: value, status: selectedStatus });
    };

    const handleStatusChange = (e) => {
        const value = e?.target?.value;
        setSelectedStatus(value);
        onFilterChange({ category: selectedCategory, status: value });
    };

    const handleBulkAction = (action) => {
        onBulkAction(action);
        setIsBulkMenuOpen(false);
    };

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4    rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2 w-full sm:w-auto">

                    <Select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="flex-1 sm:flex-none px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none "
                    >
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                            <SelectItem value="Diagnostics">Diagnostics</SelectItem>
                            <SelectItem value="Laboratory">Laboratory</SelectItem>
                            <SelectItem value="Surgery">Surgery</SelectItem>
                        </SelectContent>
                    </Select>

                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                        value={selectedStatus}
                        onChange={handleStatusChange}
                        className="flex-1 sm:flex-none px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none "
                    >
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">

                <Button
                    variant='outline'
                    onClick={onAddService}
                    className="transition-colors duration-200"
                >
                    <Icon name="PlusIcon" size={16} />
                    <span>Add Service</span>
                </Button>
            </div>
        </div>
    );
};

ServiceToolbar.propTypes = {
    onAddService: PropTypes?.func?.isRequired,
    onBulkAction: PropTypes?.func?.isRequired,
    onFilterChange: PropTypes?.func?.isRequired
};

export default ServiceToolbar;