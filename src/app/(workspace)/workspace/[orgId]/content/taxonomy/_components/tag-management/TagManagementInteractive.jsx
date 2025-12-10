'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import TagTable from './TagTable';
import TagCreationForm from './TagCreationForm';
import BulkOperationsToolbar from './BulkOperationsToolbar';
import TagAnalytics from './TagAnalytics';
import SearchSuggestions from '../SearchSuggestions';

const TagManagementInteractive = ({ initialTags, initialAnalytics }) => {
    const [tags, setTags] = useState(initialTags);
    const [filteredTags, setFilteredTags] = useState(initialTags);
    const [selectedTags, setSelectedTags] = useState([]);
    const [editingTag, setEditingTag] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [analytics, setAnalytics] = useState(initialAnalytics);


    useEffect(() => {
        let result = [...tags];

        if (searchQuery) {
            result = result?.filter(tag =>
                tag?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                tag?.categories?.some(cat => cat?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
            );
        }

        setFilteredTags(result);
    }, [searchQuery, tags]);

    const updateAnalytics = (updatedTags) => {
        const totalUsage = updatedTags?.reduce((sum, tag) => sum + tag?.usageCount, 0);
        const activeTags = updatedTags?.filter(tag => tag?.usageCount > 0)?.length;
        const unusedTags = updatedTags?.filter(tag => tag?.usageCount === 0)?.length;

        setAnalytics({
            totalTags: updatedTags?.length,
            activeTags,
            unusedTags,
            totalUsage
        });
    };

    const handleCreateTag = (formData) => {
        const newTag = {
            id: tags?.length + 1,
            name: formData?.name,
            color: formData?.color,
            description: formData?.description,
            usageCount: 0,
            categories: formData?.categories,
            createdAt: new Date()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        updateAnalytics(updatedTags);
        success(`Tag "${formData?.name}" created successfully`);
    };

    const handleEditTag = (tag) => {
        setEditingTag(tag);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateTag = (formData) => {
        const updatedTags = tags?.map(tag =>
            tag?.id === editingTag?.id
                ? { ...tag, ...formData }
                : tag
        );
        setTags(updatedTags);
        updateAnalytics(updatedTags);
        setEditingTag(null);
        success(`Tag "${formData?.name}" updated successfully`);
    };

    const handleDeleteTag = (tagId) => {
        const tag = tags?.find(t => t?.id === tagId);
        if (tag && tag?.usageCount > 0) {
            warning(`Tag "${tag?.name}" is in use (${tag?.usageCount} times). Consider reassigning before deletion.`);
            return;
        }

        const updatedTags = tags?.filter(t => t?.id !== tagId);
        setTags(updatedTags);
        updateAnalytics(updatedTags);
        setSelectedTags(selectedTags?.filter(id => id !== tagId));
        success(`Tag deleted successfully`);
    };

    const handleBulkEdit = () => {
        if (selectedTags?.length === 0) return;
        warning(`Bulk edit for ${selectedTags?.length} tags - Feature coming soon`);
    };

    const handleBulkDelete = () => {
        const tagsToDelete = tags?.filter(tag => selectedTags?.includes(tag?.id));
        const tagsInUse = tagsToDelete?.filter(tag => tag?.usageCount > 0);

        if (tagsInUse?.length > 0) {
            error(`Cannot delete ${tagsInUse?.length} tags that are currently in use`);
            return;
        }

        const updatedTags = tags?.filter(tag => !selectedTags?.includes(tag?.id));
        setTags(updatedTags);
        updateAnalytics(updatedTags);
        setSelectedTags([]);
        success(`${tagsToDelete?.length} tags deleted successfully`);
    };

    const handleBulkMerge = (newTagName) => {
        if (selectedTags?.length < 2) {
            error('Select at least 2 tags to merge');
            return;
        }

        const tagsToMerge = tags?.filter(tag => selectedTags?.includes(tag?.id));
        const totalUsage = tagsToMerge?.reduce((sum, tag) => sum + tag?.usageCount, 0);
        const allCategories = [...new Set(tagsToMerge.flatMap(tag => tag.categories))];

        const mergedTag = {
            id: Math.max(...tags?.map(t => t?.id)) + 1,
            name: newTagName,
            color: tagsToMerge?.[0]?.color,
            description: `Merged from: ${tagsToMerge?.map(t => t?.name)?.join(', ')}`,
            usageCount: totalUsage,
            categories: allCategories,
            createdAt: new Date()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };

        const updatedTags = [
            ...tags?.filter(tag => !selectedTags?.includes(tag?.id)),
            mergedTag
        ];

        setTags(updatedTags);
        updateAnalytics(updatedTags);
        setSelectedTags([]);
        success(`${tagsToMerge?.length} tags merged into "${newTagName}"`);
    };

    const handleFilterChange = (filters) => {
        let result = [...tags];

        if (filters?.colorFilter !== 'all') {
            result = result?.filter(tag => {
                const color = tag?.color?.toLowerCase();
                switch (filters?.colorFilter) {
                    case 'blue': return color?.includes('2563eb') || color?.includes('blue');
                    case 'red': return color?.includes('dc2626') || color?.includes('red');
                    case 'green': return color?.includes('059669') || color?.includes('green');
                    case 'orange': return color?.includes('d97706') || color?.includes('orange');
                    case 'purple': return color?.includes('7c3aed') || color?.includes('purple');
                    default: return true;
                }
            });
        }

        if (filters?.usageRange !== 'all') {
            result = result?.filter(tag => {
                switch (filters?.usageRange) {
                    case 'high': return tag?.usageCount >= 50;
                    case 'medium': return tag?.usageCount >= 10 && tag?.usageCount < 50;
                    case 'low': return tag?.usageCount >= 1 && tag?.usageCount < 10;
                    case 'unused': return tag?.usageCount === 0;
                    default: return true;
                }
            });
        }

        setFilteredTags(result);
    };

    const searchSuggestions = tags?.filter(tag => tag?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()))?.slice(0, 5)?.map(tag => ({
        label: tag?.name,
        description: `${tag?.usageCount} uses • ${tag?.categories?.length} categories`,
        icon: 'TagIcon'
    }));

    const handleSearchSelect = (suggestion) => {
        setSearchQuery(suggestion?.label);
    };

    return (
        <div className="space-y-6">
            <TagAnalytics analytics={analytics} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">
                    <SearchSuggestions
                        query={searchQuery}
                        suggestions={searchSuggestions}
                        onSelect={handleSearchSelect}
                        placeholder="Search tags by name or category..."
                        className="w-full"
                    />

                    <TagTable
                        tags={filteredTags}
                        onEdit={handleEditTag}
                        onDelete={handleDeleteTag}
                        onSelect={setSelectedTags}
                        selectedTags={selectedTags}
                    />
                </div>

                <div className="lg:col-span-1">
                    <div className="">
                        <TagCreationForm
                            onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
                            editingTag={editingTag}
                            onCancel={() => setEditingTag(null)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

TagManagementInteractive.propTypes = {
    initialTags: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            name: PropTypes?.string?.isRequired,
            color: PropTypes?.string?.isRequired,
            description: PropTypes?.string,
            usageCount: PropTypes?.number?.isRequired,
            categories: PropTypes?.arrayOf(PropTypes?.string)?.isRequired,
            createdAt: PropTypes?.string?.isRequired
        })
    )?.isRequired,
    initialAnalytics: PropTypes?.shape({
        totalTags: PropTypes?.number?.isRequired,
        activeTags: PropTypes?.number?.isRequired,
        unusedTags: PropTypes?.number?.isRequired,
        totalUsage: PropTypes?.number?.isRequired
    })?.isRequired
};

export default TagManagementInteractive;