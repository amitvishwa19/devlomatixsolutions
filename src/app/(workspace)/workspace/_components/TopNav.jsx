'use client'
import React from 'react'
import MobileToggleMenu from './MobileToggleMenu'
import { useSelector } from 'react-redux'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { useParams, usePathname } from 'next/navigation'
import OrgAuthBlock from './OrgAuthBlock'
import ThemeSwitcher from '@/components/global/ThemeSwitch'

export function TopNav() {
    const title = useSelector((state) => state.org.topnavTitle)
    const server = useSelector((state) => state.org.server)
    const params = useParams()
    const pathName = usePathname()
    const paths = pathName === '/' ? [''] : pathName.split('/')

    //console.log('@@path', paths)

    return (
        <div className=' bg-primary/20 text-foreground dark:bg-[#171F26] min-h-12  flex items-center justify-between border border-t-0 border-l-0 p-2'>
            <div>
                <div className='ml-2'>
                    <MobileToggleMenu />
                </div>
                <div className='px-2 hidden md:flex items-center gap-2'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {paths.map((path, index) => (
                                < div key={index} className='flex items-center gap-2 text-xs'>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink href={`${path}`} className=' capitalize'>
                                            {path === '' ? 'dashboard' : path}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {index !== paths.length - 1 && <BreadcrumbSeparator />}
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>

            <div className=' justify-end'>
                <div className='flex flex-row gap-4 items-center mr-4'>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    )
}
