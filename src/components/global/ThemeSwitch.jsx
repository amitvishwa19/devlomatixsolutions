'use client'
import React, { useState, useContext, useEffect } from 'react'
import { BiSun } from "react-icons/bi";
import { BiMoon } from "react-icons/bi";
import { AppContext } from '@/providers/AppProvider';
import { cn } from '@/lib/utils';
import { Moon, MoonIcon, Sun, SunIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';


export default function ThemeSwitcher({ className }) {
    const [isOn, setIsOn] = useState(false)
    const [light, setLight] = useState(true)
    const { theme, themeToggle, setAppTheme } = useContext(AppContext)


    useEffect(() => {
        theme === 'light' ? setLight(true) : setLight(false)
    }, [theme])

    return (


        <Toggle
            onPressedChange={(e) => {
                setAppTheme(e)
            }}
            className='hover:bg-transparent bg-transparent focus:ring-0 focus:ring-offset-0 p-0 w-auto h-auto'>
            <div className='p-1 '>
                {theme === 'dark' ?
                    (
                        <SunIcon size={18} className='text-primary' />
                    ) :
                    (
                        <MoonIcon size={18} />
                    )}
            </div>

            {/* <div className='flex flex-row p-2 rounded-md gap-2 bg-primary'>
                <SunIcon size={18} className='' />
                <MoonIcon size={18} className='' />
            </div> */}
        </Toggle>

    )
}
