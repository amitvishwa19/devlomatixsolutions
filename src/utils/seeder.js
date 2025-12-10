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

    return { users, userRoles, permissionSeed, roleSeed }
}