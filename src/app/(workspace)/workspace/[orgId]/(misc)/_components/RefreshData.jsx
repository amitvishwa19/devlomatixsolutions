import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { RefreshCcw } from 'lucide-react'
import { useOrg } from '@/providers/OrgProvider'
import { toast } from 'sonner'


export default function RefreshData() {
    const { refreshServer } = useOrg()
    const [loading, setloading] = useState(false)

    const handleRefreshData = async () => {
        setloading(true)
        await refreshServer()
        setTimeout(() => {
            setloading(false)
            toast.success('Organization data refreshed successfully')
        }, 2000);
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className='p-2 cursor-pointer' onClick={() => { handleRefreshData() }}>
                    <RefreshCcw size={18} className={`${loading && ' animate-spin'} `} />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Refresh org data</p>
            </TooltipContent>
        </Tooltip>
    )
}
