import React from 'react'
import { AtsProvider } from './_context/AtsContext'
import AdminSidebar from './_component/AdminSidebar'
import GlobalSearch from './_component/GlobalSearch'

export default function AdminLayout({ children }) {
    return (
        <AtsProvider>
            <div className="min-h-screen bg-background">
                <AdminSidebar />
                <main className="pl-0 lg:pl-64 transition-all">
                    <div className="p-4 pt-16 lg:p-8 lg:pt-8">
                        {/* Top bar with global search */}
                        <div className="flex items-center justify-end mb-6">
                            <GlobalSearch />
                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </AtsProvider>
    )
}
