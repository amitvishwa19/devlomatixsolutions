import TipTap from '@/components/global/TipTap'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAction } from '@/hooks/use-action'
import { useOrg } from '@/providers/OrgProvider'
import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { termsCondition } from '../_action/terms-condition'
import { Loader, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function TermsnCondition() {
    const [terms, setTerms] = useState('')
    const { data: session } = useSession()
    const { server } = useOrg()
    const [loading, setLoading] = useState()

    useEffect(() => {
        setTerms(server?.terms)
    }, [server])

    const { execute: saveTerms } = useAction(termsCondition, {
        onSuccess: (data) => {
            setTerms(data?.term?.terms)
            setLoading(false)
            toast.success('Terms and Condition saved successfully', { id: 'term' })
        },
        onError: (error) => {
            console.log(error)
            setLoading(false)
            toast.error('Oops!, Something went wrong, please try again later')
        }
    })

    const handleSaveTerms = async () => {
        setLoading(true)
        toast.loading('Saving terms and condition', { id: 'term' })
        await saveTerms({ userId: session?.user?.userId, serverId: server.id, terms, type: 'update' })
    }


    return (
        <div className='flex flex-col absolute inset-0 overflow-hidden px-2-' >

            <div className=' p-2'>
                <div className='py-4 px-2 flex flex-col'>
                    <span>Terms and Condition</span>
                    <span className='text-xs text-muted-foreground'>Set terms and condition for your organization</span>
                </div>
                <div className='px-2'>
                    <Separator className='self-center' />
                </div>
            </div>


            <div className='flex flex-1 p-2'>
                <div className='h-full flex-1 p-2 relative' >
                    <TipTap onChange={(e) => { setTerms(e) }} data={terms} />
                </div>
            </div>

            <div className='p-4 self-end'>
                <Button disabled={loading} variant={'save'} size='sm' onClick={() => { handleSaveTerms() }}>
                    {loading ? <Loader className=' animate-spin' /> : <Save />}
                    Save
                </Button>
            </div>

        </div>

    )
}
