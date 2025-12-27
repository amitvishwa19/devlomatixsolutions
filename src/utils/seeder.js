import { ROLE } from "@prisma/client";

export function seeder() {

    const firstNames = [
        "Amit", "Riya", "Karan", "Neha", "Vishal", "Priya", "Rahul", "Sneha", "Arjun", "Meera", "Sahil", "Ananya", "Rohit", "Tanya", "Deepak", "Isha", "Manish", "Pooja", "Varun",
        "Kavya", "Aarav", "Diya", "Ishan", "Simran", "Nikhil", "Aarohi", "Raj", "Sanya", "Aditya", "Divya", "John", "Emma", "Olivia", "Liam", "Sophia", "Noah", "Ava", "Ethan",
        "Mia", "Lucas", "Isabella", "Mason", "Charlotte", "Elijah", "Amelia", "James", "Harper", "Benjamin", "Evelyn", "Alexander", "Ella"
    ];

    const lastNames = [
        "Patel", "Sharma", "Singh", "Mehta", "Verma", "Gupta", "Rao", "Iyer", "Chopra", "Bose", "Desai", "Naidu", "Ghosh", "Nair", "Yadav", "Kaur", "Bhat", "Malhotra", "Joshi", "Kapoor",
        "Reddy", "Das", "Pillai", "Pandey", "Chatterjee", "Dutta", "Menon", "Bhattacharya", "Tiwari", "Mishra", "Smith", "Johnson", "Brown", "Williams", "Jones", "Garcia", "Miller",
        "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "White"
    ];

    const sex = ["Male", "Female"];
    const avaliblity = [true, false];

    const roles = [
        "DOCTOR", "NURSE", "ADMIN", "PATIENT", "TECHNICIAN", "RECEPTIONIST", "PHARMACIST"
    ];


    const users = Array.from({ length: 5 }, (_, i) => {
        const f = firstNames[Math.floor(Math.random() * firstNames.length)];
        const l = lastNames[Math.floor(Math.random() * lastNames.length)];
        const gender = sex[Math.floor(Math.random() * sex.length)];
        const role = roles[Math.floor(Math.random() * roles.length)];
        const displayName = `${f} ${l}`;
        const email = `${f.toLowerCase()}.${l.toLowerCase()}@healthyfine.com`;
        const status = true;
        const avaliable = avaliblity[Math.floor(Math.random() * gender.length)];
        const online = avaliblity[Math.floor(Math.random() * gender.length)];


        return {
            email,
            firstName: f,
            lastName: l,
            displayName,
            avatar: `https://randomuser.me/api/portraits/${gender === "Male" ? "men" : "women"}/${Math.floor(Math.random() * 90) + 1}.jpg`,
            gender,
            role,
            avaliable,
            online
        };
    });



    const userRoles = [
        { title: "DOCTOR", description: "Responsible for patient diagnosis and treatment", status: true },
        { title: "NURSING", description: "Assists doctors and manages patient care", status: true },
        { title: "ADMIN", description: "Manages system administration and operations", status: true },
        { title: "PATIENT", description: "Registered patient using the platform", status: true },
        { title: "TECHNICIAN", description: "Handles technical medical equipment", status: true },
        { title: "RECEPTION", description: "Manages appointments and patient queries", status: true },
        { title: "PHARMACY", description: "Manages medicines and prescriptions", status: true }
    ];


    const roleSeed = [
        { title: 'management', description: 'General management permissions', status: true },
    ]

    const permissionSeed = [
        // Patients
        { value: 'patients.view', title: 'View Patients', description: 'View patient list and profiles', status: true, categoryId: null },
        { value: 'patients.create', title: 'Create Patients', description: 'Add new patients to the system', status: true, categoryId: null },
        { value: 'patients.edit', title: 'Edit Patients', description: 'Modify patient information', status: true, categoryId: null },
        { value: 'patients.delete', title: 'Delete Patients', description: 'Remove patients from the system', status: true, categoryId: null },

        // Doctors
        { value: 'doctors.view', title: 'View Doctors', description: 'View doctor profiles and details', status: true, categoryId: null },
        { value: 'doctors.create', title: 'Create Doctors', description: 'Add new doctors to the system', status: true, categoryId: null },
        { value: 'doctors.edit', title: 'Edit Doctors', description: 'Modify doctor information', status: true, categoryId: null },
        { value: 'doctors.delete', title: 'Delete Doctors', description: 'Remove doctors from the system', status: true, categoryId: null },

        // Departments
        { value: 'departments.view', title: 'View Departments', description: 'View hospital departments', status: true, categoryId: null },
        { value: 'departments.create', title: 'Create Departments', description: 'Add new departments', status: true, categoryId: null },
        { value: 'departments.edit', title: 'Edit Departments', description: 'Modify department details', status: true, categoryId: null },
        { value: 'departments.delete', title: 'Delete Departments', description: 'Remove departments', status: true, categoryId: null },

        // Admissions & Discharge
        { value: 'admissions.view', title: 'View Admissions', description: 'View patient admission records', status: true, categoryId: null },
        { value: 'admissions.create', title: 'Admit Patients', description: 'Admit patients to hospital', status: true, categoryId: null },
        { value: 'admissions.edit', title: 'Edit Admissions', description: 'Modify admission details', status: true, categoryId: null },
        { value: 'discharge.process', title: 'Process Discharge', description: 'Discharge patients from hospital', status: true, categoryId: null },

        // Labs & Diagnostics
        { value: 'labs.view', title: 'View Lab Tests', description: 'View laboratory test records', status: true, categoryId: null },
        { value: 'labs.create', title: 'Create Lab Tests', description: 'Order new lab tests', status: true, categoryId: null },
        { value: 'labs.edit', title: 'Edit Lab Tests', description: 'Modify lab test details', status: true, categoryId: null },
        { value: 'labs.approve', title: 'Approve Lab Results', description: 'Approve and verify lab results', status: true, categoryId: null },

        // Pharmacy & Inventory
        { value: 'pharmacy.view', title: 'View Pharmacy', description: 'View medicines and prescriptions', status: true, categoryId: null },
        { value: 'pharmacy.dispense', title: 'Dispense Medicines', description: 'Dispense medicines to patients', status: true, categoryId: null },
        { value: 'pharmacy.return', title: 'Return Medicines', description: 'Process returned medicines', status: true, categoryId: null },
        { value: 'inventory.view', title: 'View Inventory', description: 'View medical inventory and stock', status: true, categoryId: null },
        { value: 'inventory.create', title: 'Add Inventory', description: 'Add new inventory items', status: true, categoryId: null },
        { value: 'inventory.update', title: 'Update Inventory', description: 'Update inventory stock levels', status: true, categoryId: null },

        // Insurance & Claims
        { value: 'insurance.view', title: 'View Insurance', description: 'View patient insurance details', status: true, categoryId: null },
        { value: 'insurance.verify', title: 'Verify Insurance', description: 'Verify insurance eligibility', status: true, categoryId: null },
        { value: 'claims.create', title: 'Create Claims', description: 'Create insurance claims', status: true, categoryId: null },
        { value: 'claims.process', title: 'Process Claims', description: 'Process insurance claims', status: true, categoryId: null },

        // Rooms & Beds
        { value: 'rooms.view', title: 'View Rooms', description: 'View hospital rooms and wards', status: true, categoryId: null },
        { value: 'beds.assign', title: 'Assign Beds', description: 'Assign beds to patients', status: true, categoryId: null },
        { value: 'beds.transfer', title: 'Transfer Beds', description: 'Transfer patients between beds', status: true, categoryId: null },

        // Staff
        { value: 'staff.view', title: 'View Staff', description: 'View staff list and profiles', status: true, categoryId: null },
        { value: 'staff.create', title: 'Create Staff', description: 'Add new staff members', status: true, categoryId: null },
        { value: 'staff.edit', title: 'Edit Staff', description: 'Modify staff information', status: true, categoryId: null },
        { value: 'staff.delete', title: 'Delete Staff', description: 'Remove staff members', status: true, categoryId: null },

        // Appointments
        { value: 'appointments.view', title: 'View Appointments', description: 'View all appointments', status: true, categoryId: null },
        { value: 'appointments.create', title: 'Create Appointments', description: 'Schedule new appointments', status: true, categoryId: null },
        { value: 'appointments.edit', title: 'Edit Appointments', description: 'Modify existing appointments', status: true, categoryId: null },
        { value: 'appointments.delete', title: 'Cancel Appointments', description: 'Cancel scheduled appointments', status: true, categoryId: null },

        // Records
        { value: 'records.view', title: 'View Records', description: 'Access medical records', status: true, categoryId: null },
        { value: 'records.create', title: 'Create Records', description: 'Add new medical records', status: true, categoryId: null },
        { value: 'records.edit', title: 'Edit Records', description: 'Modify medical records', status: true, categoryId: null },
        { value: 'records.export', title: 'Export Records', description: 'Export medical records', status: true, categoryId: null },

        // Billing
        { value: 'billing.view', title: 'View Billing', description: 'View invoices and payments', status: true, categoryId: null },
        { value: 'billing.create', title: 'Create Invoices', description: 'Generate new invoices', status: true, categoryId: null },
        { value: 'billing.process', title: 'Process Payments', description: 'Handle payment processing', status: true, categoryId: null },
        { value: 'billing.refund', title: 'Issue Refunds', description: 'Process refunds', status: true, categoryId: null },

        // Reports
        { value: 'reports.view', title: 'View Reports', description: 'Access system reports', status: true, categoryId: null },
        { value: 'reports.create', title: 'Generate Reports', description: 'Create custom reports', status: true, categoryId: null },
        { value: 'reports.export', title: 'Export Reports', description: 'Export reports to files', status: true, categoryId: null },

        // Security & Notifications
        { value: 'audit.view', title: 'View Audit Logs', description: 'View system audit logs', status: true, categoryId: null },
        { value: 'audit.export', title: 'Export Audit Logs', description: 'Export audit logs', status: true, categoryId: null },
        { value: 'sessions.terminate', title: 'Terminate Sessions', description: 'Force logout active sessions', status: true, categoryId: null },
        { value: 'notifications.view', title: 'View Notifications', description: 'View system notifications', status: true, categoryId: null },
        { value: 'notifications.send', title: 'Send Notifications', description: 'Send SMS, email, or app notifications', status: true, categoryId: null },

        // Settings
        { value: 'settings.view', title: 'View Settings', description: 'View system settings', status: true, categoryId: null },
        { value: 'settings.edit', title: 'Edit Settings', description: 'Modify system settings', status: true, categoryId: null },
        { value: 'settings.roles', title: 'Manage Roles', description: 'Create and edit roles', status: true, categoryId: null },
    ];


    const categorySeed = [
        {
            name: "Content Management",
            slug: "content-management",
            icon: "file-text",
            description: "Manage all your content in one clean, organized system. Create quickly, update easily, and publish with confidence."
        },
        {
            name: "Patient Management",
            slug: "patient-management",
            icon: "users",
            description: "Manage patient profiles, registrations, and personal health information."
        },
        {
            name: "Doctor Management",
            slug: "doctor-management",
            icon: "user-cog",
            description: "Handle doctor profiles, specialties, schedules, and availability."
        },
        {
            name: "Appointment Scheduling",
            slug: "appointment-scheduling",
            icon: "calendar-clock",
            description: "Schedule, reschedule, and track patient appointments efficiently."
        },
        {
            name: "Departments",
            slug: "departments",
            icon: "building-2",
            description: "Organize hospital services by medical specialties and units."
        },
        {
            name: "Medical Records",
            slug: "medical-records",
            icon: "clipboard-list",
            description: "Store and access patient medical history, reports, and treatments."
        },
        {
            name: "Billing & Invoicing",
            slug: "billing-invoicing",
            icon: "receipt",
            description: "Generate bills, manage payments, and track financial transactions."
        },
        {
            name: "Laboratory & Diagnostics",
            slug: "laboratory-diagnostics",
            icon: "test-tube",
            description: "Manage lab tests, diagnostic reports, and result tracking."
        },
        {
            name: "Pharmacy Management",
            slug: "pharmacy-management",
            icon: "pill",
            description: "Track medicines, prescriptions, and pharmacy inventory."
        },
        {
            name: "Bed & Ward Management",
            slug: "bed-ward-management",
            icon: "bed",
            description: "Monitor bed availability, ward assignments, and patient transfers."
        },
        {
            name: "Staff & HR Management",
            slug: "staff-hr-management",
            icon: "user-check",
            description: "Manage hospital staff records, roles, and schedules."
        },
        {
            name: "Insurance & Claims",
            slug: "insurance-claims",
            icon: "shield-check",
            description: "Handle insurance details, claims processing, and approvals."
        },
        {
            name: "Reports & Analytics",
            slug: "reports-analytics",
            icon: "bar-chart-3",
            description: "Generate insights and reports for operational and clinical data."
        },
        {
            name: "Prescription Services",
            slug: "prescription-services",
            icon: "siren",
            description: "Manage priscription, triage, and urgent care workflows."
        },
        {
            name: "Inventory & Supplies",
            slug: "inventory-supplies",
            icon: "boxes",
            description: "Track medical supplies, equipment, and stock levels."
        },
        {
            name: "Notifications & Alerts",
            slug: "notifications-alerts",
            icon: "bell",
            description: "Send alerts for appointments, emergencies, and system updates."
        },
        {
            name: "Roles & Permissions",
            slug: "roles-permissions",
            icon: "shield",
            description: "Manage roles and permissions for the organization and manage workflow."
        }
    ];

    const inventorySeed = [
        {
            name: "Disposable Syringe 5ml",
            slug: "disposable-syringe-5ml",
            description: "Sterile single-use 5ml syringe for injections",
            sku: "MED-SYR-5ML",
            quantity: 1200,
            minStock: 200,
            unit: "pieces",
            location: "Pharmacy Store - Rack A1",
            expiryDate: new Date("2026-08-31"),
            supplier: "Medicare Supplies Ltd",
            unitPrise: 2.5,
        },
        {
            name: "Surgical Gloves (Medium)",
            slug: "surgical-gloves-medium",
            description: "Latex-free sterile surgical gloves",
            sku: "MED-GLV-M",
            quantity: 800,
            minStock: 150,
            unit: "boxes",
            location: "Central Store - Rack B2",
            expiryDate: new Date("2027-01-15"),
            supplier: "SafeHands Medical",
            unitPrise: 180,
        },
        {
            name: "Paracetamol 500mg",
            slug: "paracetamol-500mg",
            description: "Pain relief and fever reduction tablets",
            sku: "DRG-PARA-500",
            quantity: 5000,
            minStock: 1000,
            unit: "strips",
            location: "Pharmacy - Shelf C3",
            expiryDate: new Date("2026-04-30"),
            supplier: "HealWell Pharma",
            unitPrise: 25,
        },
        {
            name: "IV Fluid Normal Saline 500ml",
            slug: "iv-fluid-normal-saline-500ml",
            description: "Intravenous normal saline solution",
            sku: "IV-NS-500",
            quantity: 650,
            minStock: 100,
            unit: "bottles",
            location: "Emergency Store - Rack D1",
            expiryDate: new Date("2026-12-10"),
            supplier: "LifeLine Infusions",
            unitPrise: 45,
        },
        {
            name: "Oxygen Cylinder (10L)",
            slug: "oxygen-cylinder-10l",
            description: "Portable oxygen cylinder for emergency use",
            sku: "EQP-OXY-10L",
            quantity: 40,
            minStock: 10,
            unit: "units",
            location: "Emergency Ward - Storage Room",
            expiryDate: new Date("2030-01-01"),
            supplier: "AirCare Medical",
            unitPrise: 5500,
        },
        {
            name: "ECG Electrodes",
            slug: "ecg-electrodes",
            description: "Disposable ECG monitoring electrodes",
            sku: "MED-ECG-ELC",
            quantity: 3000,
            minStock: 500,
            unit: "pieces",
            location: "Cardiology Store - Rack E2",
            expiryDate: new Date("2026-09-20"),
            supplier: "CardioTech Supplies",
            unitPrise: 3.2,
        },
        {
            name: "Digital Thermometer",
            slug: "digital-thermometer",
            description: "Digital thermometer for body temperature measurement",
            sku: "EQP-THERMO-DIG",
            quantity: 120,
            minStock: 20,
            unit: "units",
            location: "General Store - Rack F1",
            expiryDate: new Date("2031-01-01"),
            supplier: "ThermoSafe Instruments",
            unitPrise: 250,
        },
        {
            name: "Surgical Mask (3-Ply)",
            slug: "surgical-mask-3-ply",
            description: "Disposable 3-ply surgical face mask",
            sku: "MED-MSK-3PLY",
            quantity: 10000,
            minStock: 2000,
            unit: "pieces",
            location: "Central Store - Rack A3",
            expiryDate: new Date("2027-06-30"),
            supplier: "HealthShield Pvt Ltd",
            unitPrise: 1.2,
        }
    ];

    const serviceSeed = [
        {
            name: "General Consultation",
            slug: "general-consultation",
            description: "Basic doctor consultation for diagnosis and treatment advice",
            price: "500",
            insuranceCover: "covered",
            sku: "SRV-GEN-001",
            invoiceId: null,
            status: true
        },
        {
            name: "Blood Test",
            slug: "blood-test",
            description: "Routine blood examination and lab analysis",
            price: "800",
            insuranceCover: "covered",
            sku: "SRV-LAB-002",
            invoiceId: null,
            status: true
        },
        {
            name: "X-Ray Imaging",
            slug: "x-ray-imaging",
            description: "Digital X-Ray imaging service",
            price: "1200",
            insuranceCover: "covered",
            sku: "SRV-IMG-003",
            invoiceId: null,
            status: true
        },
        {
            name: "MRI Scan",
            slug: "mri-scan",
            description: "Magnetic Resonance Imaging scan",
            price: "6500",
            insuranceCover: "partially_covered",
            sku: "SRV-IMG-004",
            invoiceId: null,
            status: true
        },
        {
            name: "CT Scan",
            slug: "ct-scan",
            description: "Computed Tomography scan",
            price: "5500",
            insuranceCover: "partially_covered",
            sku: "SRV-IMG-005",
            invoiceId: null,
            status: true
        },
        {
            name: "Physiotherapy Session",
            slug: "physiotherapy-session",
            description: "One physiotherapy treatment session",
            price: "1000",
            insuranceCover: "not_covered",
            sku: "SRV-THER-006",
            invoiceId: null,
            status: true
        },
        {
            name: "Minor Surgery",
            slug: "minor-surgery",
            description: "Day-care minor surgical procedure",
            price: "15000",
            insuranceCover: "covered",
            sku: "SRV-SURG-007",
            invoiceId: null,
            status: true
        },
        {
            name: "Major Surgery",
            slug: "major-surgery",
            description: "Major surgical operation with OT charges",
            price: "85000",
            insuranceCover: "covered",
            sku: "SRV-SURG-008",
            invoiceId: null,
            status: true
        },
        {
            name: "Emergency Care",
            slug: "emergency-care",
            description: "24/7 emergency medical services",
            price: "3000",
            insuranceCover: "covered",
            sku: "SRV-EMR-009",
            invoiceId: null,
            status: true
        },
        {
            name: "ICU Admission",
            slug: "icu-admission",
            description: "Intensive Care Unit per day charges",
            price: "12000",
            insuranceCover: "covered",
            sku: "SRV-ICU-010",
            invoiceId: null,
            status: true
        },
        {
            name: "Vaccination",
            slug: "vaccination",
            description: "Routine vaccination service",
            price: "700",
            insuranceCover: "covered",
            sku: "SRV-VAC-011",
            invoiceId: null,
            status: true
        },
        {
            name: "Health Checkup Package",
            slug: "health-checkup-package",
            description: "Comprehensive full-body health checkup",
            price: "4500",
            insuranceCover: "not_covered",
            sku: "SRV-CHK-012",
            invoiceId: null,
            status: true
        }
    ];

    const paymentSeed = [
        {
            amount: 1500,
            method: "CASH",
            paymentDate: "2025-12-10 00:00:00",
            referenceNo: null,
            invoiceId: "cmjcg0xrj000likf0czkrjx8y",
        },
        {
            amount: 3200,
            method: "CARD",
            paymentDate: "2025-12-12 00:00:00",
            referenceNo: "CARD-784512",
            invoiceId: "cmjcg0xrj000mikf0ci0bi78g",
        },
        {
            amount: 2000,
            method: "UPI",
            paymentDate: "2025-12-14 00:00:00",
            referenceNo: "UPI-998877",
            invoiceId: "cmjcg0xrj000nikf0wi70sau6",
        },
        {
            amount: 4500,
            method: "BANK_TRANSFER",
            paymentDate: "2025-12-15 00:00:00",
            referenceNo: "NEFT-556677",
            invoiceId: "cmjcg0xrj000oikf0zf0x9mws",
        },
        {
            amount: 1800,
            method: "CASH",
            paymentDate: "2025-12-16 00:00:00",
            referenceNo: null,
            invoiceId: "cmjcg0xrj000pikf0l4sy1i0f",
        },
        {
            amount: 2500,
            method: "CARD",
            paymentDate: "2025-12-17 00:00:00",
            referenceNo: "CARD-445566",
            invoiceId: "cmjcg0xrj000qikf07s8ykdjh",
        },
        {
            amount: 3900,
            method: "UPI",
            paymentDate: "2025-12-18 00:00:00",
            referenceNo: "UPI-223344",
            invoiceId: "cmjcg0xrj000rikf04mvkeh3l",
        },
        {
            amount: 1200,
            method: "CASH",
            paymentDate: "2025-12-19 00:00:00",
            referenceNo: null,
            invoiceId: "cmjcg0xrj000sikf0186ww3mw",
        },
        {
            amount: 5100,
            method: "BANK_TRANSFER",
            paymentDate: "2025-12-20 00:00:00",
            referenceNo: "RTGS-889900",
            invoiceId: "cmjcg0xrj000tikf0wfxz9jzu",
        },
        {
            amount: 2750,
            method: "CARD",
            paymentDate: "2025-12-21 00:00:00",
            referenceNo: "CARD-667788",
            invoiceId: "cmjcg0xrj000uikf04kggk6zj",
        },
    ];

    const invoicesSeed = [
        {
            sku: "INV-342-2025-1210",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-10 00:00:00",
            dueDate: "2025-12-16 00:00:00",
            subtotal: 3200,
            tax: 240,
            discount: 0,
            totalAmount: 3440,
            status: "PAID",
            notes: "General consultation",
        },
        {
            sku: "INV-342-2025-1211",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-11 00:00:00",
            dueDate: "2025-12-17 00:00:00",
            subtotal: 4500,
            tax: 300,
            discount: 200,
            totalAmount: 4600,
            status: "OVERDUE",
            notes: "Pharmacy billing",
        },
        {
            sku: "INV-342-2025-1212",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-12 00:00:00",
            dueDate: "2025-12-18 00:00:00",
            subtotal: 5100,
            tax: 400,
            discount: 500,
            totalAmount: 5000,
            status: "PENDING",
            notes: "Diagnostics",
        },
        {
            sku: "INV-342-2025-1213",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-13 00:00:00",
            dueDate: "2025-12-19 00:00:00",
            subtotal: 2800,
            tax: 200,
            discount: 0,
            totalAmount: 3000,
            status: "DRAFT",
            notes: "Neurology visit",
        },
        {
            sku: "INV-342-2025-1214",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-14 00:00:00",
            dueDate: "2025-12-20 00:00:00",
            subtotal: 6200,
            tax: 450,
            discount: 600,
            totalAmount: 6050,
            status: "OVERDUE",
            notes: "Surgery charges",
        },

        {
            sku: "INV-342-2025-1215",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-15 00:00:00",
            dueDate: "2025-12-21 00:00:00",
            subtotal: 1900,
            tax: 150,
            discount: 0,
            totalAmount: 2050,
            status: "PAID",
            notes: "Lab tests",
        },
        {
            sku: "INV-342-2025-1216",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-16 00:00:00",
            dueDate: "2025-12-22 00:00:00",
            subtotal: 4800,
            tax: 350,
            discount: 300,
            totalAmount: 4850,
            status: "OVERDUE",
            notes: "Orthopedics",
        },
        {
            sku: "INV-342-2025-1217",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-17 00:00:00",
            dueDate: "2025-12-23 00:00:00",
            subtotal: 3600,
            tax: 270,
            discount: 100,
            totalAmount: 3770,
            status: "PENDING",
            notes: "Physiotherapy",
        },
        {
            sku: "INV-342-2025-1218",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-18 00:00:00",
            dueDate: "2025-12-24 00:00:00",
            subtotal: 2600,
            tax: 200,
            discount: 0,
            totalAmount: 2800,
            status: "PAID",
            notes: "OPD consultation",
        },
        {
            sku: "INV-342-2025-1219",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-19 00:00:00",
            dueDate: "2025-12-25 00:00:00",
            subtotal: 5400,
            tax: 400,
            discount: 300,
            totalAmount: 5500,
            status: "OVERDUE",
            notes: "Emergency care",
        },

        {
            sku: "INV-342-2025-1220",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-20 00:00:00",
            dueDate: "2025-12-26 00:00:00",
            subtotal: 3100,
            tax: 230,
            discount: 0,
            totalAmount: 3330,
            status: "DRAFT",
            notes: "Radiology",
        },
        {
            sku: "INV-342-2025-1221",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-21 00:00:00",
            dueDate: "2025-12-27 00:00:00",
            subtotal: 4700,
            tax: 350,
            discount: 200,
            totalAmount: 4850,
            status: "PAID",
            notes: "ENT services",
        },
        {
            sku: "INV-342-2025-1222",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-22 00:00:00",
            dueDate: "2025-12-28 00:00:00",
            subtotal: 3900,
            tax: 300,
            discount: 150,
            totalAmount: 4050,
            status: "OVERDUE",
            notes: "Allergy tests",
        },
        {
            sku: "INV-342-2025-1223",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-23 00:00:00",
            dueDate: "2025-12-29 00:00:00",
            subtotal: 5200,
            tax: 400,
            discount: 400,
            totalAmount: 5200,
            status: "PENDING",
            notes: "Cardiology",
        },
        {
            sku: "INV-342-2025-1224",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-24 00:00:00",
            dueDate: "2025-12-30 00:00:00",
            subtotal: 6000,
            tax: 450,
            discount: 500,
            totalAmount: 5950,
            status: "OVERDUE",
            notes: "ICU services",
        },

        {
            sku: "INV-342-2025-1225",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-25 00:00:00",
            dueDate: "2025-12-31 00:00:00",
            subtotal: 2800,
            tax: 200,
            discount: 0,
            totalAmount: 3000,
            status: "PAID",
            notes: "Vaccination",
        },
        {
            sku: "INV-342-2025-1226",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-26 00:00:00",
            dueDate: "2026-01-01 00:00:00",
            subtotal: 4600,
            tax: 350,
            discount: 300,
            totalAmount: 4650,
            status: "OVERDUE",
            notes: "Dental care",
        },
        {
            sku: "INV-342-2025-1227",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-27 00:00:00",
            dueDate: "2026-01-02 00:00:00",
            subtotal: 3400,
            tax: 260,
            discount: 100,
            totalAmount: 3560,
            status: "DRAFT",
            notes: "Skin treatment",
        },
        {
            sku: "INV-342-2025-1228",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-28 00:00:00",
            dueDate: "2026-01-03 00:00:00",
            subtotal: 5100,
            tax: 400,
            discount: 300,
            totalAmount: 5200,
            status: "PAID",
            notes: "Urology",
        },
        {
            sku: "INV-342-2025-1229",
            patientId: "cmjcm3xu90059ikzknhi5fwis",
            issueDate: "2025-12-29 00:00:00",
            dueDate: "2026-01-04 00:00:00",
            subtotal: 4300,
            tax: 320,
            discount: 200,
            totalAmount: 4420,
            status: "OVERDUE",
            notes: "Follow-up visit",
        },
    ];




    return { users, userRoles, permissionSeed, roleSeed, categorySeed, inventorySeed, serviceSeed, paymentSeed, invoicesSeed }
}