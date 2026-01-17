import { QueryProvider } from '@/providers/QueryProvider'
import React from 'react'

export default function ChannelLayout({ children }) {
    return (
        <div className=''>
            {/* <QueryProvider> */}
            {children}
            {/* </QueryProvider> */}
        </div>
    )
}
