'use client'
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useModal } from "@/hooks/useModal";
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useEffect, useState } from 'react'
import PatientProfileInteractive from '../../_component/patient-profile/PatientProfileInteractive';
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { useOrg } from '@/providers/OrgProvider';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, IdCard, User } from 'lucide-react';
import { usePatient } from "../../_provider/patientProvider";
import { ActionTooltip } from "@/components/global/ActionTooltip"
import { mockPatientData } from "./PatientProfilePage"

export default function PatientEditor({ patient }) {
    const { isOpen, onClose, type: dtype, data } = useModal();
    const isModalOpen = isOpen && dtype === "new-patient";
    const [patientdata, setPatientData] = useState(null)

    useEffect(() => {
        setPatientData(patient)
    }, [patient])



    const handleOnOpenclose = () => {
        onClose()
    }

    return (
        <Dialog >
            <form>
                <DialogTrigger >
                    <ActionTooltip label='View Patient'>
                        <Eye size={18} className="cursor-pointer" />
                    </ActionTooltip>
                </DialogTrigger>
                <DialogContent className="min-w-[90%] max-w-[90%] min-h-[90%] max-h-[90%] ">

                    <DialogHeader className={'hidden'}>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className='absolute inset-0 flex flex-col gap-2 p-2'>


                        <div className=' dark:bg-darkSecondaryBackground p-2 rounded-md border flex flex-row items-center justify-between  mb-0'>
                            <div className='flex flex-row gap-4'>
                                <Avatar className='rounded-md w-20 h-20'>
                                    <AvatarImage src={patientdata?.user.avatar.substring(0, 1)} alt="@shadcn" />
                                    <AvatarFallback className='rounded-md text-[56px] bg-sky-500  font-bold'>{patientdata?.user.displayName.substring(0, 1)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <h2 className='text-xl'>{patientdata?.user.displayName}</h2>
                                        <h4 className='text-xs text-muted-foreground'>{patientdata?.user.email}</h4>
                                    </div>
                                    <div className='text-sm flex flex-row gap-2 justify-around text-muted-foreground'>
                                        <div>
                                            <IdCard className='inline-block mr-2' size={16} />
                                            <span className='text-sm font-mono'>{patientdata?.user?.uuid}</span>
                                        </div>
                                        <div>
                                            <Calendar className='inline-block mr-2' size={16} />
                                            <span className='text-sm'>56 Years</span>
                                        </div>
                                        <div>
                                            <User className='inline-block mr-2' size={16} />
                                            <span className='text-sm'>{patientdata?.user?.profile?.gender}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>


                        </div>

                        <div className="bg-card dark:bg-darkSecondaryBackground rounded-md flex-1 h-full overflow-hidden">
                            <ScrollArea className='h-[78vh] w-full overflow-hidden p-2' >
                                <PatientProfileInteractive patientData={mockPatientData} patient={patient} />
                            </ScrollArea>
                        </div>
                    </div>

                </DialogContent>
            </form>
        </Dialog>
    )
}
