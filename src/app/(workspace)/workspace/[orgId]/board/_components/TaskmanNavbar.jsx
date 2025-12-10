'use client'
import React from 'react'
import { Logo } from './Logo'
import AppThemeSwitcher from '@/components/global/appThemeSwitcher'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import MobileSidebar from './MobileSidebar'
import AuthOrgSelector from '@/components/global/AuthOrgSelector'



export function TaskmanNavbar() {



    return (
        <div className='p-2 w-full  '>

            <div className='flex fles items-center justify-between border p-3 rounded-md dark:bg-[#162C46] bg-slate-300'>
                <div className='flex gap-2 items-center'>
                    <MobileSidebar />
                    <Logo />
                </div>
                <div className='flex gap-2 items-center'>
                    <Button variant='ghost' asChild>
                        <Link href={'/'}>Home</Link>
                    </Button>
                    <Button variant='ghost' asChild>
                        <Link href={'/project'}>Projects</Link>
                    </Button>
                    <AppThemeSwitcher />
                    <AuthOrgSelector />
                </div>
            </div>
        </div>
    )
}
