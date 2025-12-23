import { AppLogo } from '@/components/global/AppLogo'
import { AuthSelector } from '@/components/global/AuthSelector'
import AppThemeSwitcher from '@/components/global/ThemeSwitch'
import Link from 'next/link'
import React from 'react'

import { DM_Mono } from 'next/font/google'

const textFont = DM_Mono({
    subsets: ['latin'],
    weight: ['300', '400', '500']
})

export function TopNav() {

    const navItems = [
        { title: 'Home', link: '/' },
        { title: 'About', link: '/about' },
        { title: 'Contact', link: '/contact' },
        { title: 'Projects', link: '/project' }
    ]


    return (
        <div className='flex dark:bg-[#162C46] bg-slate-200 h-14 px-2 rounded items-center justify-between'>
            <div>
                <AppLogo link={'/'} size={100} />
            </div>

            <div className='flex items-center justify-between gap-4'>
                <div className={`flex gap-4 text-[16px] ${textFont.className} `}>
                    {
                        navItems.map((item, index) => {
                            return (
                                <Link key={index} href={item.link} className='hover:text-[#64FFDA]'>{item.title}</Link>
                            )
                        })
                    }
                </div>
                <AppThemeSwitcher />
                <AuthSelector />
            </div>
        </div>
    )
}
