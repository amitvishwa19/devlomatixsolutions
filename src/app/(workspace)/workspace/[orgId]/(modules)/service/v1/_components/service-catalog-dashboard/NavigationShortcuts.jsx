'use client';

import { useState } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const NavigationShortcuts = ({ shortcuts }) => {
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shortcuts?.map((shortcut) => (
                    <Link
                        key={shortcut?.id}
                        href={shortcut?.path}
                        onMouseEnter={() => setHoveredId(shortcut?.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`flex items-center gap-3 p-4 border border-border rounded-lg transition-all duration-200 ${hoveredId === shortcut?.id
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'bg-background hover:bg-muted'
                            }`}
                    >
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${hoveredId === shortcut?.id ? 'bg-primary-foreground/20' : 'bg-primary/10'
                                }`}
                        >
                            <Icon
                                name={shortcut?.icon}
                                size={20}
                                className={hoveredId === shortcut?.id ? 'text-primary-foreground' : 'text-primary'}
                            />
                        </div>
                        <div>
                            <p
                                className={`text-sm font-medium ${hoveredId === shortcut?.id ? 'text-primary-foreground' : 'text-foreground'
                                    }`}
                            >
                                {shortcut?.label}
                            </p>
                            <p
                                className={`text-xs ${hoveredId === shortcut?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                    }`}
                            >
                                {shortcut?.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

NavigationShortcuts.propTypes = {
    shortcuts: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            label: PropTypes?.string?.isRequired,
            description: PropTypes?.string?.isRequired,
            path: PropTypes?.string?.isRequired,
            icon: PropTypes?.string?.isRequired,
        })
    )?.isRequired,
};

export default NavigationShortcuts;