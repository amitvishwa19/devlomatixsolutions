'use server'
import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-utils";

const SEED_PERMISSIONS = [
  { value: 'navbar:System:Parent', title: 'Access System Panel', category: 'system', type: 'NAVIGATION', description: 'Access to the Admin / System panel' },
  { value: 'system:sharedpref', title: 'Shared Preferences', category: 'system', type: 'ACTION', description: 'View and manage shared preferences (Super Admin only)' },
  { value: 'navbar:DevX(CRM):Parent', title: 'Access CRM Module', category: 'crm', type: 'NAVIGATION', description: 'Access to DevX CRM module' },
  { value: 'navbar:DevX(CRM):Dashboard', title: 'CRM Dashboard', category: 'crm', type: 'NAVIGATION', description: 'View CRM Dashboard' },
  { value: 'navbar:DevX(CRM):PipelinesDeals', title: 'CRM Pipelines & Deals', category: 'crm', type: 'NAVIGATION', description: 'View Pipelines & Deals page' },
  { value: 'read:deal', title: 'View Deals', category: 'crm', type: 'ACTION', description: 'Read deal records' },
  { value: 'create:deal', title: 'Create Deals', category: 'crm', type: 'ACTION', description: 'Create new deals' },
  { value: 'update:deal', title: 'Edit Deals', category: 'crm', type: 'ACTION', description: 'Edit existing deal records' },
  { value: 'delete:deal', title: 'Delete Deals', category: 'crm', type: 'ACTION', description: 'Delete deal records' },
  { value: 'read:contact', title: 'View Contacts', category: 'crm', type: 'ACTION', description: 'Read contact records' },
  { value: 'create:contact', title: 'Create Contacts', category: 'crm', type: 'ACTION', description: 'Create new contacts' },
  { value: 'update:contact', title: 'Edit Contacts', category: 'crm', type: 'ACTION', description: 'Edit existing contacts' },
  { value: 'delete:contact', title: 'Delete Contacts', category: 'crm', type: 'ACTION', description: 'Delete contact records' },
  { value: 'read:dcr', title: 'View Daily Call Records', category: 'crm', type: 'ACTION', description: 'Read DCR entries' },
  { value: 'create:dcr', title: 'Create Call Records', category: 'crm', type: 'ACTION', description: 'Log new daily call records' },
  { value: 'update:dcr', title: 'Edit Call Records', category: 'crm', type: 'ACTION', description: 'Edit DCR entries' },
  { value: 'delete:dcr', title: 'Delete Call Records', category: 'crm', type: 'ACTION', description: 'Delete DCR entries' },
  { value: 'read:mailbox', title: 'View Mailbox', category: 'crm', type: 'ACTION', description: 'Read mailbox messages' },
  { value: 'create:mailbox', title: 'Send Emails', category: 'crm', type: 'ACTION', description: 'Send emails via mailbox' },
  { value: 'delete:mailbox', title: 'Delete Emails', category: 'crm', type: 'ACTION', description: 'Delete mailbox messages' },
  { value: 'read:chat', title: 'View CRM Chats', category: 'crm', type: 'ACTION', description: 'Read CRM chat conversations' },
  { value: 'create:call', title: 'Make Calls', category: 'crm', type: 'ACTION', description: 'Execute calls from CRM' },
  { value: 'read:copilot', title: 'Use AI Copilot', category: 'crm', type: 'ACTION', description: 'Access AI Copilot assistant' },
  { value: 'read:quotation', title: 'View Quotations', category: 'crm', type: 'ACTION', description: 'View quotation records' },
  { value: 'create:quotation', title: 'Create Quotations', category: 'crm', type: 'ACTION', description: 'Create new quotations' },
  { value: 'delete:quotation', title: 'Delete Quotations', category: 'crm', type: 'ACTION', description: 'Delete quotation records' },
  { value: 'read:task', title: 'View Tasks', category: 'crm', type: 'ACTION', description: 'Read task records' },
  { value: 'create:task', title: 'Create Tasks', category: 'crm', type: 'ACTION', description: 'Create new tasks' },
  { value: 'update:task', title: 'Edit Tasks', category: 'crm', type: 'ACTION', description: 'Edit task records' },
  { value: 'delete:task', title: 'Delete Tasks', category: 'crm', type: 'ACTION', description: 'Delete task records' },
  { value: 'read:crm-analytics', title: 'View CRM Analytics', category: 'crm', type: 'ACTION', description: 'View CRM analytics dashboard' },
  { value: 'manage:crm-settings', title: 'Manage CRM Settings', category: 'crm', type: 'ACTION', description: 'Manage CRM module settings' },
  { value: 'navbar:KonnectX:Parent', title: 'Access KonnectX Module', category: 'konnectx', type: 'NAVIGATION', description: 'Access to KonnectX WhatsApp Cloud API module' },
  { value: 'read:konnectx-chats', title: 'View Chats', category: 'konnectx', type: 'ACTION', description: 'Read WhatsApp chat conversations' },
  { value: 'create:konnectx-chats', title: 'Send Messages', category: 'konnectx', type: 'ACTION', description: 'Send WhatsApp messages' },
  { value: 'read:konnectx-contacts', title: 'View KonnectX Contacts', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp contacts' },
  { value: 'manage:konnectx-contacts', title: 'Manage KonnectX Contacts', category: 'konnectx', type: 'ACTION', description: 'Create, edit and delete WhatsApp contacts' },
  { value: 'read:campaign', title: 'View Campaigns', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp campaigns' },
  { value: 'create:campaign', title: 'Create Campaigns', category: 'konnectx', type: 'ACTION', description: 'Create new broadcast campaigns' },
  { value: 'update:campaign', title: 'Edit Campaigns', category: 'konnectx', type: 'ACTION', description: 'Edit campaigns' },
  { value: 'delete:campaign', title: 'Delete Campaigns', category: 'konnectx', type: 'ACTION', description: 'Delete campaigns' },
  { value: 'read:template', title: 'View Templates', category: 'konnectx', type: 'ACTION', description: 'View message templates' },
  { value: 'create:template', title: 'Create Templates', category: 'konnectx', type: 'ACTION', description: 'Create message templates' },
  { value: 'delete:template', title: 'Delete Templates', category: 'konnectx', type: 'ACTION', description: 'Delete message templates' },
  { value: 'read:flow', title: 'View Flows', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp automation flows' },
  { value: 'manage:flow', title: 'Manage Flows', category: 'konnectx', type: 'ACTION', description: 'Create and edit automation flows' },
  { value: 'read:chatbot', title: 'View Chatbots', category: 'konnectx', type: 'ACTION', description: 'View chatbot configurations' },
  { value: 'manage:chatbot', title: 'Manage Chatbots', category: 'konnectx', type: 'ACTION', description: 'Create and configure chatbots' },
  { value: 'read:catalog', title: 'View Catalog', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp product catalog' },
  { value: 'manage:catalog', title: 'Manage Catalog', category: 'konnectx', type: 'ACTION', description: 'Manage WhatsApp product catalog' },
  { value: 'read:konnectx-reports', title: 'View KonnectX Reports', category: 'konnectx', type: 'ACTION', description: 'View WhatsApp analytics reports' },
  { value: 'read:konnectx-analytics', title: 'View KonnectX Analytics', category: 'konnectx', type: 'ACTION', description: 'View KonnectX analytics dashboard' },
  { value: 'manage:konnectx-system', title: 'Manage KonnectX System', category: 'konnectx', type: 'ACTION', description: 'Manage KonnectX system settings and credentials' },
  { value: 'navbar:HireFlow:Parent', title: 'Access HireFlow Module', category: 'hireflow', type: 'NAVIGATION', description: 'Access to HireFlow ATS module' },
  { value: 'read:jobs', title: 'View Jobs', category: 'hireflow', type: 'ACTION', description: 'View job openings' },
  { value: 'create:jobs', title: 'Create Jobs', category: 'hireflow', type: 'ACTION', description: 'Create new job postings' },
  { value: 'update:jobs', title: 'Edit Jobs', category: 'hireflow', type: 'ACTION', description: 'Edit job postings' },
  { value: 'delete:jobs', title: 'Delete Jobs', category: 'hireflow', type: 'ACTION', description: 'Delete job postings' },
  { value: 'read:candidates', title: 'View Candidates', category: 'hireflow', type: 'ACTION', description: 'View candidate records' },
  { value: 'manage:candidates', title: 'Manage Candidates', category: 'hireflow', type: 'ACTION', description: 'Create, edit and move candidates through pipeline' },
  { value: 'read:ats-pipeline', title: 'View ATS Pipeline', category: 'hireflow', type: 'ACTION', description: 'View hiring pipeline stages' },
  { value: 'read:departments', title: 'View Departments', category: 'hireflow', type: 'ACTION', description: 'View department listings' },
  { value: 'read:ats-analytics', title: 'View ATS Analytics', category: 'hireflow', type: 'ACTION', description: 'View recruiting analytics' },
  { value: 'navbar:eCommerce:Parent', title: 'Access CrystalAura Module', category: 'crystalaura', type: 'NAVIGATION', description: 'Access to CrystalAura E-Commerce module' },
  { value: 'read:products', title: 'View Products', category: 'crystalaura', type: 'ACTION', description: 'View store products' },
  { value: 'manage:products', title: 'Manage Products', category: 'crystalaura', type: 'ACTION', description: 'Create, edit and delete products' },
  { value: 'read:orders', title: 'View Orders', category: 'crystalaura', type: 'ACTION', description: 'View customer orders' },
  { value: 'manage:orders', title: 'Manage Orders', category: 'crystalaura', type: 'ACTION', description: 'Process and manage orders' },
  { value: 'read:categories', title: 'View Categories', category: 'crystalaura', type: 'ACTION', description: 'View product categories' },
  { value: 'read:clients', title: 'View Clients', category: 'crystalaura', type: 'ACTION', description: 'View customer records' },
  { value: 'manage:coupons', title: 'Manage Coupons', category: 'crystalaura', type: 'ACTION', description: 'Create and manage discount coupons' },
  { value: 'read:ecommerce-analytics', title: 'View E-Commerce Analytics', category: 'crystalaura', type: 'ACTION', description: 'View store analytics dashboard' },
  { value: 'navbar:Curexa:Parent', title: 'Access Curexa Module', category: 'curexa', type: 'NAVIGATION', description: 'Access to Curexa healthcare module' },
  { value: 'read:patients', title: 'View Patients', category: 'curexa', type: 'ACTION', description: 'View patient records' },
  { value: 'manage:patients', title: 'Manage Patients', category: 'curexa', type: 'ACTION', description: 'Create and manage patient records' },
  { value: 'read:appointments', title: 'View Appointments', category: 'curexa', type: 'ACTION', description: 'View appointment records' },
  { value: 'manage:appointments', title: 'Manage Appointments', category: 'curexa', type: 'ACTION', description: 'Book and manage appointments' },
  { value: 'read:doctors', title: 'View Doctors', category: 'curexa', type: 'ACTION', description: 'View doctor profiles' },
  { value: 'read:records', title: 'View Medical Records', category: 'curexa', type: 'ACTION', description: 'View patient medical records' },
  { value: 'read:curexa-departments', title: 'View Hospital Departments', category: 'curexa', type: 'ACTION', description: 'View hospital department listings' },
  { value: 'navbar:SolarBright:Parent', title: 'Access SolarBright Module', category: 'solarbright', type: 'NAVIGATION', description: 'Access to SolarBright operations module' },
  { value: 'read:solar-sites', title: 'View Solar Sites', category: 'solarbright', type: 'ACTION', description: 'View solar installation sites' },
  { value: 'read:solar-audits', title: 'View Solar Audits', category: 'solarbright', type: 'ACTION', description: 'View solar panel audit records' },
  { value: 'manage:solar-maintenance', title: 'Manage Solar Maintenance', category: 'solarbright', type: 'ACTION', description: 'Schedule and manage maintenance tasks' },
  { value: 'read:energy-explorer', title: 'View Energy Explorer', category: 'solarbright', type: 'ACTION', description: 'Explore energy generation data' },
  { value: 'navbar:KabadX:Parent', title: 'Access KabadX Module', category: 'kabadx', type: 'NAVIGATION', description: 'Access to KabadX recycling module' },
  { value: 'read:pickups', title: 'View Pickups', category: 'kabadx', type: 'ACTION', description: 'View doorstep pickup requests' },
  { value: 'manage:pickups', title: 'Manage Pickups', category: 'kabadx', type: 'ACTION', description: 'Assign and manage pickup requests' },
  { value: 'read:scrap-rates', title: 'View Scrap Rates', category: 'kabadx', type: 'ACTION', description: 'View material scrap pricing' },
  { value: 'manage:collectors', title: 'Manage Collectors', category: 'kabadx', type: 'ACTION', description: 'Manage field collectors and assignments' },
  { value: 'read:kabadx-analytics', title: 'View KabadX Analytics', category: 'kabadx', type: 'ACTION', description: 'View recycling analytics' },
  { value: 'read:users', title: 'View Users', category: 'access-management', type: 'ACTION', description: 'View workspace user list' },
  { value: 'manage:users', title: 'Manage Users', category: 'access-management', type: 'ACTION', description: 'Invite, edit and remove users' },
  { value: 'read:roles', title: 'View Roles', category: 'access-management', type: 'ACTION', description: 'View role definitions' },
  { value: 'manage:roles', title: 'Manage Roles', category: 'access-management', type: 'ACTION', description: 'Create, edit and delete roles' },
  { value: 'read:permissions', title: 'View Permissions', category: 'access-management', type: 'ACTION', description: 'View permission records' },
  { value: 'manage:permissions', title: 'Manage Permissions', category: 'access-management', type: 'ACTION', description: 'Create, edit and assign permissions' },
  { value: 'navbar:PayFlow:Parent', title: 'Access PayFlow Module', category: 'payflow', type: 'NAVIGATION', description: 'Access to PayFlow billing bridge' },
  { value: 'navbar:FlowGenix:Parent', title: 'Access FlowGenix Module', category: 'flowgenix', type: 'NAVIGATION', description: 'Access to FlowGenix AI agent module' },
];

const SEED_ROLES = [
  {
    title: 'Super Admin',
    slug: 'super-admin',
    description: 'Complete unrestricted access across all suites, modules, tokens, and settings.',
    color: '#6366f1',
    permissions: ['*'],
  },
  {
    title: 'Admin',
    slug: 'admin',
    description: 'System administrator with permission management and user configuration.',
    color: '#0ea5e9',
    permissions: ['navbar:System:Parent','manage:users','manage:roles','manage:permissions','navbar:DevX(CRM):Parent','navbar:KonnectX:Parent','navbar:HireFlow:Parent'],
  },
  {
    title: 'Workspace',
    slug: 'workspace',
    description: 'Workspace member with access to standard collaborative modules.',
    color: '#0d9488',
    permissions: ['navbar:workspace:Parent', 'navbar:Workspace:Parent', 'navbar:DevX(CRM):Parent', 'navbar:KonnectX:Parent'],
  },
  {
    title: 'KonnectX',
    slug: 'konnectx',
    description: 'KonnectX WhatsApp suite member.',
    color: '#0d9488',
    permissions: ['navbar:KonnectX:Parent', 'read:konnectx-chats', 'create:konnectx-chats', 'read:konnectx-contacts'],
  },
  {
    title: 'Sales Manager',
    slug: 'sales-manager',
    description: 'Oversees team deals, pipelines, call logs, field activities and sales targets.',
    color: '#f59e0b',
    permissions: ['navbar:DevX(CRM):Parent','read:deal','create:deal','update:deal','delete:deal','read:contact','create:contact','update:contact','read:dcr','create:dcr','update:dcr','read:crm-analytics','read:mailbox','create:mailbox'],
  },
  {
    title: 'DevX(CRM)',
    slug: 'devxcrm',
    description: 'Creates deals, contacts, logs daily calls and communicates with leads.',
    color: '#10b981',
    permissions: ['navbar:DevX(CRM):Parent','read:deal','create:deal','update:deal','read:contact','create:contact','update:contact','read:dcr','create:dcr','read:mailbox','create:mailbox'],
  },
  {
    title: 'KonnectX Admin',
    slug: 'konnectx-admin',
    description: 'Full management of WhatsApp Cloud campaigns, templates, chatbots and flows.',
    color: '#16a34a',
    permissions: ['navbar:KonnectX:Parent','read:campaign','create:campaign','update:campaign','delete:campaign','read:template','create:template','read:flow','manage:flow','read:chatbot','manage:chatbot','read:catalog'],
  },
  {
    title: 'HR Manager',
    slug: 'hr-manager',
    description: 'Manages candidate recruiting, open positions, pipeline stages, and hiring.',
    color: '#4f46e5',
    permissions: ['navbar:HireFlow:Parent','read:jobs','create:jobs','read:candidates','manage:candidates','read:ats-pipeline','read:ats-analytics'],
  },
  {
    title: 'E-Commerce Manager',
    slug: 'ecommerce-manager',
    description: 'Manages online store products, customer orders, coupons and catalog.',
    color: '#9333ea',
    permissions: ['navbar:eCommerce:Parent','read:products','manage:products','read:orders','manage:orders','read:clients'],
  },
  {
    title: 'Healthcare Admin',
    slug: 'healthcare-admin',
    description: 'Manages patient admissions, appointments, doctors and medical records.',
    color: '#059669',
    permissions: ['navbar:Curexa:Parent','read:patients','manage:patients','read:appointments','manage:appointments','read:doctors'],
  },
  {
    title: 'Solar Operator',
    slug: 'solar-operator',
    description: 'Oversees site audits, panel maintenance schedules, and energy exploration.',
    color: '#d97706',
    permissions: ['navbar:SolarBright:Parent','read:solar-sites','read:solar-audits','manage:solar-maintenance'],
  },
  {
    title: 'Recycling Agent',
    slug: 'recycling-agent',
    description: 'Doorstep pickup coordinator, scrap material pricing and collector assigner.',
    color: '#0d9488',
    permissions: ['navbar:KabadX:Parent','read:pickups','manage:pickups','read:scrap-rates','manage:collectors'],
  },
];

export async function seedAccessData() {
  await ensureAdmin();

  try {
    const result = await db.$transaction(async (tx) => {
      const upsertedPerms = [];
      for (const perm of SEED_PERMISSIONS) {
        const upserted = await tx.permission.upsert({
          where: { value: perm.value },
          update: { title: perm.title, description: perm.description, category: perm.category, type: perm.type, status: true },
          create: { value: perm.value, title: perm.title, description: perm.description, category: perm.category, type: perm.type, status: true },
        });
        upsertedPerms.push(upserted);
      }

      const permValueToId = new Map(upsertedPerms.map((p) => [p.value, p.id]));

      const upsertedRoles = [];
      for (const role of SEED_ROLES) {
        const permConnects = role.permissions
          .filter((v) => permValueToId.has(v))
          .map((v) => ({ id: permValueToId.get(v) }));

        let upserted;
        const existingRole = await tx.role.findFirst({
          where: {
            OR: [
              { slug: role.slug },
              { title: { equals: role.title, mode: 'insensitive' } },
              { slug: role.slug.replace(/-/g, '') }
            ]
          }
        });

        if (existingRole) {
          upserted = await tx.role.update({
            where: { id: existingRole.id },
            data: {
              title: role.title,
              description: role.description,
              color: role.color,
              permissions: { set: permConnects }
            },
            include: { permissions: { select: { id: true, value: true } } },
          });
        } else {
          upserted = await tx.role.create({
            data: {
              title: role.title,
              slug: role.slug,
              description: role.description,
              color: role.color,
              permissions: { connect: permConnects }
            },
            include: { permissions: { select: { id: true, value: true } } },
          });
        }
        upsertedRoles.push(upserted);
      }

      return { permissionsSeeded: upsertedPerms.length, rolesSeeded: upsertedRoles.length };
    }, { timeout: 60000 });

    return { data: result };
  } catch (error) {
    console.error('Seed Access Data Error:', error);
    return { message: error?.message || 'Failed to seed access data', error };
  }
}