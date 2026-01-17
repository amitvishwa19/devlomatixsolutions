// Mock data for documents with Indian names
export const mockDocuments = [
  {
    id: "1",
    name: "Annual Health Report 2024.pdf",
    type: "pdf",
    category: "Medical Records",
    size: "2.4 MB",
    uploadedBy: "Dr. Anil Kapoor",
    uploadedAt: "Dec 28, 2024",
    patientId: "P-001",
    patientName: "Rohit Sharma",
    status: "active",
    starred: true,
  },
  {
    id: "2",
    name: "Blood Test Results.pdf",
    type: "pdf",
    category: "Lab Reports",
    size: "1.2 MB",
    uploadedBy: "Meera Desai",
    uploadedAt: "Dec 27, 2024",
    patientId: "P-002",
    patientName: "Pooja Hegde",
    status: "active",
    starred: false,
  },
  {
    id: "3",
    name: "Chest X-Ray Scan.jpg",
    type: "image",
    category: "Imaging",
    size: "4.8 MB",
    uploadedBy: "Dr. Suresh Menon",
    uploadedAt: "Dec 26, 2024",
    patientId: "P-003",
    patientName: "Karan Johar",
    status: "active",
    starred: true,
  },
  {
    id: "4",
    name: "Prescription_Antibiotics.pdf",
    type: "pdf",
    category: "Prescriptions",
    size: "156 KB",
    uploadedBy: "Dr. Nandini Iyer",
    uploadedAt: "Dec 25, 2024",
    patientId: "P-001",
    patientName: "Rohit Sharma",
    status: "active",
    starred: false,
  },
  {
    id: "5",
    name: "Surgery Consent Form.pdf",
    type: "pdf",
    category: "Consent Forms",
    size: "890 KB",
    uploadedBy: "Rekha Krishnan",
    uploadedAt: "Dec 24, 2024",
    patientId: "P-004",
    patientName: "Deepika Padukone",
    status: "pending",
    starred: false,
  },
  {
    id: "6",
    name: "MRI Brain Scan.jpg",
    type: "image",
    category: "Imaging",
    size: "12.5 MB",
    uploadedBy: "Dr. Ramesh Nair",
    uploadedAt: "Dec 23, 2024",
    patientId: "P-005",
    patientName: "Varun Dhawan",
    status: "active",
    starred: false,
  },
  {
    id: "7",
    name: "Insurance Claim Form.xlsx",
    type: "spreadsheet",
    category: "Administrative",
    size: "245 KB",
    uploadedBy: "Lakshmi Venkatesh",
    uploadedAt: "Dec 22, 2024",
    status: "archived",
    starred: false,
  },
  {
    id: "8",
    name: "Pathology Report.pdf",
    type: "pdf",
    category: "Lab Reports",
    size: "1.8 MB",
    uploadedBy: "Kavitha Rajan",
    uploadedAt: "Dec 21, 2024",
    patientId: "P-006",
    patientName: "Alia Bhatt",
    status: "active",
    starred: false,
  },
  {
    id: "9",
    name: "Vaccination Record.docx",
    type: "document",
    category: "Medical Records",
    size: "420 KB",
    uploadedBy: "Nurse Anitha",
    uploadedAt: "Dec 20, 2024",
    patientId: "P-007",
    patientName: "Ranveer Singh",
    status: "active",
    starred: false,
  },
];

// Mock shared documents with Indian names
export const mockSharedDocuments = [
  {
    id: "s1",
    name: "Patient Case Study - Cardiology.pdf",
    type: "pdf",
    sharedBy: { name: "Dr. Anil Kapoor", email: "anil.kapoor@medicare.in" },
    sharedAt: "2 hours ago",
    permission: "view",
    category: "Medical Records",
  },
  {
    id: "s2",
    name: "Research Protocol 2024.docx",
    type: "document",
    sharedBy: { name: "Dr. Ramesh Nair", email: "ramesh.nair@medicare.in" },
    sharedAt: "Yesterday",
    permission: "edit",
    category: "Administrative",
  },
  {
    id: "s3",
    name: "Lab Results Summary.xlsx",
    type: "spreadsheet",
    sharedBy: { name: "Kavitha Rajan", email: "kavitha.rajan@medicare.in" },
    sharedAt: "3 days ago",
    permission: "admin",
    category: "Lab Reports",
  },
];

// Mock sharing data per document with Indian names
export const initialDocumentShares = {
  "1": [
    { id: "u1", email: "ramesh.nair@medicare.in", name: "Dr. Ramesh Nair", permission: "edit", sharedAt: "Dec 27, 2024" },
    { id: "u2", email: "anitha.nurse@medicare.in", name: "Nurse Anitha", permission: "view", sharedAt: "Dec 26, 2024" },
  ],
  "2": [
    { id: "u3", email: "nandini.iyer@medicare.in", name: "Dr. Nandini Iyer", permission: "admin", sharedAt: "Dec 25, 2024" },
  ],
};

// Filter documents based on criteria
export function filterDocuments(documents, options) {
  let result = [...documents];
  const { searchQuery, categoryFilter, statusFilter, showStarredOnly, sortBy } = options;

  if (showStarredOnly) {
    result = result.filter((doc) => doc.starred);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query) ||
        doc.patientName?.toLowerCase().includes(query) ||
        doc.category.toLowerCase().includes(query)
    );
  }

  if (categoryFilter && categoryFilter !== "all") {
    result = result.filter(
      (doc) => doc.category.toLowerCase().replace(/\s+/g, "-") === categoryFilter
    );
  }

  if (statusFilter && statusFilter !== "all") {
    result = result.filter((doc) => doc.status === statusFilter);
  }

  result.sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case "date-desc":
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });

  return result;
}

// Create a new document from upload data
export function createDocumentFromUpload(data) {
  const { file, category, patientId } = data;
  
  const getDocType = (name) => {
    if (name.endsWith(".pdf")) return "pdf";
    if (name.match(/\.(jpg|jpeg|png|gif)$/i)) return "image";
    if (name.match(/\.(xls|xlsx)$/i)) return "spreadsheet";
    return "document";
  };

  return {
    id: `doc-${Date.now()}`,
    name: file.name,
    type: getDocType(file.name),
    category: category.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    uploadedBy: "Current User",
    uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    patientId: patientId || undefined,
    status: "active",
    starred: false,
  };
}
