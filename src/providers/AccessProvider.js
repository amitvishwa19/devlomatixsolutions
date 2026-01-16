"use client";

import React, { createContext, useContext, useMemo } from "react";


const AccessContext = createContext(null);

const extractPermissions = (user) => {
    if (!user?.roles) return [];

    return user.roles.flatMap((role) =>
        role.permissions
            ?.filter((p) => p.status)
            .map((p) => p.value)
    );
};

export const AccessProvider = ({ user, children, }) => {
    const value = useMemo(() => {
        const roles = user?.roles?.map((r) => r.title) || [];
        const permissions = extractPermissions(user);



        const isSuperAdmin = roles.includes("Super Admin") || roles.includes("super-admin");

        return {
            user,
            roles,
            permissions,
            can: (permission) =>
                isSuperAdmin || permissions.includes(permission),
            hasRole: (role) =>
                isSuperAdmin || roles.includes(role),
        };
    }, [user]);

    return (
        <AccessContext.Provider value={value}>
            {children}
        </AccessContext.Provider>
    );
};

export const useAccess = () => {
    const ctx = useContext(AccessContext);
    if (!ctx) {
        throw new Error("useAccess must be used inside AccessProvider");
    }
    return ctx;
};