'use client'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Files, ReceiptText } from 'lucide-react'
import React from 'react'
import DocumentIntractive from './_components/DocumentIntractive'


export default function DocumentPage() {
    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <div className='w-full dark:bg-darkSecondaryBackground  p-4 rounded-md border flex flex-row items-center justify-between'>
                <div>
                    <h2 className='text-xl flex flex-row items-center gap-2'>
                        <Files className='h-5 w-5 text-sky-500' />
                        Documents
                    </h2>
                    <h2 className='text-xs text-white/50'>Patient Records, Invoices, Reports, and Forms – Always Organized, Always Accessible</h2>
                </div>
                <div>
                    <Button variant={'save'} size={'sm'} className='' onClick={() => {
                        console.log('Open editor')
                        setInvoiceEditor({
                            isOpen: true,
                            mode: 'add',
                            invoice: null,
                        })
                    }}>
                        <ReceiptText />
                        New Invoice
                    </Button>
                </div>
            </div>

            <ScrollArea className='h-[85vh] flex flex-grow dark:bg-darkSecondaryBackground rounded-md pr-4 border'>
                <DocumentIntractive />
            </ScrollArea>


        </div >
    )
}
