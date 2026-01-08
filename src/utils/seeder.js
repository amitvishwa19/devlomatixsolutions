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

    const userSeed = Array.from({ length: 5 }, (_, i) => {
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
            role: 'USER',
            avaliable,
            online
        };
    });

    const patientSeed = Array.from({ length: 5 }, (_, i) => {
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
            role: 'PATIENT',
            avaliable,
            online
        };
    });

    const doctorSeed = Array.from({ length: 5 }, (_, i) => {
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
            role: 'DOCTOR',
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
        {
            title: 'super-admin',
            description: 'Full system access - controls all hospital operations and staff permissions',
            status: true
        },
        {
            title: 'hospital-admin',
            description: 'Manages hospital settings, staff, departments, and financial oversight',
            status: true
        },
        {
            title: 'doctor',
            description: 'Clinical access - patients, prescriptions, lab orders, appointments',
            status: true
        },
        {
            title: 'nurse',
            description: 'Patient care - vitals, medications, room assignments, basic records',
            status: true
        },
        {
            title: 'receptionist',
            description: 'Front desk - appointments, patient registration, basic info',
            status: true
        },
        {
            title: 'pharmacist',
            description: 'Pharmacy management - prescriptions, inventory, drug dispensing',
            status: true
        },
        {
            title: 'lab-technician',
            description: 'Laboratory operations - sample processing, test results, reports',
            status: true
        },
        {
            title: 'billing',
            description: 'Financial operations - invoices, payments, insurance claims',
            status: true
        },
        {
            title: 'inventory-manager',
            description: 'Medical supplies - stock management, procurement, expiry tracking',
            status: true
        },
        {
            title: 'it-admin',
            description: 'Technical support - system settings, credentials, integrations',
            status: true
        },
        {
            title: 'department-head',
            description: 'Department oversight - staff management, schedules, reports',
            status: true
        },
        {
            title: 'patient',
            description: 'Patient portal - view appointments, prescriptions, bills, results',
            status: true
        }
    ]

    const permissionSeed = [
        // Dashboard
        { value: "dashboard.view", title: "View Dashboard", description: "View dashboard data", status: true, category: "dashboard" },
        { value: "dashboard.create", title: "Create Dashboard", description: "Create dashboard items", status: true, category: "dashboard" },
        { value: "dashboard.edit", title: "Edit Dashboard", description: "Edit dashboard items", status: true, category: "dashboard" },
        { value: "dashboard.delete", title: "Delete Dashboard", description: "Delete dashboard items", status: true, category: "dashboard" },
        { value: "dashboard.manage", title: "Manage Dashboard", description: "Full control of dashboard", status: true, category: "dashboard" },
        { value: "dashboard.export", title: "Export Dashboard", description: "Export dashboard data", status: true, category: "dashboard" },
        { value: "dashboard.import", title: "Import Dashboard", description: "Import dashboard data", status: true, category: "dashboard" },

        // Workflow
        { value: "workflow.view", title: "View Workflow", description: "View workflows", status: true, category: "workflow" },
        { value: "workflow.create", title: "Create Workflow", description: "Create workflows", status: true, category: "workflow" },
        { value: "workflow.edit", title: "Edit Workflow", description: "Edit workflows", status: true, category: "workflow" },
        { value: "workflow.delete", title: "Delete Workflow", description: "Delete workflows", status: true, category: "workflow" },
        { value: "workflow.manage", title: "Manage Workflow", description: "Manage workflows", status: true, category: "workflow" },
        { value: "workflow.export", title: "Export Workflow", description: "Export workflows", status: true, category: "workflow" },
        { value: "workflow.import", title: "Import Workflow", description: "Import workflows", status: true, category: "workflow" },

        // Appointments
        { value: "appointments.view", title: "View Appointments", description: "View appointments", status: true, category: "appointments" },
        { value: "appointments.create", title: "Create Appointment", description: "Create appointments", status: true, category: "appointments" },
        { value: "appointments.edit", title: "Edit Appointment", description: "Edit appointments", status: true, category: "appointments" },
        { value: "appointments.delete", title: "Delete Appointment", description: "Delete appointments", status: true, category: "appointments" },
        { value: "appointments.manage", title: "Manage Appointments", description: "Manage appointments", status: true, category: "appointments" },
        { value: "appointments.export", title: "Export Appointments", description: "Export appointments", status: true, category: "appointments" },
        { value: "appointments.import", title: "Import Appointments", description: "Import appointments", status: true, category: "appointments" },

        // Calendar
        { value: "calendar.view", title: "View Calendar", description: "View calendar", status: true, category: "calendar" },
        { value: "calendar.create", title: "Create Calendar Event", description: "Create calendar events", status: true, category: "calendar" },
        { value: "calendar.edit", title: "Edit Calendar Event", description: "Edit calendar events", status: true, category: "calendar" },
        { value: "calendar.delete", title: "Delete Calendar Event", description: "Delete calendar events", status: true, category: "calendar" },
        { value: "calendar.manage", title: "Manage Calendar", description: "Manage calendar", status: true, category: "calendar" },
        { value: "calendar.export", title: "Export Calendar", description: "Export calendar data", status: true, category: "calendar" },
        { value: "calendar.import", title: "Import Calendar", description: "Import calendar data", status: true, category: "calendar" },

        // Kanban
        { value: "kanban.view", title: "View Kanban", description: "View kanban boards", status: true, category: "kanban" },
        { value: "kanban.create", title: "Create Kanban Item", description: "Create kanban items", status: true, category: "kanban" },
        { value: "kanban.edit", title: "Edit Kanban Item", description: "Edit kanban items", status: true, category: "kanban" },
        { value: "kanban.delete", title: "Delete Kanban Item", description: "Delete kanban items", status: true, category: "kanban" },
        { value: "kanban.manage", title: "Manage Kanban", description: "Manage kanban boards", status: true, category: "kanban" },
        { value: "kanban.export", title: "Export Kanban", description: "Export kanban data", status: true, category: "kanban" },
        { value: "kanban.import", title: "Import Kanban", description: "Import kanban data", status: true, category: "kanban" },

        // Documents
        { value: "documents.view", title: "View Documents", description: "View documents", status: true, category: "documents" },
        { value: "documents.create", title: "Create Document", description: "Create documents", status: true, category: "documents" },
        { value: "documents.edit", title: "Edit Document", description: "Edit documents", status: true, category: "documents" },
        { value: "documents.delete", title: "Delete Document", description: "Delete documents", status: true, category: "documents" },
        { value: "documents.manage", title: "Manage Documents", description: "Manage documents", status: true, category: "documents" },
        { value: "documents.export", title: "Export Documents", description: "Export documents", status: true, category: "documents" },
        { value: "documents.import", title: "Import Documents", description: "Import documents", status: true, category: "documents" },

        // Articles
        { value: "articles.view", title: "View Articles", description: "View articles", status: true, category: "articles" },
        { value: "articles.create", title: "Create Article", description: "Create articles", status: true, category: "articles" },
        { value: "articles.edit", title: "Edit Article", description: "Edit articles", status: true, category: "articles" },
        { value: "articles.delete", title: "Delete Article", description: "Delete articles", status: true, category: "articles" },
        { value: "articles.manage", title: "Manage Articles", description: "Manage articles", status: true, category: "articles" },
        { value: "articles.export", title: "Export Articles", description: "Export articles", status: true, category: "articles" },
        { value: "articles.import", title: "Import Articles", description: "Import articles", status: true, category: "articles" },

        // Access Management
        { value: "access_management.view", title: "View Access Management", description: "View roles & permissions", status: true, category: "access_management" },
        { value: "access_management.create", title: "Create Role", description: "Create roles", status: true, category: "access_management" },
        { value: "access_management.edit", title: "Edit Role", description: "Edit roles", status: true, category: "access_management" },
        { value: "access_management.delete", title: "Delete Role", description: "Delete roles", status: true, category: "access_management" },
        { value: "access_management.manage", title: "Manage Access", description: "Manage access control", status: true, category: "access_management" },
        { value: "access_management.export", title: "Export Access Data", description: "Export roles & permissions", status: true, category: "access_management" },
        { value: "access_management.import", title: "Import Access Data", description: "Import roles & permissions", status: true, category: "access_management" },
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


    // prisma/seed.js - FULL HMS Departments (42 total)
    const departmentSeed = [
        // =============================================================================
        // CLINICAL DEPARTMENTS (17)
        // =============================================================================
        {
            value: "emergency", name: "Emergency (ER)", code: "ER", category: "Clinical", image: "🚨", icon: "sirens", color: "#ef4444",
            description: "24/7 Emergency & Trauma Care", headDoctorId: null, floorNumber: 1, roomCount: 12, bedCount: 25, isActive: true
        },
        {
            value: "cardiology", name: "Cardiology", code: "CAR", category: "Clinical", image: "❤️", icon: "heart", color: "#dc2626",
            description: "Heart & Vascular Conditions", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 20, isActive: true
        },
        {
            value: "neurology", name: "Neurology", code: "NEU", category: "Clinical", image: "🧠", icon: "brain", color: "#8b5cf6",
            description: "Brain, Spine & Nervous System", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 18, isActive: true
        },
        {
            value: "pediatrics", name: "Pediatrics", code: "PED", category: "Clinical", image: "👶", icon: "baby", color: "#06b6d4",
            description: "Child & Adolescent Care", headDoctorId: null, floorNumber: 2, roomCount: 15, bedCount: 30, isActive: true
        },
        {
            value: "orthopedics", name: "Orthopedics", code: "ORT", category: "Clinical", image: "🦴", icon: "activity", color: "#10b981",
            description: "Bone, Joint & Musculoskeletal", headDoctorId: null, floorNumber: 3, roomCount: 12, bedCount: 22, isActive: true
        },
        {
            value: "oncology", name: "Oncology", code: "ONC", category: "Clinical", image: "🎗️", icon: "zap", color: "#7c3aed",
            description: "Cancer Treatment & Chemotherapy", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 15, isActive: true
        },
        {
            value: "dermatology", name: "Dermatology", code: "DER", category: "Clinical", image: "🩹", icon: "sun", color: "#ec4899",
            description: "Skin, Hair & Nail Conditions", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 12, isActive: true
        },
        {
            value: "gastroenterology", name: "Gastroenterology", code: "GAS", category: "Clinical", image: "🫁", icon: "stomach", color: "#f97316",
            description: "Digestive System Disorders", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 16, isActive: true
        },
        {
            value: "nephrology", name: "Nephrology", code: "NEP", category: "Clinical", image: "🫘", icon: "droplets", color: "#3b82f6",
            description: "Kidney Disease & Dialysis", headDoctorId: null, floorNumber: 4, roomCount: 8, bedCount: 14, isActive: true
        },
        {
            value: "pulmonology", name: "Pulmonology", code: "PUL", category: "Clinical", image: "🌬️", icon: "lungs", color: "#14b8a6",
            description: "Lung & Respiratory Care", headDoctorId: null, floorNumber: 4, roomCount: 10, bedCount: 18, isActive: true
        },
        {
            value: "endocrinology", name: "Endocrinology", code: "END", category: "Clinical", image: "⚗️", icon: "beaker", color: "#f59e0b",
            description: "Hormone & Endocrine Disorders", headDoctorId: null, floorNumber: 4, roomCount: 6, bedCount: 12, isActive: true
        },
        {
            value: "rheumatology", name: "Rheumatology", code: "RHE", category: "Clinical", image: "💪", icon: "zap", color: "#84cc16",
            description: "Autoimmune & Joint Diseases", headDoctorId: null, floorNumber: 4, roomCount: 6, bedCount: 10, isActive: true
        },
        {
            value: "urology", name: "Urology", code: "URO", category: "Clinical", image: "🔬", icon: "microwave", color: "#a855f7",
            description: "Kidney, Bladder & Prostate", headDoctorId: null, floorNumber: 4, roomCount: 8, bedCount: 14, isActive: true
        },
        {
            value: "ophthalmology", name: "Ophthalmology", code: "OFT", category: "Clinical", image: "👁️", icon: "eye", color: "#ef4444",
            description: "Eye Care & Vision Services", headDoctorId: null, floorNumber: 3, roomCount: 6, bedCount: 10, isActive: true
        },
        {
            value: "ent", name: "ENT (Otolaryngology)", code: "ENT", category: "Clinical", image: "👂", icon: "ear", color: "#06b6d4",
            description: "Ear, Nose & Throat", headDoctorId: null, floorNumber: 3, roomCount: 8, bedCount: 14, isActive: true
        },
        {
            value: "psychiatry", name: "Psychiatry", code: "PSY", category: "Clinical", image: "🧘", icon: "headphones", color: "#8b5cf6",
            description: "Mental Health & Counseling", headDoctorId: null, floorNumber: 2, roomCount: 6, bedCount: 12, isActive: true
        },
        {
            value: "obstetrics", name: "Obstetrics & Gynecology", code: "OBS", category: "Clinical", image: "🤰", icon: "baby-carriage", color: "#ec4899",
            description: "Women's Health & Maternity", headDoctorId: null, floorNumber: 2, roomCount: 10, bedCount: 20, isActive: true
        },
        {
            value: "geriatrics", name: "Geriatrics", code: "GER", category: "Clinical", image: "👴", icon: "user", color: "#6b7280",
            description: "Elderly Care & Management", headDoctorId: null, floorNumber: 2, roomCount: 10, bedCount: 20, isActive: true
        },

        // =============================================================================
        // SURGICAL DEPARTMENTS (6)
        // =============================================================================
        {
            value: "general-surgery", name: "General Surgery", code: "GEN", category: "Surgical", image: "🔪", icon: "scissors", color: "#10b981",
            description: "General Surgical Procedures", headDoctorId: null, floorNumber: 5, roomCount: 6, bedCount: 12, isActive: true
        },
        {
            value: "cardiac-surgery", name: "Cardiac Surgery", code: "CAR", category: "Surgical", image: "💓", icon: "heart-pulse", color: "#dc2626",
            description: "Heart Surgery & Procedures", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
        },
        {
            value: "neuro-surgery", name: "Neurosurgery", code: "NEU", category: "Surgical", image: "🧬", icon: "brain-circuit", color: "#8b5cf6",
            description: "Brain & Spine Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
        },
        {
            value: "plastic-surgery", name: "Plastic Surgery", code: "PLA", category: "Surgical", image: "✨", icon: "wand-2", color: "#f59e0b",
            description: "Reconstructive & Cosmetic Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
        },
        {
            value: "vascular-surgery", name: "Vascular Surgery", code: "VAS", category: "Surgical", image: "🩸", icon: "droplets", color: "#ef4444",
            description: "Vascular & Circulatory Surgery", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
        },
        {
            value: "transplant", name: "Transplant Surgery", code: "TRA", category: "Surgical", image: "🫀", icon: "heart", color: "#7c3aed",
            description: "Organ Transplant Procedures", headDoctorId: null, floorNumber: 5, roomCount: 4, bedCount: 8, isActive: true
        },

        // =============================================================================
        // CRITICAL CARE DEPARTMENTS (5)
        // =============================================================================
        {
            value: "icu", name: "ICU (Intensive Care)", code: "ICU", category: "Critical Care", image: "🏥", icon: "monitor", color: "#dc2626",
            description: "Intensive Care Unit for Critical Patients", headDoctorId: null, floorNumber: 1, roomCount: 6, bedCount: 12, isActive: true
        },
        {
            value: "nicu", name: "NICU (Neonatal ICU)", code: "NICU", category: "Critical Care", image: "👼", icon: "baby", color: "#06b6d4",
            description: "Neonatal Intensive Care Unit", headDoctorId: null, floorNumber: 2, roomCount: 4, bedCount: 8, isActive: true
        },
        {
            value: "picu", name: "PICU (Pediatric ICU)", code: "PICU", category: "Critical Care", image: "🧒", icon: "users", color: "#f97316",
            description: "Pediatric Intensive Care Unit", headDoctorId: null, floorNumber: 2, roomCount: 4, bedCount: 8, isActive: true
        },
        {
            value: "ccu", name: "CCU (Coronary Care)", code: "CCU", category: "Critical Care", image: "💗", icon: "heart", color: "#ec4899",
            description: "Coronary Care Unit", headDoctorId: null, floorNumber: 1, roomCount: 4, bedCount: 8, isActive: true
        },
        {
            value: "burn-unit", name: "Burn Unit", code: "BUR", category: "Critical Care", image: "🔥", icon: "flame", color: "#f59e0b",
            description: "Burn Treatment & Care", headDoctorId: null, floorNumber: 1, roomCount: 4, bedCount: 8, isActive: true
        },

        // =============================================================================
        // DIAGNOSTIC DEPARTMENTS (4)
        // =============================================================================
        {
            value: "radiology", name: "Radiology", code: "RAD", category: "Diagnostic", image: "📷", icon: "camera", color: "#3b82f6",
            description: "X-ray, CT, MRI & Imaging Services", headDoctorId: null, floorNumber: 0, roomCount: 8, bedCount: 0, isActive: true
        },
        {
            value: "pathology", name: "Pathology", code: "PAT", category: "Diagnostic", image: "🔬", icon: "microscope", color: "#14b8a6",
            description: "Laboratory & Tissue Analysis", headDoctorId: null, floorNumber: 0, roomCount: 6, bedCount: 0, isActive: true
        },
        {
            value: "laboratory", name: "Laboratory", code: "LAB", category: "Diagnostic", image: "🧪", icon: "test-tube", color: "#10b981",
            description: "Pathology & Diagnostic Testing", headDoctorId: null, floorNumber: 0, roomCount: 5, bedCount: 0, isActive: true
        },
        {
            value: "nuclear-medicine", name: "Nuclear Medicine", code: "NUC", category: "Diagnostic", image: "☢️", icon: "radio", color: "#f97316",
            description: "Nuclear Imaging & Therapy", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },

        // =============================================================================
        // SUPPORT DEPARTMENTS (8)
        // =============================================================================
        {
            value: "pharmacy", name: "Pharmacy", code: "PHM", category: "Support", image: "💊", icon: "pill", color: "#8b5cf6",
            description: "Medication Dispensing & Management", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
        },
        {
            value: "physical-therapy", name: "Physical Therapy", code: "PHY", category: "Support", image: "🏃", icon: "dumbbell", color: "#10b981",
            description: "Physical Rehabilitation & Therapy", headDoctorId: null, floorNumber: 0, roomCount: 6, bedCount: 0, isActive: true
        },
        {
            value: "occupational-therapy", name: "Occupational Therapy", code: "OCC", category: "Support", image: "🎯", icon: "target", color: "#f59e0b",
            description: "Occupational Rehabilitation", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },
        {
            value: "speech-therapy", name: "Speech Therapy", code: "SPE", category: "Support", image: "🗣️", icon: "volume", color: "#ec4899",
            description: "Speech & Language Therapy", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },
        {
            value: "nutrition", name: "Nutrition & Dietetics", code: "NUT", category: "Support", image: "🥗", icon: "apple", color: "#84cc16",
            description: "Nutrition & Diet Planning", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },
        {
            value: "social-work", name: "Social Work", code: "SOC", category: "Support", image: "🤝", icon: "users", color: "#6b7280",
            description: "Patient Advocacy & Counseling", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },
        {
            value: "blood-bank", name: "Blood Bank", code: "BLD", category: "Support", image: "🩸", icon: "droplets", color: "#ef4444",
            description: "Blood Storage & Transfusion", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },
        {
            value: "dialysis", name: "Dialysis Center", code: "DIA", category: "Support", image: "💉", icon: "syringe", color: "#3b82f6",
            description: "Dialysis Treatment Services", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },

        // =============================================================================
        // ADMINISTRATIVE DEPARTMENTS (6)
        // =============================================================================
        {
            value: "admissions", name: "Admissions", code: "ADM", category: "Administrative", image: "📝", icon: "clipboard-list", color: "#06b6d4",
            description: "Patient Registration & Admissions", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },
        {
            value: "billing", name: "Billing & Insurance", code: "BIL", category: "Administrative", image: "💳", icon: "credit-card", color: "#f97316",
            description: "Financial Operations & Claims", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
        },
        {
            value: "medical-records", name: "Medical Records", code: "REC", category: "Administrative", image: "📁", icon: "folder", color: "#6b7280",
            description: "Patient Records & Documentation", headDoctorId: null, floorNumber: 0, roomCount: 4, bedCount: 0, isActive: true
        },
        {
            value: "hr", name: "Human Resources", code: "HR", category: "Administrative", image: "👥", icon: "users", color: "#8b5cf6",
            description: "Staff Management & Recruitment", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
        },
        {
            value: "quality", name: "Quality Assurance", code: "QUA", category: "Administrative", image: "✅", icon: "check-circle", color: "#10b981",
            description: "Quality Control & Accreditation", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
        },
        {
            value: "infection-control", name: "Infection Control", code: "INF", category: "Administrative", image: "🦠", icon: "shield", color: "#ef4444",
            description: "Infection Prevention & Control", headDoctorId: null, floorNumber: 0, roomCount: 3, bedCount: 0, isActive: true
        }
    ];







    return { users, userSeed, patientSeed, doctorSeed, userRoles, permissionSeed, roleSeed, categorySeed, inventorySeed, serviceSeed, paymentSeed, invoicesSeed, departmentSeed }
}