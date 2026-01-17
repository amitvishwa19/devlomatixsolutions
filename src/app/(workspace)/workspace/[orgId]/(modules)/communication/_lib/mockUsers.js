export const mockUsers = [
    {
        id: "1",
        name: "John Smith",
        email: "john.smith@example.com",
        role: "patient",
    },
    {
        id: "2",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@hospital.com",
        role: "doctor",
        department: "Cardiology",
    },
    {
        id: "3",
        name: "Mike Williams",
        email: "mike.williams@example.com",
        role: "patient",
    },
    {
        id: "4",
        name: "Dr. Emily Brown",
        email: "emily.brown@hospital.com",
        role: "doctor",
        department: "Neurology",
    },
    {
        id: "5",
        name: "Lisa Davis",
        email: "lisa.davis@example.com",
        role: "patient",
    },
    {
        id: "6",
        name: "James Wilson",
        email: "james.wilson@hospital.com",
        role: "staff",
        department: "Administration",
    },
    {
        id: "7",
        name: "Dr. Robert Taylor",
        email: "robert.taylor@hospital.com",
        role: "doctor",
        department: "Orthopedics",
    },
    {
        id: "8",
        name: "Amanda Martinez",
        email: "amanda.martinez@example.com",
        role: "patient",
    },
    {
        id: "9",
        name: "Jennifer Garcia",
        email: "jennifer.garcia@hospital.com",
        role: "staff",
        department: "Billing",
    },
    {
        id: "10",
        name: "Dr. Michael Lee",
        email: "michael.lee@hospital.com",
        role: "doctor",
        department: "Pediatrics",
    },
];

export const getUsersByRole = (role) => {
    if (!role) return mockUsers;
    return mockUsers.filter((user) => user.role === role);
};

export const searchUsers = (query) => {
    const lowerQuery = query.toLowerCase();
    return mockUsers.filter(
        (user) =>
            user.name.toLowerCase().includes(lowerQuery) ||
            user.email.toLowerCase().includes(lowerQuery)
    );
};
