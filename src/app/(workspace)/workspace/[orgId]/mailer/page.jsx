'use client'
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mailbox } from './_components/Mailbox';
import { MailboxTopNav } from './_components/MailboxTopNav';
import { DataModeProvider, useDataMode } from './_hooks/useDataMode';
import { useGmail } from './_hooks/useGmail';
import { ContentTopbar } from '../(misc)/_components/ContentTopbar';





export default function MailerPage() {

    return (
        <DataModeProvider>
            <IndexContent />
        </DataModeProvider>
    )
}


function IndexContent() {
    const gmail = useGmail();
    const { isLiveMode } = useDataMode();
    const syncGmail = gmail.syncGmail
    const isSyncing = gmail.isSyncing



    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>


            <ContentTopbar
                title='Mailbox'
                description='Smart, secure, and always in sync-your hospital’s unified mailbox for every message that matters'
                icon='mail-check'
                actionComp={
                    <MailboxTopNav syncGmail={syncGmail} isSyncing={isSyncing} />
                }
            />


            <div className='h-[85vh] w-full flex flex-grow  rounded-md '>
                <Mailbox gmail={gmail} isLiveMode={isLiveMode} />
            </div>
        </div>
    );
}

