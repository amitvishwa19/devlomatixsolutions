/**
 * Refactored Sidebar Navigation structure.
 * This file contains the complete workspace navigation items in nested parent-child format.
 */

export const getSidebarNavItems = (workspaceId) => {
    const basePath = `/workspace/${workspaceId}`;
    const baseWhatsappCloudApiPath = `${basePath}/konnectx`;
    const baseWhatsappCrmPath = `${basePath}/wacrm`;
    const baseDocPath = `${basePath}/document`;
    const systemPath = `${basePath}/system`;
    const baseProductivityPath = `${basePath}/productivity`;
    const baseAtsPath = `${basePath}/hireflow`;
    const baseAgentPath = `${basePath}/agent`;
    const baseMiscellaneousPath = `${basePath}/miscellaneous`;
    const baseEcommercePath = `${basePath}/ecommerce`;
    const baseFlowbytePath = `${basePath}/flowbyte`;
    const baseFlowgenixPath = `${basePath}/flowgenix`;
    const baseFlowforgePath = `${basePath}/flowforge`;
    const baseDeskflowPath = `${basePath}/deskflow`;
    const basePayflowPath = `${basePath}/payflow`;
    const baseFormcraftPath = `${basePath}/formcraft`;
    const baseMetricpulsePath = `${basePath}/metricpulse`;
    const baseKnowbasePath = `${basePath}/knowbase`;
    const baseSocialhubPath = `${basePath}/socialhub`;
    const baseVaultPath = `${basePath}/vault`;
    const baseCRMPath = `${basePath}/crm`;
    const baseFleetxPath = `${basePath}/fleetx`;
    const basePropxPath = `${basePath}/propx`;

    return [
        {
            parent: { title: "Workspace", icon: "layout-dashboard", url: basePath },
            child: [
                { title: "Dashboard", icon: "layout-dashboard", url: basePath },
                { title: "Article", icon: "file-text", url: `${basePath}/article` },
                { title: "Category", icon: "tag", url: `${basePath}/category` },
                { title: "Contacts", icon: "users", url: `${basePath}/contact` },
            ],
            baseUrl: basePath,
            permission: [`navbar:Workspace:Home`],
            roles: []
        },
        {
            parent: { title: "DevX(CRM)", icon: "rocket", url: baseCRMPath },
            child: [
                { title: "Dashboard", icon: "layout-dashboard", url: baseCRMPath },
                { title: "Activity Center", icon: "phone-call", url: `${baseCRMPath}/dcr` },
                { title: "Chat & Calls", icon: "messages-square", url: `${baseCRMPath}/chat` },
                { title: "AI Copilot", icon: "sparkles", url: `${baseCRMPath}/copilot` },
                { title: "Pipelines & Deals", icon: "kanban", url: `${baseCRMPath}/pipeline` },
                { title: "360° Contacts", icon: "users", url: `${baseCRMPath}/contacts` },
                { title: "Companies", icon: "building", url: `${baseCRMPath}/accounts` },
                { title: "Tasks", icon: "check-square", url: `${baseCRMPath}/tasks` },
                { title: "Forecast & Leaderboard", icon: "trending-up", url: `${baseCRMPath}/analytics` },
                { title: "Automations", icon: "zap", url: `${baseCRMPath}/automations` },
                { title: "Activities", icon: "activity", url: `${baseCRMPath}/activities` },
                { title: "Settings", icon: "settings-2", url: `${baseCRMPath}/settings` },
            ],
            baseUrl: baseCRMPath,
            permission: [`navbar:DevX(CRM):Parent`, `navbar:CRM:Parent`],
            roles: []
        },
        {
            parent: { title: "eCommerce", icon: "shopping-cart", url: baseEcommercePath },
            child: [
                { title: "Dashboard", icon: "layout-dashboard", url: baseEcommercePath },
                { title: "Categories", icon: "tag", url: `${baseEcommercePath}/categories` },
                { title: "Products", icon: "package", url: `${baseEcommercePath}/products` },
                { title: "Clients", icon: "users", url: `${baseEcommercePath}/clients` },
                { title: "Orders", icon: "shopping-bag", url: `${baseEcommercePath}/orders` },
                { title: "Coupons", icon: "ticket", url: `${baseEcommercePath}/marketing/coupons` },
                { title: "Reviews", icon: "star", url: `${baseEcommercePath}/marketing/reviews` },
                { title: "Abandoned", icon: "shopping-cart", url: `${baseEcommercePath}/abandoned` },
                { title: "Settings", icon: "settings", url: `${baseEcommercePath}/settings` },
            ],
            baseUrl: baseEcommercePath,
            permission: [`navbar:eCommerce:Parent`],
            roles: []
        },
        {
            parent: { title: "KonnectX", icon: "message-circle-more", url: baseWhatsappCloudApiPath },
            child: [
                { title: "Dashboard", icon: "message-circle-more", url: baseWhatsappCloudApiPath },
                { title: "Messages", icon: "messages-square", url: `${baseWhatsappCloudApiPath}/chats` },
                { title: "Contacts", icon: "users", url: `${baseWhatsappCloudApiPath}/contacts` },
                { title: "Templates", icon: "zap", url: `${baseWhatsappCloudApiPath}/template` },
                { title: "Campaigns", icon: "megaphone", url: `${baseWhatsappCloudApiPath}/campaigns` },
                { title: "Catalog", icon: "shopping-bag", url: `${baseWhatsappCloudApiPath}/catalog` },
                { title: "Flows", icon: "workflow", url: `${baseWhatsappCloudApiPath}/flows` },
                { title: "Chatbot", icon: "bot", url: `${baseWhatsappCloudApiPath}/chatbot` },
                { title: "Reports", icon: "file-spreadsheet", url: `${baseWhatsappCloudApiPath}/reports` },
                { title: "Analytics", icon: "bar-chart-3", url: `${baseWhatsappCloudApiPath}/analytics` },
                { title: "Docs", icon: "book-open-text", url: `${baseWhatsappCloudApiPath}/docs` },
                { title: "Settings", icon: "settings-2", url: `${baseWhatsappCloudApiPath}/settings` },
            ],
            baseUrl: baseWhatsappCloudApiPath,
            permission: [`navbar:KonnectX:Parent`],
            roles: []
        },
        {
            parent: { title: "HireFlow", icon: "user", url: baseAtsPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseAtsPath },
                { title: "Departments", icon: "briefcase", url: `${baseAtsPath}/departments` },
                { title: "Jobs", icon: "handshake", url: `${baseAtsPath}/jobs` },
                { title: "Candidates", icon: "user-search", url: `${baseAtsPath}/candidates` },
                { title: "Pipeline", icon: "git-merge", url: `${baseAtsPath}/pipeline` },
                { title: "Settings", icon: "settings", url: `${baseAtsPath}/settings` },
            ],
            baseUrl: baseAtsPath,
            permission: [`navbar:ATS:Parent`],
            roles: []
        },
        {
            parent: { title: "FleetX", icon: "truck", url: baseFleetxPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseFleetxPath },
                { title: "Live Fleet Map", icon: "map-pin", url: `${baseFleetxPath}#live-map` },
                { title: "Dispatches", icon: "send", url: `${baseFleetxPath}#dispatches` },
                { title: "Fuel Telemetry", icon: "fuel", url: `${baseFleetxPath}#fuel` },
            ],
            baseUrl: baseFleetxPath,
            permission: [`navbar:FleetX:Parent`],
            roles: []
        },
        {
            parent: { title: "PropX", icon: "building", url: basePropxPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: basePropxPath },
                { title: "Properties", icon: "building-2", url: `${basePropxPath}#properties` },
                { title: "Units & Stacking", icon: "layers", url: `${basePropxPath}#units` },
                { title: "Leases & E-Sign", icon: "file-signature", url: `${basePropxPath}#leases` },
                { title: "Maintenance", icon: "wrench", url: `${basePropxPath}#maintenance` },
            ],
            baseUrl: basePropxPath,
            permission: [`navbar:PropX:Parent`],
            roles: []
        },
        {
            parent: { title: "FlowGenix", icon: "bot-message-square", url: baseFlowgenixPath },
            child: [],
            baseUrl: baseFlowgenixPath,
            permission: [`navbar:KonnectXv2:Parent`],
            roles: []
        },
        {
            parent: { title: "FlowForge", icon: "workflow", url: baseFlowforgePath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseFlowforgePath },
                { title: "Workflows", icon: "git-branch", url: `${baseFlowforgePath}/workflows` },
                { title: "Triggers", icon: "zap", url: `${baseFlowforgePath}/triggers` },
                { title: "Logs", icon: "scroll-text", url: `${baseFlowforgePath}/logs` },
                { title: "Templates", icon: "layers", url: `${baseFlowforgePath}/templates` },
            ],
            baseUrl: baseFlowforgePath,
            permission: [`navbar:FlowForge:Parent`],
            roles: []
        },
        {
            parent: { title: "DeskFlow", icon: "messages-square", url: baseDeskflowPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseDeskflowPath },
                { title: "Tickets", icon: "ticket", url: `${baseDeskflowPath}/tickets` },
                { title: "Live Chat", icon: "message-circle-more", url: `${baseDeskflowPath}/chat` },
                { title: "Agents", icon: "users", url: `${baseDeskflowPath}/agents` },
                { title: "Responses", icon: "message-square-text", url: `${baseDeskflowPath}/responses` },
            ],
            baseUrl: baseDeskflowPath,
            permission: [`navbar:DeskFlow:Parent`],
            roles: []
        },
        {
            parent: { title: "PayFlow", icon: "credit-card", url: basePayflowPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: basePayflowPath },
                { title: "Invoices", icon: "receipt", url: `${basePayflowPath}/invoices` },
                { title: "Subscriptions", icon: "repeat", url: `${basePayflowPath}/subscriptions` },
                { title: "Payments", icon: "dollar-sign", url: `${basePayflowPath}/payments` },
                { title: "Customers", icon: "users", url: `${basePayflowPath}/customers` },
            ],
            baseUrl: basePayflowPath,
            permission: [`navbar:PayFlow:Parent`],
            roles: []
        },
        {
            parent: { title: "FormCraft", icon: "form-input", url: baseFormcraftPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseFormcraftPath },
                { title: "Forms", icon: "file-edit", url: `${baseFormcraftPath}/forms` },
                { title: "Submissions", icon: "inbox", url: `${baseFormcraftPath}/submissions` },
                { title: "Templates", icon: "layout-template", url: `${baseFormcraftPath}/templates` },
                { title: "Analytics", icon: "bar-chart-3", url: `${baseFormcraftPath}/analytics` },
            ],
            baseUrl: baseFormcraftPath,
            permission: [`navbar:FormCraft:Parent`],
            roles: []
        },
        {
            parent: { title: "MetricPulse", icon: "activity", url: baseMetricpulsePath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseMetricpulsePath },
                { title: "Revenue", icon: "trending-up", url: `${baseMetricpulsePath}/revenue` },
                { title: "Activity", icon: "activity", url: `${baseMetricpulsePath}/activity` },
                { title: "Reports", icon: "pie-chart", url: `${baseMetricpulsePath}/reports` },
            ],
            baseUrl: baseMetricpulsePath,
            permission: [`navbar:MetricPulse:Parent`],
            roles: []
        },
        {
            parent: { title: "KnowBase", icon: "book-open", url: baseKnowbasePath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseKnowbasePath },
                { title: "Articles", icon: "file-text", url: `${baseKnowbasePath}/articles` },
                { title: "Categories", icon: "folder-tree", url: `${baseKnowbasePath}/categories` },
                { title: "Feedback", icon: "thumbs-up", url: `${baseKnowbasePath}/feedback` },
            ],
            baseUrl: baseKnowbasePath,
            permission: [`navbar:KnowBase:Parent`],
            roles: []
        },
        {
            parent: { title: "SocialHub", icon: "share-2", url: baseSocialhubPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseSocialhubPath },
                { title: "Calendar", icon: "calendar", url: `${baseSocialhubPath}/calendar` },
                { title: "Composer", icon: "send", url: `${baseSocialhubPath}/composer` },
                { title: "Scheduled", icon: "clock", url: `${baseSocialhubPath}/scheduled` },
                { title: "Accounts", icon: "share-2", url: `${baseSocialhubPath}/accounts` },
            ],
            baseUrl: baseSocialhubPath,
            permission: [`navbar:SocialHub:Parent`],
            roles: []
        },
        {
            parent: { title: "Documents", icon: "file", url: baseDocPath },
            child: [],
            baseUrl: baseDocPath,
            permission: [`navbar:Documents:Parent`],
            roles: []
        },
        {
            parent: { title: "Productivity", icon: "folder-kanban", url: baseProductivityPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: `${baseProductivityPath}/` },
                { title: "Kanban", icon: "columns-3", url: `${baseProductivityPath}/kanban` },
                { title: "Mailbox", icon: "mail", url: `${baseProductivityPath}/mailbox` },
                { title: "Discord Server", icon: "message-square-more", url: `${baseProductivityPath}/message` },
                { title: "Quotation", icon: "file-spreadsheet", url: `${baseProductivityPath}/quotation` },
                { title: "Lead Generation", icon: "user-plus", url: `${baseProductivityPath}/leads` },
            ],
            baseUrl: baseProductivityPath,
            permission: [`navbar:Productivity:Parent`],
            roles: []
        },
        {
            parent: { title: "System", icon: "monitor-cog", url: basePath },
            child: [
                { title: "Access Control", icon: "shield-check", url: `${systemPath}/access` },
                { title: "Credentials", icon: "key-square", url: `${systemPath}/credential` },
                { title: "Logs", icon: "scroll-text", url: `${systemPath}/log` },
                { title: "Mailer", icon: "send", url: `${systemPath}/mailer` },
                { title: "Cron Jobs", icon: "timer", url: `${systemPath}/cron` },
            ],
            baseUrl: systemPath,
            permission: [`navbar:System:Parent`],
            roles: []
        },
    ];
};

/**
 * Legacy utility that returns a flat list of all navigation items.
 * Used by Access Management components (PermissionEditor, NavigationPermissionForm).
 */
export const getSidebarItems = (workspaceId) => {
    const navStructure = getSidebarNavItems(workspaceId);
    const flatItems = [];

    navStructure.forEach(group => {
        // Add parent as a special type if it has children
        if (group.child && group.child.length > 0) {
            flatItems.push({
                ...group.parent,
                category: group.parent.title,
                type: 'parent'
            });
        }

        // Add children
        group.child.forEach(child => {
            flatItems.push({
                ...child,
                category: group.parent.title,
                type: 'child'
            });
        });

        // Handle groups with no children (like FlowGenix)
        if (!group.child || group.child.length === 0) {
            flatItems.push({
                ...group.parent,
                category: group.parent.title,
                type: 'child'
            });
        }
    });

    return flatItems;
};