/**
 * Navigation configuration for the application Sidebar and Access Control.
 * This file serves as the single source of truth for the application's menu structure.
 */

export const getSidebarItems = (workspaceId) => {
    const basePath = `/workspace/${workspaceId}`;
    const baseWhatsappCloudApiPath = `${basePath}/wa-cloud-api`;
    const baseWhatsappBusinessApiPath = `${basePath}/wa-business-api`;
    const baseDocPath = `${basePath}/document`;
    const baseAccessPath = `${basePath}/management`;
    const systemPath = `${basePath}/system`;
    const baseProductivityPath = `${basePath}/productivity`;
    const baseAtsPath = `${basePath}/ats`;
    const baseAgentPath = `${basePath}/agent`;
    const baseFlowbotPath = `${basePath}/flowbot`;
    const baseMiscellaneousPath = `${basePath}/miscellaneous`;
    const baseEcommercePath = `${basePath}/ecommerce`;
    const baseFlowbytePath = `${basePath}/flowbyte`;
    const baseFlowgenixPath = `${basePath}/flowgenix`;

    return [
        // DASHBOARD
        { type: 'parent', title: "Workspace", url: basePath, icon: "layout-dashboard", category: "Workspace", permission: `navbar:Workspace:Home` },
        { type: 'child', title: "Dashboard", url: basePath, icon: "layout-dashboard", category: "Workspace", permission: `navbar:Workspace:Dashboard` },
        { type: 'child', title: "Article", url: `${basePath}/article`, icon: "file-text", category: "Workspace", permission: `navbar:Workspace:Article` },
        { type: 'child', title: "Category", url: `${basePath}/category`, icon: "tag", category: "Workspace", permission: `navbar:Workspace:Category` },
        { type: 'child', title: "Contacts", url: `${basePath}/contact`, icon: "users", category: "Workspace", permission: `navbar:Workspace:Contacts` },

        // eCommerce
        { type: 'parent', title: "eCommerce", url: baseEcommercePath, icon: "shopping-cart", category: "eCommerce", permission: `navbar:eCommerce:Parent` },
        { type: 'child', title: "Dashboard", url: baseEcommercePath, icon: "layout-dashboard", category: "eCommerce", permission: `navbar:eCommerce:Dashboard` },
        { type: 'child', title: "Orders", url: `${baseEcommercePath}/orders`, icon: "shopping-bag", category: "eCommerce", permission: `navbar:eCommerce:Orders` },
        { type: 'child', title: "Products", url: `${baseEcommercePath}/products`, icon: "package", category: "eCommerce", permission: `navbar:eCommerce:Products` },
        { type: 'child', title: "Abandoned", url: `${baseEcommercePath}/abandoned`, icon: "shopping-cart", category: "eCommerce", permission: `navbar:eCommerce:Abandoned` },
        { type: 'child', title: "Settings", url: `${baseEcommercePath}/settings`, icon: "settings", category: "eCommerce", permission: `navbar:eCommerce:Settings` },

        // WHATSAPP Cloud Api (KonnectX)
        { type: 'parent', title: "KonnectX", url: baseWhatsappCloudApiPath, icon: "message-circle-more", category: "konnectx", permission: `navbar:KonnectX:Parent` },
        { type: 'child', title: "Dashboard", url: baseWhatsappCloudApiPath, icon: "message-circle-more", category: "konnectx", permission: `navbar:KonnectX:Dashboard` },
        { type: 'child', title: "Chats", url: `${baseWhatsappCloudApiPath}/chats`, icon: "message-square", category: "konnectx", permission: `navbar:KonnectX:Chats` },
        { type: 'child', title: "Contacts", url: `${baseWhatsappCloudApiPath}/contacts`, icon: "users", category: "konnectx", permission: `navbar:KonnectX:Contacts` },
        { type: 'child', title: "Templates", url: `${baseWhatsappCloudApiPath}/template`, icon: "zap", category: "konnectx", permission: `navbar:KonnectX:Templates` },
        { type: 'child', title: "Campaigns", url: `${baseWhatsappCloudApiPath}/campaigns`, icon: "megaphone", category: "konnectx", permission: `navbar:KonnectX:Campaigns` },
        { type: 'child', title: "Flows", url: `${baseWhatsappCloudApiPath}/flows`, icon: "megaphone", category: "konnectx", permission: `navbar:KonnectX:Flows` },
        { type: 'child', title: "Analytics", url: `${baseWhatsappCloudApiPath}/analytics`, icon: "line-chart", category: "konnectx", permission: `navbar:KonnectX:Analytics` },
        { type: 'child', title: "Agents", url: `${baseWhatsappCloudApiPath}/agents`, icon: "bot", category: "konnectx", permission: `navbar:KonnectX:Agent` },
        { type: 'child', title: "AI Assistant", url: `${baseWhatsappCloudApiPath}/assistant`, icon: "sparkles", category: "konnectx", permission: `navbar:KonnectX:Assistant` },
        { type: 'child', title: "Chatbot", url: `${baseWhatsappCloudApiPath}/chatbot`, icon: "message-square-text", category: "konnectx", permission: `navbar:KonnectX:Chatbot` },
        { type: 'child', title: "Usage & billing", url: `${baseWhatsappCloudApiPath}/settings?tab=billing`, icon: "credit-card", category: "konnectx", permission: `navbar:KonnectX:Billing` },
        { type: 'child', title: "Docs", url: `${baseWhatsappCloudApiPath}/docs`, icon: "book-open-text", category: "konnectx", permission: `navbar:KonnectX:Docs` },
        { type: 'child', title: "Settings", url: `${baseWhatsappCloudApiPath}/settings`, icon: "settings-2", category: "konnectx", permission: `navbar:KonnectX:Settings` },


        { type: 'parent', title: "FlowGenix", url: baseFlowgenixPath, icon: "bot-message-square", category: "konnectxv2", permission: `navbar:KonnectXv2:Parent` },
        { type: 'child', title: "Dashboard", url: baseFlowgenixPath, icon: "bar-chart-3", category: "konnectxv2", permission: `navbar:KonnectXv2:Dashboard` },


        // Document Manager
        { type: 'parent', title: "Documents", url: basePath, icon: "file", category: "documents", permission: `navbar:Documents:Parent` },
        { type: 'child', title: "Dashboard", url: baseDocPath, icon: "layout-grid", category: "documents", permission: `navbar:Documents:Dashboard` },
        { type: 'child', title: "Files", url: `${baseDocPath}/files`, icon: "files", category: "documents", permission: `navbar:Documents:Files` },
        { type: 'child', title: "Folders", url: `${baseDocPath}/folders`, icon: "folder", category: "documents", permission: `navbar:Documents:Folders` },
        { type: 'child', title: "Uploads", url: `${baseDocPath}/uploads`, icon: "upload-cloud", category: "documents", permission: `navbar:Documents:Uploads` },
        { type: 'child', title: "Trash", url: `${baseDocPath}/trash`, icon: "trash-2", category: "documents", permission: `navbar:Documents:Trash` },

        // Applicant tracking system
        { type: 'parent', title: "ATS Management", url: baseAtsPath, icon: "user", category: "ats", permission: `navbar:ATS:Parent` },
        { type: 'child', title: "Dashboard", url: baseAtsPath, icon: "layout-grid", category: "ats", permission: `navbar:ATS:Dashboard` },
        { type: 'child', title: "Jobs", url: `${baseAtsPath}/jobs`, icon: "briefcase", category: "ats", permission: `navbar:ATS:Jobs` },
        { type: 'child', title: "Candidates", url: `${baseAtsPath}/candidates`, icon: "user-search", category: "ats", permission: `navbar:ATS:Candidates` },
        { type: 'child', title: "Pipeline", url: `${baseAtsPath}/pipeline`, icon: "git-merge", category: "ats", permission: `navbar:ATS:Pipeline` },

        // flowbyte
        { type: 'parent', title: "FlowByte", url: baseFlowbytePath, icon: "workflow", category: "flowbyte", permission: `navbar:FlowByte:Parent` },
        { type: 'child', title: "Workflows", url: baseFlowbytePath, icon: "workflow", category: "flowbyte", permission: `navbar:FlowByte:Workflows` },
        { type: 'child', title: "Executions", url: `${baseFlowbytePath}/executions`, icon: "activity", category: "flowbyte", permission: `navbar:FlowByte:Executions` },
        { type: 'child', title: "Credentials", url: `${baseFlowbytePath}/credentials`, icon: "key-round", category: "flowbyte", permission: `navbar:FlowByte:Credentials` },
        { type: 'child', title: "Templates", url: `${baseFlowbytePath}/templates`, icon: "layout-template", category: "flowbyte", permission: `navbar:FlowByte:Templates` },
        { type: 'child', title: "Settings", url: `${baseFlowbytePath}/settings`, icon: "settings-2", category: "flowbyte", permission: `navbar:FlowByte:Settings` },

        // Productivity Manager
        { type: 'parent', title: "Productivity", url: baseProductivityPath, icon: "folder-kanban", category: "productivity", permission: `navbar:Productivity:Parent` },
        { type: 'child', title: "Dashboard", url: `${baseProductivityPath}/`, icon: "layout-grid", category: "productivity", permission: `navbar:Productivity:Dashboard` },
        { type: 'child', title: "Kanban", url: `${baseProductivityPath}/kanban`, icon: "columns-3", category: "productivity", permission: `navbar:Productivity:Kanban` },
        { type: 'child', title: "Mailbox", url: `${baseProductivityPath}/mailbox`, icon: "mail", category: "productivity", permission: `navbar:Productivity:Mailbox` },
        { type: 'child', title: "Message", url: `${baseProductivityPath}/message`, icon: "message-square-more", category: "productivity", permission: `navbar:Productivity:Message` },

        // AI Agent
        { type: 'parent', title: "AI Agent", url: `${baseAgentPath}/`, icon: "brain", category: "agent", permission: `navbar:Agent:Parent` },

        // Miscellaneous
        { type: 'parent', title: "Miscellaneous", url: baseMiscellaneousPath, icon: "blocks", category: "miscellaneous", permission: `navbar:Miscellaneous:Parent` },
        { type: 'child', title: "Dashboard", url: `${baseMiscellaneousPath}/`, icon: "layout-grid", category: "miscellaneous", permission: `navbar:Miscellaneous:Dashboard` },
        { type: 'child', title: "Quotation", url: `${baseMiscellaneousPath}/quotation`, icon: "file-spreadsheet", category: "miscellaneous", permission: `navbar:Miscellaneous:Quotation` },
        { type: 'child', title: "Lead Generation", url: `${baseMiscellaneousPath}/leads`, icon: "user-plus", category: "miscellaneous", permission: `navbar:Miscellaneous:Leads` },
        { type: 'child', title: "Lead Generation v-2", url: `${baseMiscellaneousPath}/leads-v2`, icon: "user-check", category: "miscellaneous", permission: `navbar:Miscellaneous:LeadsV2` },

        // System
        { type: 'parent', title: "System", url: basePath, icon: "monitor-cog", category: "system", permission: `navbar:System:Parent` },
        { type: 'child', title: "Access Control", url: `${systemPath}/access`, icon: "shield-check", category: "system", permission: `navbar:System:AccessControl` },
        { type: 'child', title: "Credentials", url: `${systemPath}/credential`, icon: "key-square", category: "system", permission: `navbar:System:Credentials` },
        { type: 'child', title: "Logs", url: `${systemPath}/log`, icon: "scroll-text", category: "system", permission: `navbar:System:Logs` },
        { type: 'child', title: "Mailer", url: `${systemPath}/mailer`, icon: "send", category: "system", permission: `navbar:System:Mailer` },
        { type: 'child', title: "Cron Jobs", url: `${systemPath}/cron`, icon: "timer", category: "system", permission: `navbar:System:CronJobs` },
        { type: 'child', title: "Settings", url: `${systemPath}/setting`, icon: "settings-2", category: "system", permission: `navbar:System:Settings` },
    ];
};
