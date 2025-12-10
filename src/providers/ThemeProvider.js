'use client'
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from './AppProvider'


export function ThemeProvider({ children }) {

    const { theme } = useContext(AppContext)
    const [mounted, setMounted] = useState(false)


    useEffect(() => {
        setMounted(true)
    }, [])


    if (mounted) {
        return (
            <div className={theme}>{children}</div>
        )
    }
}
