"use client";

import React, { createContext, useContext, useMemo } from "react";


const KonnectxContext = createContext(null);

const extractPermissions = (user) => {
    if (!user?.roles) return [];

    return user.roles.flatMap((role) =>
        role.permissions
            ?.filter((p) => p.status)
            .map((p) => p.value)
    );
};

export const KonnectxProvider = ({ children }) => {

    return (
        <KonnectxContext.Provider>
            {children}
        </KonnectxContext.Provider>
    );
};

export const useKonnectx = () => {
    const ctx = useContext(KonnectxContext);
    if (!ctx) {
        throw new Error("useKonnectx must be used inside KonnectxProvider");
    }
    return ctx;
};