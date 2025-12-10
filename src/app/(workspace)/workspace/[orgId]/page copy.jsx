'use client'
import React, { useEffect } from 'react'
import { useAction } from '@/hooks/use-action'
import { useSession } from 'next-auth/react'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/slices/org'
import { ROLE } from '@prisma/client'
import { useModal } from '@/hooks/useModal'
import { AlertTriangle, BedDouble, Calendar, FlaskConical, Pill, Receipt, Trello } from 'lucide-react'
import { getDoctors } from './(misc)/_actions/get-doctors'
import { getAllUsers } from './(misc)/_actions/get-users'
import { getAppointments } from './appointment/_actions/get-appointments'
import { setAppointments, setDoctors, setPatients } from './appointment/_redux/appointment-slice'
import { AppointmentCard } from './appointment/_components/cards/AppointmentCard'
import { EmergencyAlertCard } from './appointment/_components/cards/EmergencyAlertCard'
import { LabTestCard } from './appointment/_components/cards/LabTestCard'
import { PrescriptionCard } from './appointment/_components/cards/PrescriptionCard'
import { BedStatusCard } from './appointment/_components/cards/BedStatusCard'
import { MedicalRecordCard } from './appointment/_components/cards/MedicalRecordCard'
import { BillingCard } from './appointment/_components/cards/BillingCard'
import { StatsCard } from './appointment/_components/cards/StatsCard'
import { useOrg } from '@/providers/OrgProvider'


export default function DashboardReserve() {
    const { data: session } = useSession()
    const { server } = useOrg()
    const doctorsdata = useSelector((state) => state.appointment.doctors)
    const loading = useSelector((state) => state.org.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setLoading(true))
        appointments({ userId: session?.user?.userId, role: session?.user?.role, serverId: server?.id })
        doctors({ userId: session?.user?.userId })
        users({ userId: session?.user?.userId })
    }, [session, server])



    const { execute: appointments } = useAction(getAppointments, {
        onSuccess: (data) => {
            console.log('@All appointments @Dashboard', data)
            dispatch(setAppointments(JSON.stringify(data.appointments)))
            dispatch(setLoading(false))
        },
        onError: (error) => {
            console.log(error)
            dispatch(setLoading(false))
            //toast.error(error)
        }
    })

    const { execute: doctors } = useAction(getDoctors, {
        onSuccess: (data) => {
            dispatch(setDoctors(JSON.stringify(data.doctors)))
        },
        onError: (error) => {
            console.log(error)
        }
    })

    const { execute: users } = useAction(getAllUsers, {
        onSuccess: (data) => {
            //dispatch(setDoctors(JSON.stringify(data.doctors)))
            //console.log(data?.users.filter((i) => i.role === ROLE.DOCTOR))
            dispatch(setDoctors(JSON.stringify(data?.users.filter((i) => i.role === ROLE.DOCTOR))))
            dispatch(setPatients(JSON.stringify(data?.users.filter((i) => i.role === ROLE.PATIENT))))
        },
        onError: (error) => {
            console.log(error)
        }
    })



    return (
        <div className='flex flex-col gap-y-2'>

            <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border'>
                <h2 className='text-xl font-semibold'>Dashboard</h2>
                <h2 className='text-xs text-white/50'> Complete overview of all hospital operations and patient management. Monitor. Manage. Move forward.</h2>
            </div>



            <div className='grid gap-2 md:grid-cols-2 lg:grid-cols-4'>

                <StatsCard
                    title="Today's Patients"
                    value='142'
                    change='+12% from yesterday'
                    changeType='positive'
                    icon={'users'}
                    iconColor='#00FFFF'
                    iconClassName='bg-[#172E3A]'
                />

                <StatsCard
                    title="Today's Appointments"
                    value='5'
                    change='5 pending'
                    changeType='positive'
                    icon={'calendar'}
                    iconColor='#7FFFD4'
                    iconClassName='bg-[#172E3A]'
                />

                <StatsCard
                    title='Active Doctors'
                    value='7'
                    change='2 on leave'
                    changeType='positive'
                    icon={'stethoscope'}
                    iconColor='#50C878'
                    iconClassName='bg-[#172E3A]'
                />

                <StatsCard
                    title='Avaliable Beds'
                    value='12'
                    change='-8% from yesterday'
                    changeType='negative'
                    icon={'bed-double'}
                    iconColor='#CF9FFF'
                    iconClassName='bg-[#172E3A]'
                />

            </div>

            {/* Appointments Section */}
            <div className='my-2'>
                <h2 className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Today's Appointments
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    <AppointmentCard
                        patientName="John Smith"
                        doctorName="Sarah Johnson"
                        date="2024-01-15"
                        time="09:00 AM"
                        type="Consultation"
                        status="Scheduled"
                        department="Cardiology"
                    />
                    <AppointmentCard
                        patientName="Emma Davis"
                        doctorName="Michael Chen"
                        date="2024-01-15"
                        time="10:30 AM"
                        type="Follow-up"
                        status="In Progress"
                        department="Neurology"
                    />
                    <AppointmentCard
                        patientName="Robert Wilson"
                        doctorName="Emily Brown"
                        date="2024-01-15"
                        time="11:00 AM"
                        type="Emergency"
                        status="Scheduled"
                        department="Emergency"
                    />
                    <AppointmentCard
                        patientName="Lisa Anderson"
                        doctorName="James Miller"
                        date="2024-01-15"
                        time="02:00 PM"
                        type="Routine Checkup"
                        status="Scheduled"
                        department="General Medicine"
                    />
                </div>
            </div>

            {/* Emergency Alerts Section */}
            <div className='my-2'>
                <h2 className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Emergency Alerts
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <EmergencyAlertCard
                        alertId="EMG-2024-001"
                        type="Code Blue"
                        location="ICU - Room 305"
                        time="2 minutes ago"
                        status="Active"
                        priority="Critical"
                        responders={["Dr. Sarah Johnson", "Nurse Emma Davis"]}
                        patientInfo="John Doe, Male, 45"
                        description="Patient experiencing cardiac arrest, immediate response required"
                    />
                    <EmergencyAlertCard
                        alertId="EMG-2024-002"
                        type="Trauma Alert"
                        location="Emergency Room 2"
                        time="15 minutes ago"
                        status="Responding"
                        priority="High"
                        responders={["Dr. Michael Chen", "Dr. Emily Brown"]}
                        patientInfo="Jane Smith, Female, 32"
                        description="Motor vehicle accident victim with multiple injuries"
                    />
                </div>
            </div>

            {/* Lab Tests Section */}
            <div className='my-2'>
                <h2 className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                    <FlaskConical className="h-4 w-4 text-primary" />
                    Laboratory Tests
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <LabTestCard testId="LAB-001"
                        testName="Complete Blood Count"
                        patientName="John Smith"
                        requestedBy="Sarah Johnson"
                        requestDate="2024-01-15"
                        status="In Progress"
                        priority="Routine"
                        sampleType="Blood"
                        expectedTime="2 hours"
                    />
                    <LabTestCard
                        testId="LAB-002"
                        testName="COVID-19 PCR Test"
                        patientName="Emma Davis"
                        requestedBy="Michael Chen"
                        requestDate="2024-01-15"
                        status="Pending"
                        priority="Urgent"
                        sampleType="Nasal Swab"
                        expectedTime="4 hours"
                    />
                    <LabTestCard
                        testId="LAB-003"
                        testName="Lipid Panel"
                        patientName="Robert Wilson"
                        requestedBy="Emily Brown"
                        requestDate="2024-01-14"
                        status="Completed"
                        priority="Routine"
                        sampleType="Blood"
                    />
                </div>
            </div>

            {/* Prescriptions Section */}
            <div className='my-2'>
                <h2 className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    Recent Prescriptions
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <PrescriptionCard
                        prescriptionId="RX-001"
                        patientName="John Smith"
                        doctorName="Sarah Johnson"
                        date="2024-01-15"
                        medications={[
                            { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", duration: "30 days" },
                            { name: "Aspirin", dosage: "81mg", frequency: "Once daily", duration: "30 days" }
                        ]}
                        status="Active"
                        refills={2}
                        instructions="Take with food. Monitor blood pressure daily."
                    />
                    <PrescriptionCard
                        prescriptionId="RX-002"
                        patientName="Emma Davis"
                        doctorName="Michael Chen"
                        date="2024-01-14"
                        medications={[
                            { name: "Amoxicillin", dosage: "500mg", frequency: "Three times daily", duration: "10 days" }
                        ]}
                        status="Active"
                        refills={0}
                        instructions="Complete full course even if symptoms improve."
                    />
                    <PrescriptionCard
                        prescriptionId="RX-003"
                        patientName="Robert Wilson"
                        doctorName="Emily Brown"
                        date="2024-01-13"
                        medications={[
                            { name: "Metformin", dosage: "500mg", frequency: "Twice daily", duration: "90 days" }
                        ]}
                        status="Active"
                        refills={3}
                    />
                </div>
            </div>

            {/* Bed Status Section */}
            <div className='my-2'>
                <h2 className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-primary" />
                    Bed Status Overview
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                    <BedStatusCard
                        bedNumber="305"
                        ward="ICU"
                        floor={3}
                        status="Occupied"
                        patientName="John Smith"
                        admissionDate="2024-01-10"
                        condition="Stable"
                    />
                    <BedStatusCard
                        bedNumber="201"
                        ward="General"
                        floor={2}
                        status="Occupied"
                        patientName="Emma Davis"
                        admissionDate="2024-01-12"
                        condition="Critical"
                    />
                    <BedStatusCard
                        bedNumber="412"
                        ward="Surgery"
                        floor={4}
                        status="Available"
                    />
                    <BedStatusCard
                        bedNumber="103"
                        ward="Emergency"
                        floor={1}
                        status="Maintenance"
                    />
                </div>
            </div>

            {/* Medical Records Section */}
            <div className='my-2'>
                <h2 className="text-md font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Trello className="h-4 w-4 text-primary" />
                    Recent medical records
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <MedicalRecordCard
                        id="MR-001"
                        patientName="John Smith"
                        date="2024-01-15"
                        diagnosis="Hypertension"
                        prescription={["Lisinopril 10mg daily", "Aspirin 81mg daily"]}
                        doctorName="Sarah Johnson"
                        symptoms={["High blood pressure", "Mild headaches"]}
                        vitals={{
                            bloodPressure: "140/90",
                            heartRate: "78 bpm",
                            temperature: "98.6°F"
                        }}
                    />
                    <MedicalRecordCard
                        id="MR-002"
                        patientName="Emma Davis"
                        date="2024-01-14"
                        diagnosis="Bacterial Infection"
                        prescription={["Amoxicillin 500mg TID"]}
                        doctorName="Michael Chen"
                        symptoms={["Fever", "Sore throat", "Fatigue"]}
                        vitals={{
                            bloodPressure: "120/80",
                            heartRate: "92 bpm",
                            temperature: "101.2°F"
                        }}
                    />
                    <MedicalRecordCard
                        id="MR-003"
                        patientName="Robert Wilson"
                        date="2024-01-13"
                        diagnosis="Type 2 Diabetes"
                        prescription={["Metformin 500mg BID"]}
                        doctorName="Emily Brown"
                        symptoms={["Increased thirst", "Frequent urination"]}
                        vitals={{
                            bloodPressure: "125/85",
                            heartRate: "72 bpm",
                            temperature: "98.4°F"
                        }}
                    />
                </div>
            </div>

            {/* Billing Section */}
            <div className='my-2'>
                <h2 className="text-md font-bold text-foreground mb-2 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    Recent Billing
                </h2>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    <BillingCard
                        invoiceId="INV-2024-001"
                        patientName="John Smith"
                        date="2024-01-15"
                        items={[
                            { description: "Consultation Fee", amount: 150 },
                            { description: "Lab Tests", amount: 250 },
                            { description: "Medications", amount: 80 }
                        ]}
                        totalAmount={480}
                        status="Paid"
                        paymentMethod="Credit Card"
                    />
                    <BillingCard
                        invoiceId="INV-2024-002"
                        patientName="Emma Davis"
                        date="2024-01-14"
                        items={[
                            { description: "Emergency Visit", amount: 500 },
                            { description: "X-Ray", amount: 200 },
                            { description: "Medications", amount: 120 }
                        ]}
                        totalAmount={820}
                        status="Pending"
                        insuranceCoverage={600}
                        dueDate="2024-02-14"
                    />
                    <BillingCard
                        invoiceId="INV-2024-003"
                        patientName="Robert Wilson"
                        date="2024-01-13"
                        items={[
                            { description: "Follow-up Visit", amount: 100 },
                            { description: "Blood Test", amount: 150 }
                        ]}
                        totalAmount={250}
                        status="Partial"
                        paymentMethod="Insurance + Cash"
                        insuranceCoverage={200}
                    />
                </div>
            </div>


            {/* <div className='h-96 bg-red-200' /> */}

        </div>
    )
}
