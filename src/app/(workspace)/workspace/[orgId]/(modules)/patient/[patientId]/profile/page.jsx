'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import React, { useEffect } from 'react'
import PatientProfileInteractive from '../../_component/patient-profile/PatientProfileInteractive';
import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { usePatient } from '../../_provider/patientProvider';
import { useOrg } from '@/providers/OrgProvider';
import { useRouter } from 'next/navigation';
import { Calendar, IdCard, User } from 'lucide-react';
export default function PatientProfile() {
    const { selectedPatient } = usePatient()
    const { orgId } = useOrg()
    const router = useRouter()


    useEffect(() => {
        if (!selectedPatient) {
            router.push(`/workspace/${orgId}/patient/`)
        }
    }, [])

    console.log('@selectedPatient@patient@page', selectedPatient)

    const mockPatientData = {
        patient: {
            name: "Sarah Johnson",
            mrn: "MRN-2024-001",
            dob: "1985-03-15",
            gender: "Female",
            phone: "(555) 123-4567",
            email: "sarah.johnson@email.com",
            bloodType: "A+",
            lastVisit: "12/05/2025",
            status: "Active",
            avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10608de73-1763295287117.png",
            avatarAlt: "Professional headshot of woman with brown hair in white medical coat smiling at camera",
            alerts: [
                "Severe penicillin allergy - documented anaphylaxis",
                "Type 2 Diabetes - requires insulin monitoring"]

        },
        demographics: {
            fullName: "Sarah Marie Johnson",
            dateOfBirth: "03/15/1985",
            gender: "Female",
            maritalStatus: "Married",
            ssn: "***-**-4567",
            language: "English",
            primaryPhone: "(555) 123-4567",
            secondaryPhone: "(555) 987-6543",
            email: "sarah.johnson@email.com",
            address: "1234 Maple Street, Apt 5B, Springfield, IL 62701",
            emergencyContact: {
                name: "Michael Johnson",
                relationship: "Spouse",
                phone: "(555) 234-5678",
                email: "michael.johnson@email.com"
            }
        },
        insurance: {
            provider: "Blue Cross Blue Shield",
            planType: "PPO Premium",
            policyNumber: "BCBS-2024-789456",
            groupNumber: "GRP-456789",
            effectiveDate: "01/01/2024",
            expirationDate: "12/31/2025",
            status: "Active",
            copay: "$25",
            deductible: "$1,500",
            outOfPocketMax: "$5,000",
            subscriberName: "Sarah Johnson",
            relationshipToPatient: "Self",
            subscriberDOB: "03/15/1985",
            subscriberId: "SUB-789456123"
        },
        vitals: {
            bloodPressure: "128/82",
            heartRate: "72",
            temperature: "98.6",
            respiratoryRate: "16",
            oxygenSaturation: "98",
            weight: "145",
            lastRecorded: "12/05/2025 10:30 AM"
        },
        medicalHistory: {
            chronicConditions: [
                {
                    id: 1,
                    name: "Type 2 Diabetes Mellitus",
                    diagnosedDate: "06/15/2018",
                    status: "Active",
                    description: "Well-controlled with medication and lifestyle modifications. HbA1c levels maintained between 6.5-7.0%.",
                    treatment: "Metformin 1000mg twice daily, regular glucose monitoring, dietary management"
                },
                {
                    id: 2,
                    name: "Hypertension",
                    diagnosedDate: "03/22/2020",
                    status: "Active",
                    description: "Stage 1 hypertension managed with medication and lifestyle changes. Blood pressure readings consistently below 130/80.",
                    treatment: "Lisinopril 10mg daily, low-sodium diet, regular exercise"
                },
                {
                    id: 3,
                    name: "Hypothyroidism",
                    diagnosedDate: "11/08/2019",
                    status: "Active",
                    description: "Autoimmune thyroiditis with stable TSH levels on replacement therapy.",
                    treatment: "Levothyroxine 75mcg daily, annual thyroid function monitoring"
                }],

            pastSurgeries: [
                {
                    name: "Laparoscopic Cholecystectomy",
                    date: "08/12/2021",
                    hospital: "Springfield General Hospital",
                    notes: "Uncomplicated procedure for symptomatic gallstones. Full recovery within 2 weeks."
                },
                {
                    name: "Cesarean Section",
                    date: "05/20/2015",
                    hospital: "Memorial Medical Center",
                    notes: "Emergency C-section due to fetal distress. Healthy baby delivered, mother recovered well."
                }],

            familyHistory: [
                {
                    condition: "Type 2 Diabetes",
                    relation: "Father",
                    notes: "Diagnosed at age 55, managed with oral medications"
                },
                {
                    condition: "Breast Cancer",
                    relation: "Mother",
                    notes: "Diagnosed at age 62, successfully treated with surgery and chemotherapy"
                },
                {
                    condition: "Hypertension",
                    relation: "Both Parents",
                    notes: "Both parents diagnosed in their 50s, controlled with medication"
                }]

        },
        medications: [
            {
                id: 1,
                name: "Metformin",
                dosage: "1000mg",
                frequency: "Twice daily with meals",
                status: "Active",
                prescribedBy: "Dr. Robert Anderson",
                startDate: "06/15/2018",
                refillsRemaining: "3",
                nextRefillDate: "01/15/2026",
                notes: "Take with food to minimize gastrointestinal side effects"
            },
            {
                id: 2,
                name: "Lisinopril",
                dosage: "10mg",
                frequency: "Once daily in morning",
                status: "Active",
                prescribedBy: "Dr. Robert Anderson",
                startDate: "03/22/2020",
                refillsRemaining: "5",
                nextRefillDate: "02/20/2026",
                notes: "Monitor blood pressure regularly"
            },
            {
                id: 3,
                name: "Levothyroxine",
                dosage: "75mcg",
                frequency: "Once daily on empty stomach",
                status: "Active",
                prescribedBy: "Dr. Emily Chen",
                startDate: "11/08/2019",
                refillsRemaining: "2",
                nextRefillDate: "12/28/2025",
                notes: "Take 30 minutes before breakfast"
            },
            {
                id: 4,
                name: "Atorvastatin",
                dosage: "20mg",
                frequency: "Once daily at bedtime",
                status: "Expiring Soon",
                prescribedBy: "Dr. Robert Anderson",
                startDate: "01/10/2022",
                refillsRemaining: "0",
                nextRefillDate: "12/15/2025",
                notes: "For cholesterol management"
            }],

        allergies: [
            {
                id: 1,
                allergen: "Penicillin",
                type: "Medication",
                severity: "Severe",
                reaction: "Anaphylaxis with difficulty breathing, hives, and swelling of face and throat",
                firstOccurrence: "08/15/2010",
                lastOccurrence: "08/15/2010",
                notes: "Patient carries EpiPen. All penicillin-based antibiotics contraindicated."
            },
            {
                id: 2,
                allergen: "Latex",
                type: "Environmental",
                severity: "Moderate",
                reaction: "Contact dermatitis with redness, itching, and localized swelling",
                firstOccurrence: "03/20/2015",
                lastOccurrence: "11/12/2023",
                notes: "Use non-latex gloves during all procedures"
            },
            {
                id: 3,
                allergen: "Shellfish",
                type: "Food",
                severity: "Mild",
                reaction: "Mild hives and itching, no respiratory symptoms",
                firstOccurrence: "06/08/2019",
                lastOccurrence: "07/22/2024",
                notes: "Patient avoids all shellfish. No cross-reactivity with fish noted."
            }],

        visitHistory: [
            {
                id: 1,
                date: "12/05/2025",
                type: "Follow-up",
                provider: "Dr. Robert Anderson",
                department: "Internal Medicine",
                chiefComplaint: "Routine diabetes management and medication review",
                diagnosis: "Type 2 Diabetes Mellitus - well controlled",
                treatment: "Continued current medication regimen. Reviewed glucose logs showing good control.",
                prescriptions: ["Metformin 1000mg refill", "Lisinopril 10mg refill"],
                labTests: ["HbA1c", "Lipid Panel", "Comprehensive Metabolic Panel"],
                followUp: "03/05/2026 for 3-month diabetes check"
            },
            {
                id: 2,
                date: "09/15/2025",
                type: "Routine",
                provider: "Dr. Emily Chen",
                department: "Endocrinology",
                chiefComplaint: "Annual thyroid function assessment",
                diagnosis: "Hypothyroidism - stable on current therapy",
                treatment: "Continue Levothyroxine 75mcg daily. TSH levels within normal range.",
                prescriptions: ["Levothyroxine 75mcg refill"],
                labTests: ["TSH", "Free T4"],
                followUp: "09/15/2026 for annual thyroid check"
            },
            {
                id: 3,
                date: "06/20/2025",
                type: "Consultation",
                provider: "Dr. Michael Torres",
                department: "Cardiology",
                chiefComplaint: "Chest discomfort and palpitations",
                diagnosis: "Benign premature ventricular contractions, no cardiac pathology",
                treatment: "Reassurance provided. EKG and echocardiogram normal. Advised stress reduction techniques.",
                prescriptions: [],
                labTests: ["EKG", "Echocardiogram", "Cardiac Enzymes"],
                followUp: "As needed if symptoms persist or worsen"
            },
            {
                id: 4,
                date: "03/10/2025",
                type: "Emergency",
                provider: "Dr. Sarah Mitchell",
                department: "Emergency Medicine",
                chiefComplaint: "Severe abdominal pain and nausea",
                diagnosis: "Acute gastroenteritis",
                treatment: "IV fluids administered. Anti-nausea medication given. Symptoms resolved after 4 hours.",
                prescriptions: ["Ondansetron 4mg as needed"],
                labTests: ["Complete Blood Count", "Basic Metabolic Panel"],
                followUp: "Follow up with primary care if symptoms recur"
            }],

        documents: [
            {
                id: 1,
                name: "HbA1c Test Results - December 2025",
                category: "Lab Results",
                uploadDate: "12/05/2025",
                size: "245 KB",
                uploadedBy: "Dr. Robert Anderson"
            },
            {
                id: 2,
                name: "Chest X-Ray Report",
                category: "Imaging",
                uploadDate: "11/20/2025",
                size: "1.2 MB",
                uploadedBy: "Radiology Department"
            },
            {
                id: 3,
                name: "Metformin Prescription",
                category: "Prescriptions",
                uploadDate: "12/05/2025",
                size: "156 KB",
                uploadedBy: "Dr. Robert Anderson"
            },
            {
                id: 4,
                name: "Surgical Consent Form - Cholecystectomy",
                category: "Consent Forms",
                uploadDate: "08/10/2021",
                size: "892 KB",
                uploadedBy: "Surgical Department"
            },
            {
                id: 5,
                name: "Lipid Panel Results",
                category: "Lab Results",
                uploadDate: "12/05/2025",
                size: "198 KB",
                uploadedBy: "Laboratory Services"
            },
            {
                id: 6,
                name: "Echocardiogram Report",
                category: "Imaging",
                uploadDate: "06/20/2025",
                size: "2.4 MB",
                uploadedBy: "Cardiology Department"
            },
            {
                id: 7,
                name: "HIPAA Privacy Notice",
                category: "Consent Forms",
                uploadDate: "01/15/2024",
                size: "567 KB",
                uploadedBy: "Administration"
            },
            {
                id: 8,
                name: "Thyroid Function Test Results",
                category: "Lab Results",
                uploadDate: "09/15/2025",
                size: "178 KB",
                uploadedBy: "Dr. Emily Chen"
            }]

    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2'>


            <div className=' dark:bg-darkSecondaryBackground p-2 rounded-lg border flex flex-row items-center justify-between m-2 mb-0'>
                <div className='flex flex-row gap-4'>
                    <Avatar className='rounded-md w-20 h-20'>
                        <AvatarImage src={selectedPatient?.user.avatar.substring(0, 1)} alt="@shadcn" />
                        <AvatarFallback className='rounded-md text-[56px] bg-sky-500  font-bold'>{selectedPatient?.user.displayName.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className='text-xl'>{selectedPatient?.user.displayName}</h2>
                        <h4 className='text-xs text-muted-foreground'>{selectedPatient?.user.email}</h4>
                    </div>
                </div>

                <div className='text-sm flex flex-col gap-2 justify-around text-muted-foreground'>
                    <div>
                        <IdCard className='inline-block mr-2' size={16} />
                        <span className='text-sm font-mono'>{selectedPatient?.user?.uuid}</span>
                    </div>
                    <div>
                        <Calendar className='inline-block mr-2' size={16} />
                        <span className='text-sm'>56 Years</span>
                    </div>
                    <div>
                        <User className='inline-block mr-2' size={16} />
                        <span className='text-sm'>{selectedPatient?.user?.profile?.gender}</span>
                    </div>
                </div>
            </div>


            {/* <div className='w-full dark:bg-[#151D24] p-4 rounded-lg border'>
                <DataTable columns={columns} data={tempData} />
            </div> */}

            <ScrollArea className='h-[89vh] w-full p-2 ' >
                <div className='h-full dark:bg-darkSecondaryBackground rounded-md pb-10 overflow-hidden p-2'>
                    <PatientProfileInteractive patientData={mockPatientData} patient={selectedPatient} />
                </div>
            </ScrollArea>


        </div>
    )
}
