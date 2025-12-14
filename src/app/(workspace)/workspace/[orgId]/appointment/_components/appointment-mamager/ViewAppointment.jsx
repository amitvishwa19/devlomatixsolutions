import React from 'react'
import { useModal } from '@/hooks/useModal';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion"
import AppointmentEditor from './AppointmentEditor';
import VitalSignsCard from '../../../patient/_component/patient-profile/VitalSignsCard';
import DemographicsCard from '../../../patient/_component/patient-profile/DemographicsCard';
import MedicalHistoryTab from '../../../patient/_component/patient-profile/MedicalHistoryTab';
import { ScrollArea } from '@/components/ui/scroll-area';
import MedicationsTab from '../../../patient/_component/patient-profile/MedicationsTab';
import AllergiesTab from '../../../patient/_component/patient-profile/AllergiesTab';
import VisitHistoryTab from '../../../patient/_component/patient-profile/VisitHistoryTab';
import DocumentsTab from '../../../patient/_component/patient-profile/DocumentsTab';
import { BookText, ClipboardPlus, Eye, Footprints, Pill, TriangleAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ViewAppointment() {
    const { isOpen, onClose, type: dtype, data } = useModal();
    const isModalOpen = isOpen && dtype === "view-appointment";

    console.log(data)

    const handleOpenChange = () => {
        onClose()
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>

            <DialogContent className='min-w-[90%] p-0'>

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>


                <div className='flex flex-row gap-4 py-4'>
                    <div className='w-[40%] p-4'>
                        <AppointmentEditor appointment={data?.appointment} />
                    </div>
                    <ScrollArea className='w-[60%] h-[90vh]  p-4'>
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full p-2"
                            defaultValue="item-1"
                        >
                            <AccordionItem value="item-1" >
                                <AccordionTrigger>
                                    <div className='flex flex-r items-center gap-2 '>
                                        <Eye size={20} />
                                        Overview
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <VitalSignsCard />
                                    <DemographicsCard />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger>
                                    <div className='flex flex-r items-center gap-2'>
                                        <BookText size={20} />
                                        Medical History
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <MedicalHistoryTab />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger>
                                    <div className='flex flex-r items-center gap-2'>
                                        <Pill size={20} />
                                        Medication
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <MedicationsTab />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger>
                                    <div className='flex flex-r items-center gap-2'>
                                        <TriangleAlert size={20} />
                                        Allergies
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <AllergiesTab />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-6">
                                <AccordionTrigger>
                                    <div className='flex flex-r items-center gap-2'>
                                        <Footprints size={20} />
                                        Visit History
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <VisitHistoryTab />
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-7">
                                <AccordionTrigger>
                                    <div className='flex flex-r items-center gap-2'>
                                        <ClipboardPlus size={20} />
                                        Documents
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4 text-balance">
                                    <DocumentsTab />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        {/* <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                            defaultValue="item-1"
                        >
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Eye size={20} />
                                        Overview
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4">
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <h4 className="font-medium text-foreground mb-2">Vital Signs</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground">Blood Pressure:</span> 120/80 mmHg</div>
                                                <div><span className="text-muted-foreground">Heart Rate:</span> 72 bpm</div>
                                                <div><span className="text-muted-foreground">Temperature:</span> 98.6°F</div>
                                                <div><span className="text-muted-foreground">Weight:</span> 165 lbs</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <h4 className="font-medium text-foreground mb-2">Demographics</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-muted-foreground">Age:</span> 45 years</div>
                                                <div><span className="text-muted-foreground">Gender:</span> Male</div>
                                                <div><span className="text-muted-foreground">Blood Type:</span> O+</div>
                                                <div><span className="text-muted-foreground">Insurance:</span> Blue Cross</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-2">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <BookText size={20} />
                                        Medical History
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4">
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex justify-between"><span>Type 2 Diabetes</span><span className="text-muted-foreground">Diagnosed 2018</span></li>
                                                <li className="flex justify-between"><span>Hypertension</span><span className="text-muted-foreground">Diagnosed 2020</span></li>
                                                <li className="flex justify-between"><span>Appendectomy</span><span className="text-muted-foreground">Surgery 2015</span></li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-3">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Pill size={20} />
                                        Medication
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4">
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <ul className="space-y-3 text-sm">
                                                <li className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">Metformin</span>
                                                        <p className="text-muted-foreground text-xs">500mg - Twice daily</p>
                                                    </div>
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Active</span>
                                                </li>
                                                <li className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium">Lisinopril</span>
                                                        <p className="text-muted-foreground text-xs">10mg - Once daily</p>
                                                    </div>
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Active</span>
                                                </li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-4">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <TriangleAlert size={20} />
                                        Allergies
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4">
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-destructive rounded-full"></span>
                                                    <span>Penicillin</span>
                                                    <span className="text-muted-foreground text-xs">- Severe reaction</span>
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                                    <span>Shellfish</span>
                                                    <span className="text-muted-foreground text-xs">- Mild reaction</span>
                                                </li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-5">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <Footprints size={20} />
                                        Visit History
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4">
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <ul className="space-y-3 text-sm">
                                                <li className="border-b border-border/50 pb-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Annual Checkup</span>
                                                        <span className="text-muted-foreground">Dec 10, 2024</span>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs">Dr. Sarah Johnson - General Medicine</p>
                                                </li>
                                                <li className="border-b border-border/50 pb-2">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">Follow-up Visit</span>
                                                        <span className="text-muted-foreground">Nov 15, 2024</span>
                                                    </div>
                                                    <p className="text-muted-foreground text-xs">Dr. Michael Chen - Cardiology</p>
                                                </li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="item-6">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-2">
                                        <ClipboardPlus size={20} />
                                        Documents
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="flex flex-col gap-4">
                                    <Card className="bg-muted/30">
                                        <CardContent className="pt-4">
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex justify-between items-center">
                                                    <span>Lab Results - Blood Work</span>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </li>
                                                <li className="flex justify-between items-center">
                                                    <span>X-Ray Report - Chest</span>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </li>
                                                <li className="flex justify-between items-center">
                                                    <span>Insurance Documents</span>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion> */}
                    </ScrollArea>
                </div>

            </DialogContent>
        </Dialog >
    )
}
