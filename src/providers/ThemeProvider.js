'use client'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from './AppProvider'


export function ThemeProvider({ children }) {

    const { theme } = useContext(AppContext)
    const [mounted, setMounted] = useState(false)


    useEffect(() => {
        setMounted(true)
        // Ensure default is light
        if (!theme || theme === 'system') {
            // Theme will be set by AppProvider
        }
    }, [theme])


    if (mounted) {
        const effectiveTheme = theme === 'system' ? 'dark' : (theme || 'dark');
        return (
            <div className={effectiveTheme}>{children}</div>
        )
    }
}


