/**
 * Refactored Sidebar Navigation structure.
 * This file contains the same items as sidebar-items.js but in a nested parent-child format.
 */

export const getSidebarNavItems = (workspaceId) => {
    const basePath = `/workspace/${workspaceId}`;
    const baseWhatsappCloudApiPath = `${basePath}/wa-cloud-api`;
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
                { title: "Orders", icon: "shopping-bag", url: `${baseEcommercePath}/orders` },
                { title: "Products", icon: "package", url: `${baseEcommercePath}/products` },
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
                { title: "Chats", icon: "message-square", url: `${baseWhatsappCloudApiPath}/chats` },
                { title: "Contacts", icon: "users", url: `${baseWhatsappCloudApiPath}/contacts` },
                { title: "Templates", icon: "zap", url: `${baseWhatsappCloudApiPath}/template` },
                { title: "Campaigns", icon: "megaphone", url: `${baseWhatsappCloudApiPath}/campaigns` },
                { title: "Flows", icon: "megaphone", url: `${baseWhatsappCloudApiPath}/flows` },
                { title: "Analytics", icon: "line-chart", url: `${baseWhatsappCloudApiPath}/analytics` },
                { title: "Agents", icon: "bot", url: `${baseWhatsappCloudApiPath}/agents` },
                { title: "AI Assistant", icon: "sparkles", url: `${baseWhatsappCloudApiPath}/assistant` },
                { title: "Chatbot", icon: "message-square-text", url: `${baseWhatsappCloudApiPath}/chatbot` },
                { title: "Usage & billing", icon: "credit-card", url: `${baseWhatsappCloudApiPath}/settings?tab=billing` },
                { title: "Docs", icon: "book-open-text", url: `${baseWhatsappCloudApiPath}/docs` },
                { title: "Settings", icon: "settings-2", url: `${baseWhatsappCloudApiPath}/settings` },
            ],
            baseUrl: baseWhatsappCloudApiPath,
            permission: `navbar:KonnectX:Parent`
        },
        {
            parent: { title: "FlowGenix", icon: "bot-message-square", url: baseFlowgenixPath },
            child: [
                { title: "Dashboard", icon: "bar-chart-3", url: baseFlowgenixPath },
            ],
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
            parent: { title: "FlowByte", icon: "workflow", url: baseFlowbytePath },
            child: [
                { title: "Workflows", icon: "workflow", url: baseFlowbytePath },
                { title: "Executions", icon: "activity", url: `${baseFlowbytePath}/executions` },
                { title: "Credentials", icon: "key-round", url: `${baseFlowbytePath}/credentials` },
                { title: "Templates", icon: "layout-template", url: `${baseFlowbytePath}/templates` },
                { title: "Settings", icon: "settings-2", url: `${baseFlowbytePath}/settings` },
            ],
            baseUrl: baseFlowbytePath,
            permission: `navbar:FlowByte:Parent`
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
            parent: { title: "AI Agent", icon: "brain", url: `${baseAgentPath}/` },
            child: [],
            baseUrl: baseAgentPath,
            permission: `navbar:Agent:Parent`
        },
        {
            parent: { title: "Miscellaneous", icon: "blocks", url: baseMiscellaneousPath },
            child: [
                { title: "Dashboard", icon: "layout-grid", url: `${baseMiscellaneousPath}/` },
                { title: "Quotation", icon: "file-spreadsheet", url: `${baseMiscellaneousPath}/quotation` },
                { title: "Lead Generation", icon: "user-plus", url: `${baseMiscellaneousPath}/leads` },
                { title: "Lead Generation v-2", icon: "user-check", url: `${baseMiscellaneousPath}/leads-v2` },
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