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



    return { users, userRoles, permissionSeed, roleSeed, categorySeed }
}