import Link from 'next/link'
import React from 'react'

export function BottomNav() {
    return (
        <div className='p-4 dark:bg-[#162C46] bg-slate-200 rounded-t-md'>
            <div className='dark:bg-[#162C46]  px-4  bg-slate-200 shadow-sm flex justify-between text-sm rounded-lg font-semibold '>
                <div className='md:max-w-screen-3xl mx-auto flex item-center w-full justify-between'>
                    © Copyright {process.env.APP_NAME || 'DEVLOMATIX'}

                    <div className='hidden md:block'>
                        <div className=' space-x-4 md:block md:w-auto flex item-center '>
                            <Link href={'/privacy'} className='text-[13px]'>Privacy Policy</Link>
                            <Link href={'/terms'} className='text-[13px]'>Terms & Conditions</Link>
                            <span className='text-[13px] text-muted-foreground'>Version: {process.env.APP_VERSION || '1.0.0'}</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
