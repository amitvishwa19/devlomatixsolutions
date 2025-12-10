import Link from 'next/link'
import React from 'react'
import localFont from 'next/font/local'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'
import { routes } from '@/constants/routes'

const headingFont = localFont({
    src: '../../../../assets/fonts/font.woff2'
})

export function Logo() {
    const { activeOrg } = useAuth()


    return (
        <div className={cn('flex text-xl', headingFont.className)}>
            <Link href={routes?.taskman?.link}>{routes?.taskman?.title}</Link>
        </div>
    )
}
