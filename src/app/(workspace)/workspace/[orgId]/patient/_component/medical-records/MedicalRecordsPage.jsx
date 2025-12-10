import MedicalRecordsInteractive from "./MedicalRecordsInteractive";


export const metadata = {
    title: 'Medical Records - PatientCare Pro',
    description: 'Comprehensive patient medical history, documentation, and clinical data management for healthcare providers'
};

export default function MedicalRecordsPage() {


    const mockData = {
        medicalHistory: [
            {
                id: "MH001",
                type: "diagnosis",
                title: "Type 2 Diabetes Mellitus",
                date: "12/01/2025",
                summary: "Patient diagnosed with Type 2 Diabetes following elevated HbA1c levels and fasting glucose tests. Initiated on metformin therapy with dietary modifications.",
                details: {
                    provider: "Dr. Sarah Mitchell",
                    location: "PatientCare Pro - Main Clinic",
                    notes: "Patient presented with increased thirst, frequent urination, and unexplained weight loss over 3 months. Family history positive for diabetes.",
                    outcome: "Stable on current medication regimen with improved glucose control"
                }
            },
            {
                id: "MH002",
                type: "procedure",
                title: "Cardiac Catheterization",
                date: "11/15/2025",
                summary: "Diagnostic cardiac catheterization performed to evaluate coronary artery disease. Procedure revealed 40% stenosis in LAD, managed medically.",
                details: {
                    provider: "Dr. James Anderson",
                    location: "City General Hospital - Cardiology Department",
                    notes: "Patient experienced chest pain on exertion. Stress test showed abnormalities requiring further investigation.",
                    outcome: "No intervention required. Continue medical management with statins and antiplatelet therapy"
                }
            },
            {
                id: "MH003",
                type: "treatment",
                title: "Physical Therapy for Lower Back Pain",
                date: "10/20/2025",
                summary: "12-week physical therapy program completed for chronic lower back pain management. Significant improvement in mobility and pain reduction.",
                details: {
                    provider: "Dr. Emily Rodriguez, PT",
                    location: "PatientCare Pro - Rehabilitation Center",
                    notes: "Patient completed strengthening exercises, manual therapy, and postural training. Demonstrated excellent compliance with home exercise program.",
                    outcome: "Pain reduced from 8/10 to 3/10. Improved functional capacity and quality of life"
                }
            },
            {
                id: "MH004",
                type: "visit",
                title: "Annual Physical Examination",
                date: "09/10/2025",
                summary: "Comprehensive annual physical examination with routine health screening and preventive care counseling.",
                details: {
                    provider: "Dr. Sarah Mitchell",
                    location: "PatientCare Pro - Main Clinic",
                    notes: "All vital signs within normal limits. Updated immunizations. Discussed lifestyle modifications for cardiovascular health.",
                    outcome: "Overall health status good. Continue current medications and follow-up in 6 months"
                }
            }],

        noteTemplates: [
            {
                id: "TPL001",
                name: "SOAP Note Template",
                type: "soap",
                content: `Subjective:\n[Patient's chief complaint and history]\n\nObjective:\n[Physical examination findings and vital signs]\n\nAssessment:\n[Diagnosis and clinical impression]\n\nPlan:\n[Treatment plan and follow-up recommendations]`
            },
            {
                id: "TPL002",
                name: "Progress Note Template",
                type: "progress",
                content: `Date: [Current Date]\n\nPatient Status:\n[Current condition and response to treatment]\n\nChanges in Treatment:\n[Any modifications to current treatment plan]\n\nFollow-up:\n[Next steps and scheduled appointments]`
            },
            {
                id: "TPL003",
                name: "Consultation Template",
                type: "consultation",
                content: `Reason for Consultation:\n[Referring physician's question or concern]\n\nHistory of Present Illness:\n[Detailed patient history]\n\nRecommendations:\n[Specialist recommendations and treatment suggestions]`
            },
            {
                id: "TPL004",
                name: "Procedure Note Template",
                type: "procedure",
                content: `Procedure: [Name of procedure]\nDate: [Date performed]\nIndication: [Reason for procedure]\n\nProcedure Details:\n[Step-by-step description]\n\nComplications: [Any complications or none]\n\nPost-Procedure Plan:\n[Follow-up care instructions]`
            }],

        labResults: [
            {
                id: "LAB001",
                name: "Complete Blood Count (CBC)",
                value: "14.2",
                unit: "g/dL",
                status: "normal",
                date: "12/05/2025",
                normalRange: "12.0-16.0 g/dL",
                orderedBy: "Dr. Sarah Mitchell",
                notes: "Hemoglobin levels within normal range. No signs of anemia.",
                normalMin: 12.0,
                normalMax: 16.0,
                trendData: [
                    { date: "08/05/2025", value: 13.8 },
                    { date: "09/15/2025", value: 14.0 },
                    { date: "10/20/2025", value: 14.1 },
                    { date: "11/10/2025", value: 14.3 },
                    { date: "12/05/2025", value: 14.2 }]

            },
            {
                id: "LAB002",
                name: "HbA1c (Glycated Hemoglobin)",
                value: "7.8",
                unit: "%",
                status: "abnormal",
                date: "12/03/2025",
                normalRange: "< 5.7%",
                orderedBy: "Dr. Sarah Mitchell",
                notes: "Elevated HbA1c indicates suboptimal diabetes control. Consider medication adjustment and dietary counseling.",
                normalMin: 0,
                normalMax: 5.7,
                trendData: [
                    { date: "06/01/2025", value: 8.2 },
                    { date: "07/15/2025", value: 8.0 },
                    { date: "09/01/2025", value: 7.9 },
                    { date: "10/15/2025", value: 7.8 },
                    { date: "12/03/2025", value: 7.8 }]

            },
            {
                id: "LAB003",
                name: "Lipid Panel - Total Cholesterol",
                value: "245",
                unit: "mg/dL",
                status: "abnormal",
                date: "12/01/2025",
                normalRange: "< 200 mg/dL",
                orderedBy: "Dr. James Anderson",
                notes: "Elevated total cholesterol. Patient on statin therapy. Consider dose adjustment.",
                normalMin: 0,
                normalMax: 200,
                trendData: [
                    { date: "06/01/2025", value: 260 },
                    { date: "07/15/2025", value: 255 },
                    { date: "09/01/2025", value: 250 },
                    { date: "10/15/2025", value: 248 },
                    { date: "12/01/2025", value: 245 }]

            },
            {
                id: "LAB004",
                name: "Creatinine",
                value: "1.1",
                unit: "mg/dL",
                status: "normal",
                date: "11/28/2025",
                normalRange: "0.7-1.3 mg/dL",
                orderedBy: "Dr. Sarah Mitchell",
                notes: "Kidney function within normal limits. Continue current medications.",
                normalMin: 0.7,
                normalMax: 1.3,
                trendData: [
                    { date: "06/01/2025", value: 1.0 },
                    { date: "07/15/2025", value: 1.1 },
                    { date: "09/01/2025", value: 1.0 },
                    { date: "10/15/2025", value: 1.1 },
                    { date: "11/28/2025", value: 1.1 }]

            },
            {
                id: "LAB005",
                name: "Thyroid Stimulating Hormone (TSH)",
                value: "8.5",
                unit: "mIU/L",
                status: "critical",
                date: "11/25/2025",
                normalRange: "0.4-4.0 mIU/L",
                orderedBy: "Dr. Sarah Mitchell",
                notes: "Significantly elevated TSH indicates hypothyroidism. Initiate levothyroxine therapy immediately.",
                normalMin: 0.4,
                normalMax: 4.0,
                trendData: [
                    { date: "05/01/2025", value: 4.5 },
                    { date: "06/15/2025", value: 5.2 },
                    { date: "08/01/2025", value: 6.8 },
                    { date: "09/15/2025", value: 7.5 },
                    { date: "11/25/2025", value: 8.5 }]

            }],

        prescriptions: [
            {
                id: "RX001",
                medication: "Metformin",
                dosage: "1000mg",
                frequency: "Twice daily with meals",
                status: "active",
                startDate: "12/01/2025",
                renewalDate: "03/01/2026",
                prescribedBy: "Dr. Sarah Mitchell",
                instructions: "Take with breakfast and dinner to minimize gastrointestinal side effects. Monitor blood glucose levels regularly.",
                sideEffects: "Common: Nausea, diarrhea, stomach upset. Rare: Lactic acidosis (seek immediate medical attention if experiencing muscle pain, weakness, or difficulty breathing)"
            },
            {
                id: "RX002",
                medication: "Lisinopril",
                dosage: "10mg",
                frequency: "Once daily in the morning",
                status: "active",
                startDate: "11/15/2025",
                renewalDate: "02/15/2026",
                prescribedBy: "Dr. James Anderson",
                instructions: "Take at the same time each day. May cause dizziness initially - rise slowly from sitting or lying position.",
                sideEffects: "Common: Dry cough, dizziness, headache. Serious: Swelling of face/lips/tongue (seek immediate medical attention)"
            },
            {
                id: "RX003",
                medication: "Atorvastatin",
                dosage: "40mg",
                frequency: "Once daily at bedtime",
                status: "active",
                startDate: "10/01/2025",
                renewalDate: "01/01/2026",
                prescribedBy: "Dr. James Anderson",
                instructions: "Take in the evening for optimal cholesterol-lowering effect. Avoid grapefruit juice while on this medication.",
                sideEffects: "Common: Muscle aches, headache, nausea. Serious: Severe muscle pain or weakness (may indicate rhabdomyolysis - seek immediate medical attention)"
            },
            {
                id: "RX004",
                medication: "Aspirin",
                dosage: "81mg",
                frequency: "Once daily",
                status: "active",
                startDate: "09/10/2025",
                renewalDate: "12/10/2025",
                prescribedBy: "Dr. Sarah Mitchell",
                instructions: "Take with food to reduce stomach irritation. Do not crush or chew enteric-coated tablets.",
                sideEffects: "Common: Stomach upset, heartburn. Serious: Unusual bleeding or bruising, black/tarry stools (contact physician immediately)"
            },
            {
                id: "RX005",
                medication: "Ibuprofen",
                dosage: "400mg",
                frequency: "As needed for pain (max 3 times daily)",
                status: "discontinued",
                startDate: "08/15/2025",
                prescribedBy: "Dr. Emily Rodriguez",
                instructions: "Discontinued due to potential interaction with Lisinopril and increased risk of kidney problems.",
                sideEffects: "Common: Stomach upset, nausea, dizziness. Serious: Kidney problems, increased blood pressure"
            }],

        vitalSigns: {
            bloodPressure: [
                { date: "08/05/2025", value: { systolic: 138, diastolic: 88 } },
                { date: "09/15/2025", value: { systolic: 135, diastolic: 85 } },
                { date: "10/20/2025", value: { systolic: 128, diastolic: 82 } },
                { date: "11/10/2025", value: { systolic: 125, diastolic: 80 } },
                { date: "12/05/2025", value: { systolic: 122, diastolic: 78 } }],

            heartRate: [
                { date: "08/05/2025", value: 78 },
                { date: "09/15/2025", value: 76 },
                { date: "10/20/2025", value: 74 },
                { date: "11/10/2025", value: 72 },
                { date: "12/05/2025", value: 70 }],

            temperature: [
                { date: "08/05/2025", value: 98.4 },
                { date: "09/15/2025", value: 98.6 },
                { date: "10/20/2025", value: 98.5 },
                { date: "11/10/2025", value: 98.3 },
                { date: "12/05/2025", value: 98.6 }],

            oxygenSaturation: [
                { date: "08/05/2025", value: 97 },
                { date: "09/15/2025", value: 98 },
                { date: "10/20/2025", value: 98 },
                { date: "11/10/2025", value: 97 },
                { date: "12/05/2025", value: 98 }]

        },
        allergies: [
            {
                id: "ALG001",
                allergen: "Penicillin",
                reaction: "Severe anaphylactic reaction with difficulty breathing, hives, and swelling",
                severity: "severe",
                diagnosedDate: "03/15/2018",
                verifiedBy: "Dr. Michael Chen"
            },
            {
                id: "ALG002",
                allergen: "Shellfish",
                reaction: "Moderate allergic reaction with facial swelling and urticaria",
                severity: "moderate",
                diagnosedDate: "06/22/2020",
                verifiedBy: "Dr. Sarah Mitchell"
            },
            {
                id: "ALG003",
                allergen: "Latex",
                reaction: "Mild skin irritation and contact dermatitis",
                severity: "mild",
                diagnosedDate: "01/10/2022",
                verifiedBy: "Dr. Emily Rodriguez"
            }],

        documents: [
            {
                id: "DOC001",
                name: "Chest X-Ray - Frontal View",
                category: "imaging",
                fileType: "image/jpeg",
                fileSize: "2.4 MB",
                uploadDate: "12/05/2025",
                thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_112761cec-1764734401350.png"
            },
            {
                id: "DOC002",
                name: "Complete Blood Count Report",
                category: "reports",
                fileType: "application/pdf",
                fileSize: "156 KB",
                uploadDate: "12/03/2025",
                thumbnail: null
            },
            {
                id: "DOC003",
                name: "Metformin Prescription",
                category: "prescriptions",
                fileType: "application/pdf",
                fileSize: "89 KB",
                uploadDate: "12/01/2025",
                thumbnail: null
            },
            {
                id: "DOC004",
                name: "Cardiology Referral Letter",
                category: "referrals",
                fileType: "application/pdf",
                fileSize: "124 KB",
                uploadDate: "11/28/2025",
                thumbnail: null
            },
            {
                id: "DOC005",
                name: "MRI Scan - Lumbar Spine",
                category: "imaging",
                fileType: "image/jpeg",
                fileSize: "3.8 MB",
                uploadDate: "11/20/2025",
                thumbnail: "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=400"
            },
            {
                id: "DOC006",
                name: "Lipid Panel Results",
                category: "reports",
                fileType: "application/pdf",
                fileSize: "142 KB",
                uploadDate: "11/15/2025",
                thumbnail: null
            }],

        stats: {
            totalVisits: 24,
            activeMedications: 4,
            labTests: 18,
            documents: 32
        }
    };

    return (
        <div className="min-h-screen bg-background">


            <main className="pt-20 px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Medical Records</h1>
                        <p className="text-text-secondary">
                            Comprehensive patient medical history, documentation, and clinical data management
                        </p>
                    </div>

                    <MedicalRecordsInteractive initialData={mockData} />
                </div>
            </main>
        </div>);

}