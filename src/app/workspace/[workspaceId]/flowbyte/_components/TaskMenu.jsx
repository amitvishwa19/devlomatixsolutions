'use client'
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { TaskRegistry } from '../_lib/tasks/registry'
import { TaskType } from '../_utils/types'

export default function TaskMenu() {
    return (
        <aside className='w-64 border-r bg-card/30 backdrop-blur-sm h-full overflow-y-auto p-4 flex flex-col gap-4'>
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                    Task Library
                </h3>
                <Accordion type="multiple" collapsible="true" className="w-full" defaultValue={['extraction', 'interaction', 'delivery']}>
                    <AccordionItem value='interaction' className="border-none">
                        <AccordionTrigger className='text-[11px] font-bold text-muted-foreground hover:no-underline py-2 uppercase'>
                            Interaction
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <div className='flex flex-col gap-2'>
                                <TaskMenuButton taskType={TaskType.LAUNCH_BROWSER} />
                                <TaskMenuButton taskType={TaskType.CLICK_ELEMENT} />
                                <TaskMenuButton taskType={TaskType.FILL_INPUT} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='extraction' className="border-none">
                        <AccordionTrigger className='text-[11px] font-bold text-muted-foreground hover:no-underline py-2 uppercase'>
                            Extraction
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <div className='flex flex-col gap-2'>
                                <TaskMenuButton taskType={TaskType.PAGE_TO_HTML} />
                                <TaskMenuButton taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />
                                <TaskMenuButton taskType={TaskType.EXTRACT_DATA_WITH_AI} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='delivery' className="border-none">
                        <AccordionTrigger className='text-[11px] font-bold text-muted-foreground hover:no-underline py-2 uppercase'>
                            Delivery
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <div className='flex flex-col gap-2'>
                                <TaskMenuButton taskType={TaskType.DELIVER_VIA_WEBHOOK} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            
            <div className="mt-auto p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                    <span className="font-bold text-primary block mb-1">PRO TIP</span>
                    Build complex automations by chaining these primitives together.
                </p>
            </div>
        </aside>
    )
}

function TaskMenuButton({ taskType }) {
    const task = TaskRegistry[taskType]
    if (!task) return null

    const onDragStart = (event, type) => {
        event.dataTransfer.setData('application/reactFlow', type)
        event.dataTransfer.effectAllowed = 'move'
    }

    return (
        <Button
            className='flex items-center justify-start gap-3 border bg-background hover:bg-muted/50 rounded-xl h-11 w-full px-3 transition-all active:scale-95 shadow-sm overflow-hidden group'
            variant='outline'
            draggable
            onDragStart={(event) => onDragStart(event, taskType)}
        >
            <div className="bg-muted p-1.5 rounded-lg group-hover:bg-primary/10 transition-colors">
                <task.icon size={16} />
            </div>
            <span className='text-xs font-medium truncate'>
                {task.label}
            </span>
        </Button>
    )
}
