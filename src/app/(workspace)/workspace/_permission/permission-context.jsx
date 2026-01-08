"use client";

import { createContext, useContext } from "react";

const PermissionContext = createContext({
    permissions: [],
});

export const PermissionProvider = ({ user, children }) => {
    const permissions = useMemo(() => {
        return (
            user?.roles?.flatMap(role =>
                role.permissions
                    ?.filter(p => p.status)
                    .map(p => p.value)
            ) || []
        );
    }, [user]);

    return (
        <PermissionContext.Provider value={permissions}>
            {children}
        </PermissionContext.Provider>
    );
};

export function usePermissions() {
    return useContext(PermissionContext);
}

export const usePermissions = () => useContext(PermissionContext);