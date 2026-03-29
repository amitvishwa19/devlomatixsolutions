'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'
import lightLogo from '@/assets/logo/light_logo.png'
import darkLogo from '@/assets/logo/dark_logo.png'
import { cn } from '@/lib/utils'
import { AppContext } from '@/providers/AppProvider'



export function AppLogo({ size = 130, link, className }) {

    const { theme } = useContext(AppContext)
    const [logo, setLogo] = useState(lightLogo)

    useEffect(() => {
        theme === 'dark' ? setLogo(darkLogo) : setLogo(lightLogo)

    }, [theme])


    return (
        <Link href={link}>
            <div className={cn("transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center", className)}>
                <Image
                    src={logo}
                    alt='logo'
                    height={size}
                    width={size}
                    className="h-auto w-auto object-contain"
                    priority={false}
                />
            </div>
        </Link>
    )
}
