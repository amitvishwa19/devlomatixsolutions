import { Search } from 'lucide-react'
import React from 'react'

export default function TableNoItemFound() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">No items found</p>
            <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
            </p>
        </div>
    )
}
