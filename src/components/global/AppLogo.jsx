'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'
import lightLogo from '@/assets/logo/light_logo.png'
import darkLogo from '@/assets/logo/dark_logo.png'
import { cn } from '@/lib/utils'
import { AppContext } from '@/providers/AppProvider'
import { useSettings } from '@/providers/SettingProvider'


export function AppLogo({ size = 130, height, width, link, className }) {

    const { theme } = useContext(AppContext)
    const { settings } = useSettings()
    const [logo, setLogo] = useState(lightLogo)

    useEffect(() => {
        // Priority 1: Custom Logo from settings
        if (settings?.branding?.logoUrl) {
            setLogo(settings.branding.logoUrl)
            return
        }

        // Priority 2: Hardcoded theme-based logo
        theme === 'dark' ? setLogo(darkLogo) : setLogo(lightLogo)

    }, [theme, settings])


    const primaryColor = settings?.branding?.primaryColor

    return (
        <Link href={link}>
            <div 
                className={cn("transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center p-1 rounded-md", className)}
                style={primaryColor ? { border: `1px solid ${primaryColor}33`, backgroundColor: `${primaryColor}11` } : {}}
            >
                <Image
                    src={logo}
                    alt='logo'
                    height={height}
                    width={width}
                    className="object-contain"
                    style={{ height: 'auto' }}
                    priority={false}
                />
            </div>
        </Link>
    )
}
