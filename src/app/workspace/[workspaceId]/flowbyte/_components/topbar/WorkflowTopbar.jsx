'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, Loader2, Save } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useReactFlow } from '@xyflow/react'
import { useAuth } from '@/providers/AuthProvider'
import { useAction } from '@/hooks/use-action'
import { saveWorkflow } from '../../_actions/save-workflow'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function WorkflowTopbar({ title, subtitle, workflowId, isPublished }) {
    const router = useRouter()
    const { user } = useAuth()
    const { workspaceId } = useParams()
    const { toObject } = useReactFlow()

    const { execute, isLoading } = useAction(saveWorkflow, {
        onSuccess: (data) => {
            toast.success(`Workflow "${data?.name}" saved successfully`, { id: 'save-workflow' })
        },
        onError: (error) => {
            toast.error(error, { id: 'save-workflow' })
        }
    })

    const handleSave = () => {
        const flowDefinition = JSON.stringify(toObject())
        toast.loading("Saving workflow...", { id: 'save-workflow' })
        execute({ 
            userId: user?.id, 
            workspaceId, 
            workflowId, 
            definition: flowDefinition 
        })
    }

    return (
        <div className='flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-50'>
            <div className='flex items-center gap-4'>
                <Button 
                    variant='ghost' 
                    size="icon" 
                    onClick={() => router.back()} 
                    className='rounded-xl hover:bg-muted'
                >
                    <ChevronLeftIcon size={20} />
                </Button>
                <div>
                    <h4 className='font-bold text-foreground leading-none mb-1 flex items-center gap-2'>
                        {title}
                        {isPublished ? (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white h-5 px-1.5 text-[9px] font-bold">LIVE</Badge>
                        ) : (
                            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-bold">DRAFT</Badge>
                        )}
                    </h4>
                    {subtitle && (
                        <p className='text-[10px] text-muted-foreground uppercase tracking-widest font-bold'>
                            ID: {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className='flex items-center gap-2'>
                <Button
                    size='sm'
                    className='bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl gap-2 shadow-lg shadow-primary/20'
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 size={16} className='animate-spin' /> : <Save size={16} />}
                    Save Changes
                </Button>
            </div>
        </div>
    )
}
