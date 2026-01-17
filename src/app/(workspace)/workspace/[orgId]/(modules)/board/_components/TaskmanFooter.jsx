import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

export function TaskmanFooter() {
    return (
        <div className='p-2 w-full'>
            <div className='flex items-center justify-end gap-2 border rounded-md p-2 dark:bg-[#162C46] bg-slate-300'>
                <Button variant='ghost' asChild>
                    <Link href={'/terms'}>Terms and Conditions</Link>
                </Button>
                <Button variant='ghost' asChild>
                    <Link href={'/terms'}>Privacy Policy</Link>
                </Button>
            </div>
        </div>
    )
}
