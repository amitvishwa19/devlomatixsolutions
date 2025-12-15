import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Check, Loader, Save } from 'lucide-react'
import React, { useState } from 'react'


const doctorNotes = [
    {
        title: "Follow-Up Required",
        description: "Patient advised to return after 2 weeks for blood pressure monitoring and medication review."
    },
    {
        title: "Medication Adjustment",
        description: "Dosage of antihypertensive medication reduced due to reported dizziness and low readings."
    },
    {
        title: "Lifestyle Counseling",
        description: "Discussed importance of regular exercise, balanced diet, and reduced salt intake."
    },
    {
        title: "Lab Tests Ordered",
        description: "Complete blood count and lipid profile prescribed for further evaluation."
    },
    {
        title: "Symptoms Improving",
        description: "Patient reports reduced pain and improved mobility since last visit."
    },
    {
        title: "Referral Suggested",
        description: "Referred patient to a cardiologist for specialized evaluation and management."
    },
    {
        title: "Allergy Noted",
        description: "Patient has a known allergy to penicillin; alternative antibiotics advised."
    },
    {
        title: "Imaging Recommended",
        description: "X-ray of the affected joint recommended to rule out structural abnormalities."
    }, {
        title: "Follow-Up Required",
        description: "Patient advised to return after 2 weeks for blood pressure monitoring and medication review."
    },
    {
        title: "Medication Adjustment",
        description: "Dosage of antihypertensive medication reduced due to reported dizziness and low readings."
    },

];

export default function NotesTab() {
    const [loading, setLoading] = useState()

    const [formData, setFormdata] = useState(
        {
            title: 'test titlw ', Description: 'description'
        }
    )
    return (
        <div className='flex flex-col gap-2'>

            <ScrollArea className='border bg-card rounded-md p-2 flex-1 h-[50vh]'>
                <div className='flex flex-col gap-2'>
                    {doctorNotes.map((item, index) => {
                        return (
                            <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-md">
                                <Check size={16} color='green' />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground">{item?.title}</div>
                                    <div className="text-xs text-text-secondary mt-1">{item?.description}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>

            </ScrollArea>

            <div className='flex flex-col p-2 gap-2 border rounded-md bg-card '>
                <div>
                    <Input placeholder='title' />

                </div>

                <div>
                    <Textarea rows='6' />
                </div>

                <div className='flex justify-end'>
                    <Button variant='save' size='sm' onClick={() => { setFormdata([]) }}>
                        {loading ? <Loader className=' animate-spin' /> : <Save />}
                        Add Note
                    </Button>
                </div>
            </div>
        </div>
    )
}
