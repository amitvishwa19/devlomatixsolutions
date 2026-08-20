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
            permission: `navbar:Workspace:Home`
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
            permission: `navbar:eCommerce:Parent`
        },
        {
            parent: { title: "KonnectX", icon: "message-circle-more", url: baseWhatsappCloudApiPath },
            child: [
                { title: "Dashboard", icon: "message-circle-more", url: baseWhatsappCloudApiPath },
                { title: "Messages", icon: "bot-message-square", url: `${baseWhatsappCloudApiPath}/chats` },
                { title: "Contacts", icon: "users", url: `${baseWhatsappCloudApiPath}/contacts` },
                { title: "Templates", icon: "zap", url: `${baseWhatsappCloudApiPath}/template` },
                { title: "Campaigns", icon: "megaphone", url: `${baseWhatsappCloudApiPath}/campaigns` },
                { title: "Flows", icon: "megaphone", url: `${baseWhatsappCloudApiPath}/flows` },
                { title: "Chatbot", icon: "bot", url: `${baseWhatsappCloudApiPath}/chatbot` },
                { title: "Usage & billing", icon: "credit-card", url: `${baseWhatsappCloudApiPath}/settings?tab=billing` },
                { title: "Docs", icon: "book-open-text", url: `${baseWhatsappCloudApiPath}/docs` },
                { title: "Settings", icon: "settings-2", url: `${baseWhatsappCloudApiPath}/settings` },
            ],
            baseUrl: baseWhatsappCloudApiPath,
            permission: `navbar:KonnectX:Parent`
        },
        {
            parent: { title: "FlowGenix", icon: "bot-message-square", url: baseFlowgenixPath },
            child: [],
            baseUrl: baseFlowgenixPath,
            permission: `navbar:KonnectXv2:Parent`
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
            permission: `navbar:FlowForge:Parent`
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
            permission: `navbar:DeskFlow:Parent`
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
            permission: `navbar:PayFlow:Parent`
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
            permission: `navbar:FormCraft:Parent`
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
            permission: `navbar:MetricPulse:Parent`
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
            permission: `navbar:KnowBase:Parent`
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
            permission: `navbar:SocialHub:Parent`
        },
        // {
        //     parent: { title: "Documents", icon: "file", url: baseDocPath },
        //     child: [
        //         { title: "All Assets", icon: "layout-grid", url: baseDocPath },
        //         { title: "Files", icon: "files", url: `${baseDocPath}?view=files` },
        //         { title: "Folders", icon: "folder", url: `${baseDocPath}?view=folders` },
        //         { title: "Uploads", icon: "upload-cloud", url: `${baseDocPath}?view=uploads` },
        //         { title: "Trash", icon: "trash-2", url: `${baseDocPath}?view=trash` },
        //     ],
        //     baseUrl: baseDocPath,
        //     permission: `navbar:Documents:Parent`
        // },
        {
            parent: { title: "Documents", icon: "file", url: baseDocPath },
            child: [],
            baseUrl: baseDocPath,
            permission: `navbar:Documents:Parent`
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
            permission: `navbar:ATS:Parent`
        },
        {
            parent: { title: "Productivity", icon: "folder-kanban", url: baseProductivityPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: `${baseProductivityPath}/` },
                { title: "Kanban", icon: "columns-3", url: `${baseProductivityPath}/kanban` },
                { title: "Mailbox", icon: "mail", url: `${baseProductivityPath}/mailbox` },
                { title: "Message", icon: "message-square-more", url: `${baseProductivityPath}/message` },
            ],
            baseUrl: baseProductivityPath,
            permission: `navbar:Productivity:Parent`
        },
        {
            parent: { title: "Miscellaneous", icon: "blocks", url: baseMiscellaneousPath },
            child: [
                { title: "Quotation", icon: "file-spreadsheet", url: `${baseMiscellaneousPath}/quotation` },
                { title: "Lead Generation", icon: "user-plus", url: `${baseMiscellaneousPath}/leads` },
                { title: "Playground", icon: "user-check", url: `${baseMiscellaneousPath}/playground` },
            ],
            baseUrl: baseMiscellaneousPath,
            permission: `navbar:Miscellaneous:Parent`
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
            permission: `navbar:System:Parent`
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