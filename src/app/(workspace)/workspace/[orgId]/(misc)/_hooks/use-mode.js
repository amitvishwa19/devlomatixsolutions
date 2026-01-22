'use client'

import { useEffect, useState } from 'react'



export function useNavMode() {
    const [mode, setMode] = useState('sidebar')

    // read once on mount
    useEffect(() => {
        const stored = localStorage.getItem('nav-mode')
        if (stored) setMode(stored)
    }, [])

    // write whenever it changes
    useEffect(() => {
        localStorage.setItem('nav-mode', mode)
    }, [mode])

    return { mode, setMode }
}
