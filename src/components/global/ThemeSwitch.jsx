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

        // <span className='border bg-red-100' onClick={themeToggle} style={{ cursor: 'pointer' }}>
        //     {
        //         light ? <BiMoon size={15} className={cn(className)} /> : <BiSun size={15} className={cn(className, 'dark:text-white')} />
        //     }
        // </span>
        // <Button variant='outline' size='sm' onClick={themeToggle} className=' border-none bg-transparent hover:bg-transparent'>
        //     {
        //         light ? <BiMoon size={15} className={cn(className)} /> : <BiSun size={15} className={cn(className, 'dark:text-white')} />
        //     }

        // </Button >

        <Toggle
            onPressedChange={(e) => {
                setAppTheme(e)
            }}
            className='hover:bg-transparent bg-transparent '>
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
