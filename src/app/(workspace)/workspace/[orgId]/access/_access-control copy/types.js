// Permission categories: dashboard, workflow, appointments, calendar, kanban, documents, articles, access_management
// Permission actions: view, create, edit, delete, manage, export, import
// Permission values follow the pattern: category.action (e.g., "dashboard.view")

// This file serves as documentation for the permission structure
// TypeScript types are not used in JSX, but you can reference these structures:

/*
Permission object from backend:
{
  id: string,
  value: string,        // e.g., "dashboard.view"
  title: string,
  description: string,
  status: boolean,
  category: string
}

Role object from backend:
{
  id: string,
  title: string,
  description: string,
  color: string,
  status: boolean,
  createdAt: string,
  updatedAt: string,
  permissions: Permission[]
}

User object from session:
{
  userId: string,
  name: string,
  email: string,
  image: string,
  avatar: string,
  displayName: string,
  role: string,
  roles: Role[]
}

Session object:
{
  user: User | null,
  expires: string
}
*/

export const PERMISSION_CATEGORIES = [
  "dashboard",
  "workflow",
  "appointments",
  "calendar",
  "kanban",
  "documents",
  "articles",
  "access_management"
];

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "manage",
  "export",
  "import"
];
