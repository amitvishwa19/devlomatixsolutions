// Document types
export interface Document {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "document";
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  patientId?: string;
  patientName?: string;
  status: "active" | "archived" | "pending";
  starred?: boolean;
}

export interface SharedDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "spreadsheet" | "document";
  sharedBy: {
    name: string;
    email: string;
  };
  sharedAt: string;
  permission: "view" | "edit" | "admin";
  category: string;
}

export interface SharedUser {
  id: string;
  email: string;
  name: string;
  permission: "view" | "edit" | "admin";
  sharedAt: string;
}

export interface UploadData {
  file: File | null;
  category: string;
  patientId: string;
  notes: string;
}