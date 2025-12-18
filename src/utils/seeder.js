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
        { title: 'role-create', description: 'Create new management roles', status: true },
        { title: 'role-moderate', description: 'Moderate management roles and actions', status: true },
        { title: 'user-create', description: 'Create new user', status: true },
        { title: 'user-moderate', description: 'Moderate user actions', status: true },
        { title: 'user-view', description: 'View users ', status: true },
        { title: 'create-org', description: 'User can create new organization ', status: true },
        { title: 'delete-org', description: 'User can delete  organization ', status: true }
    ]

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
            name: "Emergency Services",
            slug: "emergency-services",
            icon: "siren",
            description: "Manage emergency admissions, triage, and urgent care workflows."
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


    return { users, userRoles, permissionSeed, roleSeed, categorySeed, inventorySeed }
}