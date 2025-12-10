import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import React from 'react'
import { TaskRegistry } from '../lib/tasks/registry'
import { TaskType } from '../types/types'
import { CoinsIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function TaskMenu() {
    return (
        <div>
            <div className='w-full mt-2 py-2'>
                <Accordion type="multiple" collapsible='true' className="w-full" defaultValue={['extraction', 'intraction', 'timing', 'result', 'storage']}>

                    <AccordionItem value='intraction'>
                        <AccordionTrigger className='text-xs text-muted-foreground ml-2'>
                            User Intraction
                        </AccordionTrigger>
                        <AccordionContent >
                            <div className='flex flex-col gap-1 items-start'>
                                <TaskMenuButton taskType={TaskType.FILL_INPUT} />
                                <TaskMenuButton taskType={TaskType.CLICK_ELEMENT} />

                            </div>
                        </AccordionContent>
                    </AccordionItem>


                    <AccordionItem value='extraction'>
                        <AccordionTrigger className='text-xs text-muted-foreground ml-2'>
                            Data Extraction
                        </AccordionTrigger>
                        <AccordionContent >
                            <div className='flex flex-col gap-1 items-start'>
                                <TaskMenuButton taskType={TaskType.PAGE_TO_HTML} />
                                <TaskMenuButton taskType={TaskType.EXTRACT_TEXT_FROM_ELEMENT} />
                                <TaskMenuButton taskType={TaskType.EXTRACT_DATA_WITH_AI} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='storage'>
                        <AccordionTrigger className='text-xs text-muted-foreground ml-2'>
                            Data Storage
                        </AccordionTrigger>
                        <AccordionContent >
                            <div className='flex flex-col gap-1 items-start'>
                                <TaskMenuButton taskType={TaskType.READ_PROPERTY_FROM_JSON} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='timing'>
                        <AccordionTrigger className='text-xs text-muted-foreground ml-2'>
                            Timing Controls
                        </AccordionTrigger>
                        <AccordionContent >
                            <div className='flex flex-col gap-1 items-start'>
                                <TaskMenuButton taskType={TaskType.WAIT_FOR_ELEMENT} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value='result'>
                        <AccordionTrigger className='text-xs text-muted-foreground ml-2'>
                            Result Delivery
                        </AccordionTrigger>
                        <AccordionContent >
                            <div className='flex flex-col gap-1 items-start'>
                                <TaskMenuButton taskType={TaskType.DELIVER_VIA_WEBHOOK} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>


                </Accordion>
            </div>
        </div>
    )
}


function TaskMenuButton({ taskType }) {
    const task = TaskRegistry[taskType]
    //console.log('@TASK', task)

    const onDRagStart = (event, type) => {
        event.dataTransfer.setData('application/reactflow', type)
        event.dataTransfer.effectAllowed = 'move'
    }
    return (
        <Button
            className='flex items-center justify-between gap-2 border w-full '
            variant='secondary'
            draggable
            onDragStart={(event) => { onDRagStart(event, taskType) }}
        >
            <div className='flex gap-2 items-center text-wrap text-start justify-between w-full'>
                <span className='flex gap-2 items-center'>
                    <task.icon size={16} />
                    <span className='text-xs'>
                        {task.label}
                    </span>
                </span>
                {/* <span className='flex gap-1'>
                    <CoinsIcon size={14} />
                    {task.credits}
                </span> */}
            </div>
            {/* <Badge variant='outline' className={'flex gap-1 items-center'}>
                <CoinsIcon size={14} />
                {task.credits}
            </Badge> */}
        </Button>
    )
}