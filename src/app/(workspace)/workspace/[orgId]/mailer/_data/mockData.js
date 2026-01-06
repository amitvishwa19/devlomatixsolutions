// Staff members with Indian names - Hospital Management System
export const staffMembers = [
  { id: '1', name: 'Dr. Rajesh Sharma', role: 'doctor', department: 'Cardiology', email: 'rajesh.sharma@hospital.in' },
  { id: '2', name: 'Dr. Priya Patel', role: 'doctor', department: 'Emergency', email: 'priya.patel@hospital.in' },
  { id: '3', name: 'Nurse Anita Verma', role: 'nurse', department: 'ICU', email: 'anita.verma@hospital.in' },
  { id: '4', name: 'Nurse Suresh Kumar', role: 'nurse', department: 'Pediatrics', email: 'suresh.kumar@hospital.in' },
  { id: '5', name: 'Admin Meera Gupta', role: 'admin', department: 'Administration', email: 'meera.gupta@hospital.in' },
  { id: '6', name: 'Tech Vikram Singh', role: 'technician', department: 'Radiology', email: 'vikram.singh@hospital.in' },
  { id: '7', name: 'Dr. Kavita Reddy', role: 'doctor', department: 'Neurology', email: 'kavita.reddy@hospital.in' },
  { id: '8', name: 'Pharmacist Arun Joshi', role: 'pharmacist', department: 'Pharmacy', email: 'arun.joshi@hospital.in' },
];

export const currentUser = {
  id: '1',
  name: 'Dr. Rajesh Sharma',
  role: 'doctor',
  department: 'Cardiology',
  email: 'rajesh.sharma@hospital.in',
};

export const mockEmails = [
  {
    id: 'mock-1',
    from: staffMembers[1],
    to: [currentUser],
    subject: 'URGENT: Patient Transfer from Emergency Ward',
    body: `Dr. Sharma,

We have a 62-year-old male patient presenting with acute chest pain and elevated troponin levels. ECG shows ST-elevation in leads V1-V4.

Patient is currently stable but requires immediate cardiology consultation. I've started him on aspirin and heparin per protocol.

Patient Details:
- Name: Ramesh Iyer
- Age: 62 years
- BP: 150/95 mmHg
- Pulse: 98 bpm

Can you come down to the Emergency ward as soon as possible?

Best regards,
Dr. Priya Patel
Emergency Medicine`,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isRead: false,
    isStarred: true,
    priority: 'urgent',
    folder: 'inbox',
  },
  {
    id: 'mock-2',
    from: staffMembers[2],
    to: [currentUser],
    subject: 'ICU Patient Update - Bed 302 - Mr. Krishnamurthy',
    body: `Good morning Dr. Sharma,

Just wanted to update you on Mr. Venkat Krishnamurthy in ICU Bed 302. His vitals have stabilized overnight:
- BP: 128/82 mmHg
- HR: 72 bpm
- O2 Sat: 97% on room air
- Temperature: 98.4°F

He's responding well to the medication adjustments you made yesterday. His family is requesting a meeting this afternoon if you're available.

Please let me know what time works for you.

Regards,
Nurse Anita Verma
ICU Department`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
    isStarred: false,
    priority: 'high',
    folder: 'inbox',
  },
  {
    id: 'mock-3',
    from: staffMembers[4],
    to: [currentUser],
    subject: 'Monthly Cardiology Department Meeting - January Schedule',
    body: `Dear Dr. Sharma,

This is a reminder that the monthly Cardiology Department meeting is scheduled for next Monday at 2:00 PM in Conference Room B.

Agenda items include:
1. New ECG machine procurement from Philips India
2. Staff scheduling for Q1 2024
3. Research project updates - Cardiac rehabilitation study
4. Quality improvement initiatives
5. Discussion on new NABH accreditation requirements

Please confirm your attendance by Friday.

Best regards,
Meera Gupta
Hospital Administration`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    isRead: true,
    isStarred: false,
    priority: 'normal',
    folder: 'inbox',
  },
  {
    id: 'mock-4',
    from: staffMembers[5],
    to: [currentUser],
    subject: 'Echocardiogram Results Ready - Patient Lakshmi Devi',
    body: `Dr. Sharma,

The echocardiogram results for Mrs. Lakshmi Devi (MRN: 4521889) are now available in the PACS system.

Key findings:
- LVEF: 45% (mildly reduced)
- Moderate mitral regurgitation
- No pericardial effusion
- Normal RV function
- Mild LVH noted

Full report is available in the imaging portal. Let me know if you need additional views or a stress echo.

Vikram Singh
Senior Radiology Technician`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    isRead: true,
    isStarred: true,
    priority: 'normal',
    folder: 'inbox',
  },
  {
    id: 'mock-5',
    from: staffMembers[7],
    to: [currentUser],
    subject: 'Medication Interaction Query - Patient Gopal Menon',
    body: `Dr. Sharma,

I noticed a potential interaction in the new prescription for Mr. Gopal Menon:
- Current: Warfarin 5mg daily
- New order: Amiodarone 200mg BID

This combination can significantly increase INR and bleeding risk. As per our hospital protocol, I need your confirmation before dispensing.

Would you like me to:
1. Hold the amiodarone pending discussion
2. Suggest an alternative antiarrhythmic (Sotalol?)
3. Adjust the warfarin dose to 2.5mg

Please advise at your earliest convenience.

Arun Joshi, PharmD
Clinical Pharmacist
Pharmacy Department`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    isStarred: false,
    priority: 'high',
    folder: 'inbox',
  },
  {
    id: 'mock-6',
    from: staffMembers[6],
    to: [currentUser],
    subject: 'Neurology Consultation Request - AF Patient with TIA',
    body: `Dear Dr. Sharma,

Thank you for the referral of Mr. Subramaniam (68 years, AF with recent TIA).

I've completed my evaluation:
- MRI brain shows small lacunar infarct in left basal ganglia
- Carotid doppler - 40% stenosis on right
- No hemorrhagic transformation

Regarding anticoagulation, I agree with starting Apixaban 5mg BD given his CHA2DS2-VASc score of 5. Would like to discuss his case in our next neuro-cardio MDT meeting.

Best,
Dr. Kavita Reddy
Consultant Neurologist`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36),
    isRead: true,
    isStarred: true,
    priority: 'normal',
    folder: 'inbox',
  },
  {
    id: 'mock-7',
    from: staffMembers[3],
    to: [currentUser],
    subject: 'Pediatric Cardiology Referral - Child with Heart Murmur',
    body: `Respected Dr. Sharma,

We have a 6-year-old girl, Ananya, admitted in Pediatrics with a newly detected heart murmur during routine checkup.

Clinical findings:
- Grade 3/6 systolic murmur at left sternal border
- No cyanosis
- Good effort tolerance as per parents
- No family history of congenital heart disease

Could you please arrange for a pediatric echo at your convenience? Parents are quite anxious.

Regards,
Nurse Suresh Kumar
Pediatrics Ward`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isRead: true,
    isStarred: false,
    priority: 'normal',
    folder: 'inbox',
  },
  {
    id: 'mock-8',
    from: currentUser,
    to: [staffMembers[6]],
    subject: 'Re: Consultation Request - Stroke Protocol',
    body: `Dr. Reddy,

Thank you for your quick evaluation of Mr. Subramaniam.

I agree with Apixaban initiation. I'll ensure his renal function is monitored as he has borderline creatinine (1.3 mg/dL).

Let's discuss in MDT on Thursday. I'll also present another case of paradoxical embolism in a young patient with PFO.

Best,
Dr. Rajesh Sharma
Consultant Cardiologist`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30),
    isRead: true,
    isStarred: false,
    priority: 'normal',
    folder: 'sent',
  },
  {
    id: 'mock-9',
    from: currentUser,
    to: [staffMembers[1]],
    subject: 'Re: URGENT: Patient Transfer from Emergency Ward',
    body: `Dr. Patel,

On my way to Emergency now. Please prepare for possible primary PCI.

Alert the Cath Lab team - Dr. Arvind and team should be on standby.

Also ensure:
- Consent forms ready
- Blood group typed and cross-matched
- IV access secured (2 large bore)

ETA 5 minutes.

Dr. Sharma`,
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    isRead: true,
    isStarred: false,
    priority: 'urgent',
    folder: 'sent',
  },
  {
    id: 'mock-10',
    from: staffMembers[4],
    to: [currentUser],
    subject: 'OPD Schedule Change Request - Diwali Week',
    body: `Dear Dr. Sharma,

Due to the upcoming Diwali holidays (October 31 - November 4), we need to reschedule some OPD slots.

Your current schedule:
- Monday (Oct 30): 9 AM - 1 PM ✓ (No change)
- Tuesday (Oct 31): OFF (Diwali)
- Wednesday (Nov 1): OFF (Govardhan Puja)
- Thursday (Nov 2): 2 PM - 6 PM (Rescheduled from morning)
- Friday (Nov 3): OFF (Bhai Dooj)
- Saturday (Nov 4): 9 AM - 1 PM (Extra slot added)

Please confirm if this works for you. We have 45 patients already booked for that week.

Regards,
Meera Gupta
Hospital Administration`,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    isRead: true,
    isStarred: false,
    priority: 'normal',
    folder: 'inbox',
  },
];

// Mock drafts for local mode
export const mockDrafts = [
  {
    id: 'draft-1',
    recipientId: '7',
    subject: 'Follow-up on Cardiac Rehab Protocol',
    body: 'Dear Dr. Reddy,\n\nI wanted to follow up on our discussion about the new cardiac rehabilitation protocol...',
    priority: 'normal',
    savedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
];
