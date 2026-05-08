/**
 * Refactored Sidebar Navigation structure.
 * This file contains the same items as sidebar-items.js but in a nested parent-child format.
 */

export const getSidebarNavItems = (workspaceId) => {
    const basePath = `/workspace/${workspaceId}`;
    const baseWhatsappCloudApiPath = `${basePath}/konnectx`;
    const baseDocPath = `${basePath}/document`;
    const systemPath = `${basePath}/system`;
    const baseProductivityPath = `${basePath}/productivity`;
    const baseAtsPath = `${basePath}/ats`;
    const baseAgentPath = `${basePath}/agent`;
    const baseMiscellaneousPath = `${basePath}/miscellaneous`;
    const baseEcommercePath = `${basePath}/ecommerce`;
    const baseFlowbytePath = `${basePath}/flowbyte`;
    const baseFlowgenixPath = `${basePath}/flowgenix`;

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
                // { title: "Analytics", icon: "line-chart", url: `${baseWhatsappCloudApiPath}/analytics` },
                // { title: "Agents", icon: "bot", url: `${baseWhatsappCloudApiPath}/agents` },
                // { title: "AI Assistant", icon: "sparkles", url: `${baseWhatsappCloudApiPath}/assistant` },
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
            parent: { title: "Documents", icon: "file", url: basePath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseDocPath },
                { title: "Files", icon: "files", url: `${baseDocPath}/files` },
                { title: "Folders", icon: "folder", url: `${baseDocPath}/folders` },
                { title: "Uploads", icon: "upload-cloud", url: `${baseDocPath}/uploads` },
                { title: "Trash", icon: "trash-2", url: `${baseDocPath}/trash` },
            ],
            baseUrl: baseDocPath,
            permission: `navbar:Documents:Parent`
        },
        {
            parent: { title: "ATS Management", icon: "user", url: baseAtsPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: baseAtsPath },
                { title: "Jobs", icon: "briefcase", url: `${baseAtsPath}/jobs` },
                { title: "Candidates", icon: "user-search", url: `${baseAtsPath}/candidates` },
                { title: "Pipeline", icon: "git-merge", url: `${baseAtsPath}/pipeline` },
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
                { title: "Settings", icon: "settings-2", url: `${systemPath}/setting` },
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

        // Handle groups with no children (like FlowGenix/AI Agent in the current lib)
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