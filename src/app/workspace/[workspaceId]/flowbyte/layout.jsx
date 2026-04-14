'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

export default function FlowbyteLayout({ children }) {
    const pathname = usePathname();
    // Hide sidebar on the editor page if desired, but n8n keeps it collapsed.
    // We'll keep it for all pages for consistency.

    // Check if we are in the editor (contains a UUID after flowbyte/)
    const isEditor = /\/flowbyte\/[a-zA-Z0-9-]{10,}/.test(pathname);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <main className="flex-1 h-full min-w-0 flex flex-col relative overflow-hidden">
                {children}
            </main>
        </div>
    )
}
