"use client";

import React from 'react';
import { useWaData } from './_hooks/useWaData';
import { AccountSwitcher } from './_components/AccountSwitcher';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function V2Layout({ children }) {
    const data = useWaData();

    // Since we can't easily modify the global AppTopNav without affecting other modules,
    // we can provide the V2-specific actions (like account switching) in a sub-header 
    // or pass the data context down.

    // However, to keep it simple and "direct copy", we'll just pass the data to children.
    // We might need a Context Provider if we want to avoid prop drilling, 
    // but the reference project uses props.

    // Let's use a simple React Context to share 'data' with all V2 pages.
    return (
        <V2DataProvider data={data}>
            <div className="flex flex-col h-full">
                {/* Optional: Add a V2-specific sub-header if needed for account switching */}
                {/* <div className="flex items-center justify-between px-6 py-2 border-b border-border/50 bg-card/30">
                    <div className="flex items-center gap-4">
                        <h1 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">KonnectX V-2</h1>
                        <AccountSwitcher 
                            accounts={data.phoneNumbers.data || []} 
                            activeAccount={data.activeAccount} 
                            onSelect={data.setActiveAccountId} 
                        />
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => data.refetchAll()}
                        className="text-muted-foreground hover:text-primary"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div> */}
                <div className="flex-1 overflow-auto p-4 lg:p-6">
                    {children}
                </div>
            </div>
        </V2DataProvider>
    );
}

const V2DataContext = React.createContext(null);

export function V2DataProvider({ children, data }) {
    return (
        <V2DataContext.Provider value={data}>
            {children}
        </V2DataContext.Provider>
    );
}

export function useV2Data() {
    const context = React.useContext(V2DataContext);
    if (!context) {
        throw new Error('useV2Data must be used within a V2DataProvider');
    }
    return context;
}
