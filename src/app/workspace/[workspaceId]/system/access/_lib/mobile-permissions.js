/**
 * Mobile Permissions Registry mirroring devlomatix-expo/src/utils/access.js
 */

export const MOBILE_CATEGORIES = [
  { id: 'all', label: 'All Modules', countKey: 'all', color: 'bg-muted text-foreground' },
  { id: 'crm', label: 'DevX CRM', countKey: 'crm', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { id: 'konnectx', label: 'KonnectX', countKey: 'konnectx', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { id: 'hireflow', label: 'HireFlow', countKey: 'hireflow', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  { id: 'crystalaura', label: 'CrystalAura', countKey: 'crystalaura', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { id: 'curexa', label: 'Curexa', countKey: 'curexa', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  { id: 'solarbright', label: 'SolarBright', countKey: 'solarbright', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { id: 'kabadx', label: 'KabadX', countKey: 'kabadx', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  { id: 'access-management', label: 'Access Mgmt', countKey: 'access-management', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  { id: 'bridges', label: 'Bridges & System', countKey: 'bridges', color: 'bg-sky-500/10 text-sky-600 border-sky-500/20' },
];

export const MOBILE_PERMISSIONS = [
  // GLOBAL
  { group: 'GLOBAL', key: 'ADMIN_PANEL', value: 'navbar:System:Parent', title: 'Access System Panel', category: 'bridges', type: 'NAVIGATION', description: 'Access to the Admin / System panel' },
  { group: 'GLOBAL', key: 'SHARED_PREF', value: 'system:sharedpref', title: 'Shared Preferences', category: 'bridges', type: 'ACTION', description: 'View and manage shared preferences (Super Admin only)' },

  // CRM
  { group: 'CRM', key: 'MODULE', value: 'navbar:DevX(CRM):Parent', title: 'CRM Module Access', category: 'crm', type: 'NAVIGATION', description: 'Access to DevX CRM module' },
  { group: 'CRM', key: 'MODULE_ALT', value: 'navbar:crm:Parent', title: 'CRM Module Access (Alt)', category: 'crm', type: 'NAVIGATION', description: 'Alternate CRM module route identifier' },
  { group: 'CRM', key: 'DASHBOARD', value: 'navbar:DevX(CRM):Dashboard', title: 'CRM Dashboard', category: 'crm', type: 'NAVIGATION', description: 'View CRM Dashboard' },
  { group: 'CRM', key: 'PIPELINE_VIEW', value: 'navbar:DevX(CRM):PipelinesDeals', title: 'CRM Pipelines & Deals', category: 'crm', type: 'NAVIGATION', description: 'View Pipelines & Deals page' },
  { group: 'CRM', key: 'DEALS_VIEW', value: 'read:deal', title: 'View Deals', category: 'crm', type: 'ACTION', description: 'Read deal records' },
  { group: 'CRM', key: 'DEALS_CREATE', value: 'create:deal', title: 'Create Deals', category: 'crm', type: 'ACTION', description: 'Create new deals' },
  { group: 'CRM', key: 'DEALS_EDIT', value: 'update:deal', title: 'Edit Deals', category: 'crm', type: 'ACTION', description: 'Edit existing deal records' },
  { group: 'CRM', key: 'DEALS_DELETE', value: 'delete:deal', title: 'Delete Deals', category: 'crm', type: 'ACTION', description: 'Delete deal records' },
  { group: 'CRM', key: 'CONTACTS_VIEW', value: 'read:contact', title: 'View Contacts', category: 'crm', type: 'ACTION', description: 'Read contact records' },
  { group: 'CRM', key: 'CONTACTS_CREATE', value: 'create:contact', title: 'Create Contacts', category: 'crm', type: 'ACTION', description: 'Create new contacts' },
  { group: 'CRM', key: 'CONTACTS_EDIT', value: 'update:contact', title: 'Edit Contacts', category: 'crm', type: 'ACTION', description: 'Edit existing contacts' },
  { group: 'CRM', key: 'CONTACTS_DELETE', value: 'delete:contact', title: 'Delete Contacts', category: 'crm', type: 'ACTION', description: 'Delete contact records' },
  { group: 'CRM', key: 'DCR_VIEW', value: 'read:dcr', title: 'View Daily Call Records', category: 'crm', type: 'ACTION', description: 'Read DCR entries' },
  { group: 'CRM', key: 'DCR_CREATE', value: 'create:dcr', title: 'Create Call Records', category: 'crm', type: 'ACTION', description: 'Log new daily call records' },
  { group: 'CRM', key: 'DCR_EDIT', value: 'update:dcr', title: 'Edit Call Records', category: 'crm', type: 'ACTION', description: 'Edit DCR entries' },
  { group: 'CRM', key: 'DCR_DELETE', value: 'delete:dcr', title: 'Delete Call Records', category: 'crm', type: 'ACTION', description: 'Delete DCR entries' },
  { group: 'CRM', key: 'MAILBOX_VIEW', value: 'read:mailbox', title: 'View Mailbox', category: 'crm', type: 'ACTION', description: 'Read mailbox messages' },
  { group: 'CRM', key: 'MAILBOX_SEND', value: 'create:mailbox', title: 'Send Emails', category: 'crm', type: 'ACTION', description: 'Send emails via mailbox' },
  { group: 'CRM', key: 'MAILBOX_DELETE', value: 'delete:mailbox', title: 'Delete Emails', category: 'crm', type: 'ACTION', description: 'Delete mailbox messages' },
  { group: 'CRM', key: 'CHAT_VIEW', value: 'read:chat', title: 'View CRM Chats', category: 'crm', type: 'ACTION', description: 'Read CRM chat conversations' },
  { group: 'CRM', key: 'CALLS_EXECUTE', value: 'create:call', title: 'Make Calls', category: 'crm', type: 'ACTION', description: 'Execute calls from CRM' },
  { group: 'CRM', key: 'COPILOT', value: 'read:copilot', title: 'Use AI Copilot', category: 'crm', type: 'ACTION', description: 'Access AI Copilot assistant' },
  { group: 'CRM', key: 'QUOTATIONS_VIEW', value: 'read:quotation', title: 'View Quotations', category: 'crm', type: 'ACTION', description: 'View quotation records' },
  { group: 'CRM', key: 'QUOTATIONS_CREATE', value: 'create:quotation', title: 'Create Quotations', category: 'crm', type: 'ACTION', description: 'Create new quotations' },
  { group: 'CRM', key: 'QUOTATIONS_DELETE', value: 'delete:quotation', title: 'Delete Quotations', category: 'crm', type: 'ACTION', description: 'Delete quotation records' },
  { group: 'CRM', key: 'TASKS_VIEW', value: 'read:task', title: 'View Tasks', category: 'crm', type: 'ACTION', description: 'Read task records' },
  { group: 'CRM', key: 'TASKS_CREATE', value: 'create:task', title: 'Create Tasks', category: 'crm', type: 'ACTION', description: 'Create new tasks' },
  { group: 'CRM', key: 'TASKS_EDIT', value: 'update:task', title: 'Edit Tasks', category: 'crm', type: 'ACTION', description: 'Edit task records' },
  { group: 'CRM', key: 'TASKS_DELETE', value: 'delete:task', title: 'Delete Tasks', category: 'crm', type: 'ACTION', description: 'Delete task records' },
  { group: 'CRM', key: 'ANALYTICS', value: 'read:crm-analytics', title: 'View CRM Analytics', category: 'crm', type: 'ACTION', description: 'View CRM analytics dashboard' },
  { group: 'CRM', key: 'SETTINGS', value: 'manage:crm-settings', title: 'Manage CRM Settings', category: 'crm', type: 'ACTION', description: 'Manage CRM module settings' },

  // KONNECTX
  { group: 'KONNECTX', key: 'MODULE', value: 'navbar:KonnectX:Parent', title: 'KonnectX Module Access', category: 'konnectx', type: 'NAVIGATION', description: 'Access to KonnectX WhatsApp Cloud API module' },
  { group: 'KONNECTX', key: 'CHATS_VIEW', value: 'read:konnectx-chats', title: 'View Chats', category: 'konnectx', type: 'ACTION', description: 'Read WhatsApp chat conversations' },
  { group: 'KONNECTX', key: 'CHATS_SEND', value: 'create:konnectx-chats', title: 'Send Messages', category: 'konnectx', type: 'ACTION', description: 'Send WhatsApp messages' },
  { group: 'KONNECTX', key: 'CONTACTS_VIEW', value: 'read:konnectx-contacts', title: 'View KonnectX Contacts', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp contacts' },
  { group: 'KONNECTX', key: 'CONTACTS_MANAGE', value: 'manage:konnectx-contacts', title: 'Manage KonnectX Contacts', category: 'konnectx', type: 'ACTION', description: 'Create, edit and delete WhatsApp contacts' },
  { group: 'KONNECTX', key: 'CAMPAIGNS_VIEW', value: 'read:campaign', title: 'View Campaigns', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp campaigns' },
  { group: 'KONNECTX', key: 'CAMPAIGNS_CREATE', value: 'create:campaign', title: 'Create Campaigns', category: 'konnectx', type: 'ACTION', description: 'Create new broadcast campaigns' },
  { group: 'KONNECTX', key: 'CAMPAIGNS_EDIT', value: 'update:campaign', title: 'Edit Campaigns', category: 'konnectx', type: 'ACTION', description: 'Edit campaigns' },
  { group: 'KONNECTX', key: 'CAMPAIGNS_DELETE', value: 'delete:campaign', title: 'Delete Campaigns', category: 'konnectx', type: 'ACTION', description: 'Delete campaigns' },
  { group: 'KONNECTX', key: 'TEMPLATES_VIEW', value: 'read:template', title: 'View Templates', category: 'konnectx', type: 'ACTION', description: 'View message templates' },
  { group: 'KONNECTX', key: 'TEMPLATES_CREATE', value: 'create:template', title: 'Create Templates', category: 'konnectx', type: 'ACTION', description: 'Create message templates' },
  { group: 'KONNECTX', key: 'TEMPLATES_DELETE', value: 'delete:template', title: 'Delete Templates', category: 'konnectx', type: 'ACTION', description: 'Delete message templates' },
  { group: 'KONNECTX', key: 'FLOWS_VIEW', value: 'read:flow', title: 'View Flows', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp automation flows' },
  { group: 'KONNECTX', key: 'FLOWS_MANAGE', value: 'manage:flow', title: 'Manage Flows', category: 'konnectx', type: 'ACTION', description: 'Create and edit automation flows' },
  { group: 'KONNECTX', key: 'CHATBOT_VIEW', value: 'read:chatbot', title: 'View Chatbots', category: 'konnectx', type: 'ACTION', description: 'View chatbot configurations' },
  { group: 'KONNECTX', key: 'CHATBOT_MANAGE', value: 'manage:chatbot', title: 'Manage Chatbots', category: 'konnectx', type: 'ACTION', description: 'Create and configure chatbots' },
  { group: 'KONNECTX', key: 'CATALOG_VIEW', value: 'read:catalog', title: 'View Catalog', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp product catalog' },
  { group: 'KONNECTX', key: 'CATALOG_MANAGE', value: 'manage:catalog', title: 'Manage Catalog', category: 'konnectx', type: 'ACTION', description: 'Manage WhatsApp product catalog' },
  { group: 'KONNECTX', key: 'REPORTS', value: 'read:konnectx-reports', title: 'View KonnectX Reports', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp analytics reports' },
  { group: 'KONNECTX', key: 'ANALYTICS', value: 'read:konnectx-analytics', title: 'View KonnectX Analytics', category: 'konnectx', type: 'ACTION', description: 'View KonnectX analytics dashboard' },
  { group: 'KONNECTX', key: 'SYSTEM', value: 'manage:konnectx-system', title: 'Manage KonnectX System', category: 'konnectx', type: 'ACTION', description: 'Manage KonnectX system settings and credentials' },

  // HIREFLOW
  { group: 'HIREFLOW', key: 'MODULE', value: 'navbar:HireFlow:Parent', title: 'HireFlow Module Access', category: 'hireflow', type: 'NAVIGATION', description: 'Access to HireFlow ATS module' },
  { group: 'HIREFLOW', key: 'MODULE_ALT', value: 'navbar:ATS:Parent', title: 'HireFlow ATS Access (Alt)', category: 'hireflow', type: 'NAVIGATION', description: 'Alternate ATS module route identifier' },
  { group: 'HIREFLOW', key: 'JOBS_VIEW', value: 'read:jobs', title: 'View Jobs', category: 'hireflow', type: 'ACTION', description: 'View job openings' },
  { group: 'HIREFLOW', key: 'JOBS_CREATE', value: 'create:jobs', title: 'Create Jobs', category: 'hireflow', type: 'ACTION', description: 'Create new job postings' },
  { group: 'HIREFLOW', key: 'JOBS_EDIT', value: 'update:jobs', title: 'Edit Jobs', category: 'hireflow', type: 'ACTION', description: 'Edit job postings' },
  { group: 'HIREFLOW', key: 'JOBS_DELETE', value: 'delete:jobs', title: 'Delete Jobs', category: 'hireflow', type: 'ACTION', description: 'Delete job postings' },
  { group: 'HIREFLOW', key: 'CANDIDATES_VIEW', value: 'read:candidates', title: 'View Candidates', category: 'hireflow', type: 'ACTION', description: 'View candidate records' },
  { group: 'HIREFLOW', key: 'CANDIDATES_MANAGE', value: 'manage:candidates', title: 'Manage Candidates', category: 'hireflow', type: 'ACTION', description: 'Create, edit and move candidates through pipeline' },
  { group: 'HIREFLOW', key: 'PIPELINE_VIEW', value: 'read:ats-pipeline', title: 'View ATS Pipeline', category: 'hireflow', type: 'ACTION', description: 'View hiring pipeline stages' },
  { group: 'HIREFLOW', key: 'DEPARTMENTS_VIEW', value: 'read:departments', title: 'View Departments', category: 'hireflow', type: 'ACTION', description: 'View department listings' },
  { group: 'HIREFLOW', key: 'ANALYTICS', value: 'read:ats-analytics', title: 'View ATS Analytics', category: 'hireflow', type: 'ACTION', description: 'View recruiting analytics' },

  // CRYSTALAURA
  { group: 'CRYSTALAURA', key: 'MODULE', value: 'navbar:eCommerce:Parent', title: 'CrystalAura Module Access', category: 'crystalaura', type: 'NAVIGATION', description: 'Access to CrystalAura E-Commerce module' },
  { group: 'CRYSTALAURA', key: 'PRODUCTS_VIEW', value: 'read:products', title: 'View Products', category: 'crystalaura', type: 'ACTION', description: 'View store products' },
  { group: 'CRYSTALAURA', key: 'PRODUCTS_MANAGE', value: 'manage:products', title: 'Manage Products', category: 'crystalaura', type: 'ACTION', description: 'Create, edit and delete products' },
  { group: 'CRYSTALAURA', key: 'ORDERS_VIEW', value: 'read:orders', title: 'View Orders', category: 'crystalaura', type: 'ACTION', description: 'View customer orders' },
  { group: 'CRYSTALAURA', key: 'ORDERS_MANAGE', value: 'manage:orders', title: 'Manage Orders', category: 'crystalaura', type: 'ACTION', description: 'Process and manage orders' },
  { group: 'CRYSTALAURA', key: 'CATEGORIES_VIEW', value: 'read:categories', title: 'View Categories', category: 'crystalaura', type: 'ACTION', description: 'View product categories' },
  { group: 'CRYSTALAURA', key: 'CUSTOMERS_VIEW', value: 'read:clients', title: 'View Clients', category: 'crystalaura', type: 'ACTION', description: 'View customer records' },
  { group: 'CRYSTALAURA', key: 'COUPONS_MANAGE', value: 'manage:coupons', title: 'Manage Coupons', category: 'crystalaura', type: 'ACTION', description: 'Create and manage discount coupons' },
  { group: 'CRYSTALAURA', key: 'ANALYTICS', value: 'read:ecommerce-analytics', title: 'View E-Commerce Analytics', category: 'crystalaura', type: 'ACTION', description: 'View store analytics dashboard' },

  // CUREXA
  { group: 'CUREXA', key: 'MODULE', value: 'navbar:Curexa:Parent', title: 'Curexa Module Access', category: 'curexa', type: 'NAVIGATION', description: 'Access to Curexa healthcare module' },
  { group: 'CUREXA', key: 'PATIENTS_VIEW', value: 'read:patients', title: 'View Patients', category: 'curexa', type: 'ACTION', description: 'View patient records' },
  { group: 'CUREXA', key: 'PATIENTS_MANAGE', value: 'manage:patients', title: 'Manage Patients', category: 'curexa', type: 'ACTION', description: 'Create and manage patient records' },
  { group: 'CUREXA', key: 'APPOINTMENTS_VIEW', value: 'read:appointments', title: 'View Appointments', category: 'curexa', type: 'ACTION', description: 'View appointment records' },
  { group: 'CUREXA', key: 'APPOINTMENTS_MANAGE', value: 'manage:appointments', title: 'Manage Appointments', category: 'curexa', type: 'ACTION', description: 'Book and manage appointments' },
  { group: 'CUREXA', key: 'DOCTORS_VIEW', value: 'read:doctors', title: 'View Doctors', category: 'curexa', type: 'ACTION', description: 'View doctor profiles' },
  { group: 'CUREXA', key: 'RECORDS_VIEW', value: 'read:records', title: 'View Medical Records', category: 'curexa', type: 'ACTION', description: 'View patient medical records' },
  { group: 'CUREXA', key: 'DEPARTMENTS_VIEW', value: 'read:curexa-departments', title: 'View Hospital Departments', category: 'curexa', type: 'ACTION', description: 'View hospital department listings' },

  // SOLARBRIGHT
  { group: 'SOLARBRIGHT', key: 'MODULE', value: 'navbar:SolarBright:Parent', title: 'SolarBright Module Access', category: 'solarbright', type: 'NAVIGATION', description: 'Access to SolarBright operations module' },
  { group: 'SOLARBRIGHT', key: 'SITES_VIEW', value: 'read:solar-sites', title: 'View Solar Sites', category: 'solarbright', type: 'ACTION', description: 'View solar installation sites' },
  { group: 'SOLARBRIGHT', key: 'AUDITS_VIEW', value: 'read:solar-audits', title: 'View Solar Audits', category: 'solarbright', type: 'ACTION', description: 'View solar panel audit records' },
  { group: 'SOLARBRIGHT', key: 'MAINTENANCE_MANAGE', value: 'manage:solar-maintenance', title: 'Manage Solar Maintenance', category: 'solarbright', type: 'ACTION', description: 'Schedule and manage maintenance tasks' },
  { group: 'SOLARBRIGHT', key: 'ENERGY_EXPLORER', value: 'read:energy-explorer', title: 'View Energy Explorer', category: 'solarbright', type: 'ACTION', description: 'Explore energy generation data' },

  // KABADX
  { group: 'KABADX', key: 'MODULE', value: 'navbar:KabadX:Parent', title: 'KabadX Module Access', category: 'kabadx', type: 'NAVIGATION', description: 'Access to KabadX recycling module' },
  { group: 'KABADX', key: 'PICKUPS_VIEW', value: 'read:pickups', title: 'View Pickups', category: 'kabadx', type: 'ACTION', description: 'View doorstep pickup requests' },
  { group: 'KABADX', key: 'PICKUPS_MANAGE', value: 'manage:pickups', title: 'Manage Pickups', category: 'kabadx', type: 'ACTION', description: 'Assign and manage pickup requests' },
  { group: 'KABADX', key: 'RATES_VIEW', value: 'read:scrap-rates', title: 'View Scrap Rates', category: 'kabadx', type: 'ACTION', description: 'View material scrap pricing' },
  { group: 'KABADX', key: 'COLLECTORS_MANAGE', value: 'manage:collectors', title: 'Manage Collectors', category: 'kabadx', type: 'ACTION', description: 'Manage field collectors and assignments' },
  { group: 'KABADX', key: 'ANALYTICS', value: 'read:kabadx-analytics', title: 'View KabadX Analytics', category: 'kabadx', type: 'ACTION', description: 'View recycling analytics' },

  // ACCESS MANAGEMENT
  { group: 'ACCESS_MANAGEMENT', key: 'MODULE', value: 'navbar:System:Parent', title: 'Access Management Access', category: 'access-management', type: 'NAVIGATION', description: 'Access to workspace Access Management' },
  { group: 'ACCESS_MANAGEMENT', key: 'USERS_VIEW', value: 'read:users', title: 'View Users', category: 'access-management', type: 'ACTION', description: 'View workspace user list' },
  { group: 'ACCESS_MANAGEMENT', key: 'USERS_MANAGE', value: 'manage:users', title: 'Manage Users', category: 'access-management', type: 'ACTION', description: 'Invite, edit and remove users' },
  { group: 'ACCESS_MANAGEMENT', key: 'ROLES_VIEW', value: 'read:roles', title: 'View Roles', category: 'access-management', type: 'ACTION', description: 'View role definitions' },
  { group: 'ACCESS_MANAGEMENT', key: 'ROLES_MANAGE', value: 'manage:roles', title: 'Manage Roles', category: 'access-management', type: 'ACTION', description: 'Create, edit and delete roles' },
  { group: 'ACCESS_MANAGEMENT', key: 'PERMISSIONS_VIEW', value: 'read:permissions', title: 'View Permissions', category: 'access-management', type: 'ACTION', description: 'View permission records' },
  { group: 'ACCESS_MANAGEMENT', key: 'PERMISSIONS_MANAGE', value: 'manage:permissions', title: 'Manage Permissions', category: 'access-management', type: 'ACTION', description: 'Create, edit and assign permissions' },

  // BRIDGES
  { group: 'BRIDGES', key: 'PAYFLOW', value: 'navbar:PayFlow:Parent', title: 'PayFlow Bridge Access', category: 'bridges', type: 'NAVIGATION', description: 'Access to PayFlow billing bridge' },
  { group: 'BRIDGES', key: 'FLOWGENIX', value: 'navbar:FlowGenix:Parent', title: 'FlowGenix Bridge Access', category: 'bridges', type: 'NAVIGATION', description: 'Access to FlowGenix AI agent module' },
  { group: 'BRIDGES', key: 'HIREFLOW', value: 'navbar:HireFlow:Parent', title: 'HireFlow Bridge Access', category: 'bridges', type: 'NAVIGATION', description: 'Access to HireFlow ATS bridge' },
  { group: 'BRIDGES', key: 'KONNECTX', value: 'navbar:KonnectX:Parent', title: 'KonnectX Bridge Access', category: 'bridges', type: 'NAVIGATION', description: 'Access to KonnectX bridge' },
];
