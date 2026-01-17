import React, { useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { Calendar, Clock, GraduationCap, Mail, Phone, Pill, Printer, ScrollText, Stethoscope, User } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { CustomBadge } from '../../../(misc)/_components/CustomBadge'



export default function PrescriptionView({ isOpen, onClose, prescription }) {

    if (!prescription) return null

    function usePatientAge(dateOfBirth) {
        return useMemo(() => {
            if (!dateOfBirth) return null;

            const birthDate = new Date(dateOfBirth);
            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            return age;
        }, [dateOfBirth]);
    }



    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className='min-w-[620px] bg-transparent border-l-0 p-2'>
                <div className='bg-card border rounded-md h-full '>
                    <SheetHeader>
                        <SheetTitle className='flex flex-row items-center justify-between gap-2'>
                            <div className='flex flex-row items-center gap-2'>
                                <Pill className='h-5 w-5 cursor-pointer text-sky-500' />
                                <div className='flex flex-col'>
                                    <span>{prescription?.sku}</span>
                                </div>
                            </div>
                            <span className='text-xs text-muted-foreground'>Created: {format(prescription?.createdAt, 'dd MMM yyyy hh:mm a')}</span>
                        </SheetTitle>
                    </SheetHeader>

                    <ScrollArea className='h-[86vh] p-4'>
                        <div className='flex flex-col gap-6'>
                            <div>
                                <Label className='text-muted-foreground'>Patient Information</Label>
                                <div className='p-2 bg-card/50 rounded-md border flex flex-col gap-2'>
                                    <div className='flex flex-row items-center gap-2'>
                                        <User className='h-4 w-4 text-sky-500' />
                                        <span>{prescription?.appointment?.patient?.displayName}</span>
                                        <CustomBadge status={'success'}>
                                            <div className='text-muted-foreground flex flex-row items-center gap-2 '>
                                                <span className='text-xs'>{usePatientAge(prescription?.appointment?.patient?.demographic?.dateOfBirth)}Yrs</span>
                                                <span className=' capitalize text-xs'>{prescription?.appointment?.patient?.demographic?.gender}</span>
                                            </div>
                                        </CustomBadge>
                                    </div>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <Phone className='h-4 w-4 text-green-500' />
                                        <span className='text-sm'>{prescription?.appointment?.patient?.demographic?.primaryPhone}</span>
                                    </div>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <Mail className='h-4 w-4 text-orange-500' />
                                        <span className='text-sm'>{prescription?.appointment?.patient?.email}</span>
                                    </div>
                                </div>
                            </div>


                            <div>
                                <Label className='text-muted-foreground'>Prescribing Physician</Label>
                                <div className='p-2 bg-card/50 rounded-md border flex flex-col gap-2'>
                                    <div className='flex flex-row items-center gap-2'>
                                        <Stethoscope className='h-4 w-4 text-green-500' />
                                        <span>{prescription?.appointment?.doctor?.displayName}</span>
                                    </div>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <Phone className='h-4 w-4 text-green-500' />
                                        <span className='text-sm'>{prescription?.appointment?.doctor?.demographic?.primaryPhone || <span className='text-xs text-muted-foreground'>N/A</span>} </span>
                                    </div>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <GraduationCap className='h-4 w-4 text-orange-500' />
                                        <span className='text-sm text-muted-foreground'>{prescription?.appointment?.doctor?.profile?.speciality || 'General Medicine'}</span>
                                        <span className='text-sm text-muted-foreground'>{prescription?.appointment?.doctor?.profile?.registrationNo || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className='text-muted-foreground'>Diagnosis</Label>
                                <div className='p-2 bg-card/50 rounded-md border flex flex-col gap-2'>
                                    <div className='flex flex-row gap-2'>
                                        <ScrollText className='h-10 w-10 text-green-500' />
                                        <span className='text-sm'>{prescription?.diagnosis}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className='text-muted-foreground'>Medications ({prescription?.items.length})</Label>
                                {prescription?.items?.map((item, index) => {
                                    return (
                                        <div key={index} className='p-2 bg-card/50 rounded-md border flex flex-col gap-4'>
                                            <div className='flex flex-row gap-2 items-center'>
                                                <Pill className='h-4 w-4 text-cyan-500' />
                                                <span className='text-sm'>{item?.name}</span>
                                                <CustomBadge status='info'>{item?.dosage} mg</CustomBadge>
                                            </div>
                                            <div className='flex flex-row items-center gap-10'>
                                                <div className='flex flex-row items-center gap-2'>
                                                    <Clock className='h-4 w-4 text-muted-foreground' />
                                                    <span className='text-xs text-muted-foreground'>{item.frequency}</span>
                                                </div>
                                                <div className='flex flex-row items-center gap-2'>
                                                    <Calendar className='h-4 w-4 text-muted-foreground' />
                                                    <span className='text-xs text-muted-foreground'>{item.duration} days</span>
                                                </div>
                                            </div>
                                            {item.instruction && (
                                                <div>
                                                    <span className='text-xs text-muted-foreground italic'>"{item.instruction}"</span>
                                                </div>
                                            )}

                                        </div>
                                    )
                                })}

                            </div>

                            <div>
                                <Label className='text-muted-foreground'>Additional Notes</Label>
                                <div className='p-2 bg-card/50 rounded-md border flex flex-col gap-2'>
                                    <div className='flex flex-row gap-2 text-sm text-muted-foreground'>
                                        <ScrollText className='h-5 w-5 text-green-500' />
                                        {prescription?.notes ? <span className='text-sm'>{prescription?.notes}</span> : 'No notes'}

                                    </div>
                                </div>
                            </div>

                            <Separator />


                        </div>
                    </ScrollArea>

                    <SheetFooter className='flex flex-row items-center justify-end'>

                        <SheetClose asChild>
                            <Button variant="outline" size='sm'>Close</Button>
                        </SheetClose>
                        <Button variant={'outline'} size='sm'>
                            <Printer className='h-5 w-5 text-sky-500' />
                            Print
                        </Button>
                        <Button variant={'save'} size='sm'>Mark as Dispensed</Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}
