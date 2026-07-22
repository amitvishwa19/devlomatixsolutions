'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext, useEffect, useState } from 'react'
import lightLogo from '@/assets/logo/light_logo.png'
import darkLogo from '@/assets/logo/dark_logo.png'
import { cn } from '@/lib/utils'
import { AppContext } from '@/providers/AppProvider'
import { useSettings } from '@/providers/WorkspaceProvider'


export function AppLogo({ size = 130, width, height, link = '/', className, border = true }) {

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

    const logoWidth = Number(width || size || 130)
    const logoHeight = Number(height || size || 130)

    const content = (
        <div
            className={cn("transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center p-1 rounded-md shrink-0", className)}
        >
            <Image
                src={logo}
                alt='logo'
                width={logoWidth}
                height={logoHeight}
                className="object-contain"
                style={{
                    width: `${logoWidth}px`,
                    height: height ? `${height}px` : 'auto',
                    maxHeight: `${logoHeight}px`
                }}
                priority={false}
            />
        </div>
    )

    if (link) {
        return (
            <Link href={link} className="inline-flex shrink-0">
                {content}
            </Link>
        )
    }

    return content
}
