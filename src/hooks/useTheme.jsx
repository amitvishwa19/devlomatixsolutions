'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from "react";


const AppThemeContext = createContext(undefined);

export function AppThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("theme");
            if (stored && stored !== "system") return stored;
            return "light";
        }
        return "light";
    });

    const [resolvedTheme, setResolvedTheme] = useState("light");

    useEffect(() => {
        const root = window.document.documentElement;

        const updateTheme = () => {
            let effectiveTheme

            if (theme === "system") {
                effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            } else {
                effectiveTheme = theme;
            }

            root.classList.remove("light", "dark");
            root.classList.add(effectiveTheme);
            setResolvedTheme(effectiveTheme);
        };

        updateTheme();
        localStorage.setItem("theme", theme);

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (theme === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    return (
        <AppThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
            {children}
        </AppThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(AppThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
