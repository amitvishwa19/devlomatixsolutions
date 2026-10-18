'use client'

import React, { useContext, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AppContext } from '@/providers/AppProvider'
import { useSettings } from '@/providers/WorkspaceProvider'

export function AppLogo({ size = 130, width, height, link = '/', className, border = true }) {
    const { theme } = useContext(AppContext)
    const { settings } = useSettings()
    const [hasError, setHasError] = useState(false)

    // Resolve custom logo URL from DB settings
    const logoUrl = useMemo(() => {
        const branding = settings?.branding || {}

        // Priority 1: Theme-specific logo from DB
        if (theme === 'dark') {
            const dark = branding.logoDarkUrl || branding.darkLogoUrl
            if (dark && typeof dark === 'string' && dark.trim() !== '') {
                return dark.trim()
            }
        } else {
            const light = branding.logoLightUrl || branding.lightLogoUrl
            if (light && typeof light === 'string' && light.trim() !== '') {
                return light.trim()
            }
        }

        // Priority 2: Generic logo from DB
        if (branding.logoUrl && typeof branding.logoUrl === 'string' && branding.logoUrl.trim() !== '') {
            return branding.logoUrl.trim()
        }

        // No logo configured in DB
        return null
    }, [theme, settings])

    // Reset error state when logoUrl changes
    useEffect(() => {
        setHasError(false)
    }, [logoUrl])

    const logoWidth = Number(width || size || 130)
    const logoHeight = Number(height || size || 130)

    const content = (
        <div
            className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden flex items-center justify-center p-1 rounded-md shrink-0 select-none",
                className
            )}
        >
            {logoUrl && !hasError ? (
                <img
                    src={logoUrl}
                    alt="Devlomatix"
                    className="object-contain"
                    style={{
                        maxWidth: `${logoWidth}px`,
                        maxHeight: `${logoHeight}px`,
                        width: width ? `${width}px` : 'auto',
                        height: height ? `${height}px` : 'auto'
                    }}
                    onError={() => setHasError(true)}
                />
            ) : (
                <span
                    className="font-black tracking-tight text-foreground whitespace-nowrap text-lg sm:text-xl"
                    style={{
                        fontSize: height ? `${Math.max(16, Math.min(Math.round(height * 0.52), 24))}px` : undefined,
                        lineHeight: 1.2
                    }}
                >
                    Devlomatix
                </span>
            )}
        </div>
    )

    if (link) {
        return (
            <Link href={link} className="inline-flex shrink-0 items-center">
                {content}
            </Link>
        )
    }

    return content
}
