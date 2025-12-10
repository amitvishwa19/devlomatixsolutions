'use client';

import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Input } from '@/components/ui/input';

const SearchSuggestions = ({
    query = '',
    suggestions = [],
    onSelect,
    isLoading = false,
    placeholder = 'Search...',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [inputValue, setInputValue] = useState(query);
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef?.current && !containerRef?.current?.contains(event?.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e?.target?.value;
        setInputValue(value);
        setIsOpen(value?.length > 0);
        setSelectedIndex(-1);
    };

    const handleInputFocus = () => {
        if (inputValue?.length > 0) {
            setIsOpen(true);
        }
    };

    const handleKeyDown = (e) => {
        if (!isOpen || suggestions?.length === 0) return;

        switch (e?.key) {
            case 'ArrowDown':
                e?.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions?.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e?.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e?.preventDefault();
                if (selectedIndex >= 0 && suggestions?.[selectedIndex]) {
                    handleSelect(suggestions?.[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setSelectedIndex(-1);
                inputRef?.current?.blur();
                break;
            default:
                break;
        }
    };

    const handleSelect = (suggestion) => {
        setInputValue(suggestion?.label || suggestion);
        setIsOpen(false);
        setSelectedIndex(-1);
        if (onSelect) {
            onSelect(suggestion);
        }
    };

    const highlightMatch = (text, query) => {
        if (!query) return text;

        const parts = text?.split(new RegExp(`(${query})`, 'gi'));
        return parts?.map((part, index) =>
            part?.toLowerCase() === query?.toLowerCase() ? (
                <mark key={index} className="bg-primary/20 text-primary font-medium">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">

                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className=" transition-all duration-200 ease-out"
                />
                {inputValue && (
                    <button
                        onClick={() => {
                            setInputValue('');
                            setIsOpen(false);
                            inputRef?.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors duration-150"
                    >
                        <Icon name="XMarkIcon" size={16} variant="outline" />
                    </button>
                )}
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevation-2 overflow-hidden z-[200] max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center">
                            <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="mt-2 text-sm text-text-secondary">Searching...</p>
                        </div>
                    ) : suggestions?.length > 0 ? (
                        <ul className="py-2">
                            {suggestions?.map((suggestion, index) => {
                                const label = suggestion?.label || suggestion;
                                const description = suggestion?.description;
                                const isSelected = index === selectedIndex;

                                return (
                                    <li key={index}>
                                        <button
                                            onClick={() => handleSelect(suggestion)}
                                            className={`w-full px-4 py-2.5 text-left transition-colors duration-150 ease-out flex items-start gap-3 ${isSelected
                                                ? 'bg-muted' : 'hover:bg-muted'
                                                }`}
                                        >
                                            <Icon
                                                name={suggestion?.icon || 'MagnifyingGlassIcon'}
                                                size={18}
                                                variant="outline"
                                                className="text-text-secondary mt-0.5 flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm text-text-primary">
                                                    {highlightMatch(label, inputValue)}
                                                </div>
                                                {description && (
                                                    <div className="text-xs text-text-secondary mt-0.5 truncate">
                                                        {description}
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <Icon
                                                    name="ArrowRightIcon"
                                                    size={16}
                                                    variant="outline"
                                                    className="text-primary flex-shrink-0 mt-0.5"
                                                />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-sm text-text-secondary">
                            No results found for "{inputValue}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchSuggestions;