/**
 * Navigation configuration for the application Sidebar and Access Control.
 * This file serves as the single source of truth for the application's menu structure.
 */

export const getSidebarItems = (workspaceId) => {
    const basePath = `/workspace/${workspaceId}`;
    const baseWhatsappCloudApiPath = `${basePath}/wa-cloud-api`;
    const baseWhatsappCloudApiPathv2 = `${basePath}/wa-cloud-api-v2`;
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

    return [
        // DASHBOARD
        { type: 'parent', title: "Workspace", url: basePath, icon: "layout-dashboard", category: "Workspace", permission: `navbar:Workspace:Home` },
        { type: 'child', title: "Dashboard", url: basePath, category: "Workspace", permission: `navbar:Workspace:Dashboard` },
        { type: 'child', title: "Article", url: `${basePath}/article`, category: "Workspace", permission: `navbar:Workspace:Article` },
        { type: 'child', title: "Category", url: `${basePath}/category`, category: "Workspace", permission: `navbar:Workspace:Category` },
        { type: 'child', title: "Contacts", url: `${basePath}/contact`, category: "Workspace", permission: `navbar:Workspace:Contacts` },

        // eCommerce
        { type: 'parent', title: "eCommerce", url: baseEcommercePath, icon: "shopping-cart", category: "eCommerce", permission: `navbar:eCommerce:Parent` },
        { type: 'child', title: "Dashboard", url: baseEcommercePath, category: "eCommerce", permission: `navbar:eCommerce:Dashboard` },
        { type: 'child', title: "Orders", url: `${baseEcommercePath}/orders`, category: "eCommerce", permission: `navbar:eCommerce:Orders` },
        { type: 'child', title: "Products", url: `${baseEcommercePath}/products`, category: "eCommerce", permission: `navbar:eCommerce:Products` },
        { type: 'child', title: "Abandoned", url: `${baseEcommercePath}/abandoned`, category: "eCommerce", permission: `navbar:eCommerce:Abandoned` },
        { type: 'child', title: "Settings", url: `${baseEcommercePath}/settings`, category: "eCommerce", permission: `navbar:eCommerce:Settings` },

        // WHATSAPP Cloud Api (KonnectX)
        { type: 'parent', title: "KonnectX", url: baseWhatsappCloudApiPath, icon: "bot-message-square", category: "konnectx", permission: `navbar:KonnectX:Parent` },
        { type: 'child', title: "Dashboard", url: baseWhatsappCloudApiPath, icon: "bar-chart-3", category: "konnectx", permission: `navbar:KonnectX:Dashboard` },
        { type: 'child', title: "Chats", url: `${baseWhatsappCloudApiPath}/chats`, icon: "message-square", category: "konnectx", permission: `navbar:KonnectX:Chats` },
        { type: 'child', title: "Contacts", url: `${baseWhatsappCloudApiPath}/contacts`, icon: "users", category: "konnectx", permission: `navbar:KonnectX:Contacts` },
        { type: 'child', title: "Templates", url: `${baseWhatsappCloudApiPath}/template`, icon: "zap", category: "konnectx", permission: `navbar:KonnectX:Templates` },
        { type: 'child', title: "Campaigns", url: `${baseWhatsappCloudApiPath}/campaigns`, icon: "megaphone", category: "konnectx", permission: `navbar:KonnectX:Campaigns` },
        { type: 'child', title: "Flows", url: `${baseWhatsappCloudApiPath}/flows`, icon: "megaphone", category: "konnectx", permission: `navbar:KonnectX:Flows` },
        { type: 'child', title: "Analytics", url: `${baseWhatsappCloudApiPath}/analytics`, icon: "bar-chart-3", category: "konnectx", permission: `navbar:KonnectX:Analytics` },
        { type: 'child', title: "Atents", url: `${baseWhatsappCloudApiPath}/agents`, icon: "zap", category: "konnectx", permission: `navbar:KonnectX:Agent` },
        { type: 'child', title: "AI Assistent", url: `${baseWhatsappCloudApiPath}/assistant`, icon: "bar-chart-3", category: "konnectx", permission: `navbar:KonnectX:Assistant` },
        { type: 'child', title: "Chatbot", url: `${baseWhatsappCloudApiPath}/chatbot`, icon: "zap", category: "konnectx", permission: `navbar:KonnectX:Chatbot` },
        { type: 'child', title: "eCommerce", url: `${baseWhatsappCloudApiPath}/ecommerce`, icon: "shopping-cart", category: "konnectx", permission: `navbar:KonnectX:eCommerce` },
        { type: 'child', title: "Settings", url: `${baseWhatsappCloudApiPath}/settings`, icon: "settings", category: "konnectx", permission: `navbar:KonnectX:Settings` },


        // WHATSAPP Cloud Api (KonnectX V-2)
        { type: 'parent', title: "KonnectX V-2", url: baseWhatsappCloudApiPathv2, icon: "bot-message-square", category: "konnectxv2", permission: `navbar:KonnectXv2:Parent` },
        { type: 'child', title: "Dashboard", url: baseWhatsappCloudApiPathv2, icon: "bar-chart-3", category: "konnectxv2", permission: `navbar:KonnectXv2:Dashboard` },
        { type: 'child', title: "Analytics", url: `${baseWhatsappCloudApiPathv2}/analytics`, icon: "line-chart", category: "konnectxv2", permission: `navbar:KonnectXv2:Analytics` },
        { type: 'child', title: "Inbox", url: `${baseWhatsappCloudApiPathv2}/inbox`, icon: "inbox", category: "konnectxv2", permission: `navbar:KonnectXv2:Inbox` },
        { type: 'child', title: "Stream", url: `${baseWhatsappCloudApiPathv2}/stream`, icon: "activity", category: "konnectxv2", permission: `navbar:KonnectXv2:Stream` },
        { type: 'child', title: "Messages", url: `${baseWhatsappCloudApiPathv2}/messages`, icon: "messages-square", category: "konnectxv2", permission: `navbar:KonnectXv2:Messages` },
        { type: 'child', title: "Send", url: `${baseWhatsappCloudApiPathv2}/send`, icon: "message-square", category: "konnectxv2", permission: `navbar:KonnectXv2:Send` },
        { type: 'child', title: "Contacts", url: `${baseWhatsappCloudApiPathv2}/contacts`, icon: "contact-round", category: "konnectxv2", permission: `navbar:KonnectXv2:Contacts` },
        { type: 'child', title: "Segments", url: `${baseWhatsappCloudApiPathv2}/segments`, icon: "filter", category: "konnectxv2", permission: `navbar:KonnectXv2:Segments` },
        { type: 'child', title: "Templates", url: `${baseWhatsappCloudApiPathv2}/template`, icon: "book-template", category: "konnectxv2", permission: `navbar:KonnectXv2:Templates` },
        { type: 'child', title: "Flows", url: `${baseWhatsappCloudApiPathv2}/flows`, icon: "clipboard-list", category: "konnectxv2", permission: `navbar:KonnectXv2:Flows` },
        { type: 'child', title: "Automation", url: `${baseWhatsappCloudApiPathv2}/automation`, icon: "bot", category: "konnectxv2", permission: `navbar:KonnectXv2:Automation` },
        { type: 'child', title: "Campaigns", url: `${baseWhatsappCloudApiPathv2}/campaigns`, icon: "rocket", category: "konnectxv2", permission: `navbar:KonnectXv2:Campaigns` },
        { type: 'child', title: "Media", url: `${baseWhatsappCloudApiPathv2}/media`, icon: "image", category: "konnectxv2", permission: `navbar:KonnectXv2:Media` },
        { type: 'child', title: "Usage & billing", url: `${baseWhatsappCloudApiPathv2}/billing`, icon: "wallet", category: "konnectxv2", permission: `navbar:KonnectXv2:Billing` },
        { type: 'child', title: "Docs", url: `${baseWhatsappCloudApiPathv2}/docs`, icon: "book-open", category: "konnectxv2", permission: `navbar:KonnectXv2:Docs` },
        { type: 'child', title: "Settings", url: `${baseWhatsappCloudApiPathv2}/settings`, icon: "settings", category: "konnectxv2", permission: `navbar:KonnectXv2:Settings` },



        // Document Manager
        { type: 'parent', title: "Documents", url: basePath, icon: "file", category: "documents", permission: `navbar:Documents:Parent` },
        { type: 'child', title: "Dashboard", url: baseDocPath, icon: "bar-chart-3", category: "documents", permission: `navbar:Documents:Dashboard` },
        { type: 'child', title: "Files", url: `${baseDocPath}/files`, icon: "bar-chart-3", category: "documents", permission: `navbar:Documents:Files` },
        { type: 'child', title: "Folders", url: `${baseDocPath}/folders`, icon: "bar-chart-3", category: "documents", permission: `navbar:Documents:Folders` },
        { type: 'child', title: "Uploads", url: `${baseDocPath}/uploads`, icon: "bar-chart-3", category: "documents", permission: `navbar:Documents:Uploads` },
        { type: 'child', title: "Trash", url: `${baseDocPath}/trash`, icon: "trash", category: "documents", permission: `navbar:Documents:Trash` },

        // Applicant tracking system
        { type: 'parent', title: "ATS Management", url: baseAtsPath, icon: "user", category: "ats", permission: `navbar:ATS:Parent` },
        { type: 'child', title: "Dashboard", url: baseAtsPath, icon: "bar-chart-3", category: "ats", permission: `navbar:ATS:Dashboard` },
        { type: 'child', title: "Jobs", url: `${baseAtsPath}/jobs`, icon: "bar-chart-3", category: "ats", permission: `navbar:ATS:Jobs` },
        { type: 'child', title: "Candidates", url: `${baseAtsPath}/candidates`, icon: "bar-chart-3", category: "ats", permission: `navbar:ATS:Candidates` },
        { type: 'child', title: "Pipeline", url: `${baseAtsPath}/pipeline`, icon: "bar-chart-3", category: "ats", permission: `navbar:ATS:Pipeline` },

        // flowbyte
        { type: 'parent', title: "FlowByte", url: baseFlowbytePath, icon: "workflow", category: "flowbyte", permission: `navbar:FlowByte:Parent` },
        { type: 'child', title: "Workflows", url: baseFlowbytePath, icon: "bar-chart-3", category: "flowbyte", permission: `navbar:FlowByte:Workflows` },
        { type: 'child', title: "Executions", url: `${baseFlowbytePath}/executions`, icon: "bar-chart-3", category: "flowbyte", permission: `navbar:FlowByte:Executions` },
        { type: 'child', title: "Credentials", url: `${baseFlowbytePath}/credentials`, icon: "bar-chart-3", category: "flowbyte", permission: `navbar:FlowByte:Credentials` },
        { type: 'child', title: "Templates", url: `${baseFlowbytePath}/templates`, icon: "bar-chart-3", category: "flowbyte", permission: `navbar:FlowByte:Templates` },
        { type: 'child', title: "Settings", url: `${baseFlowbytePath}/settings`, icon: "bar-chart-3", category: "flowbyte", permission: `navbar:FlowByte:Settings` },

        // Productivity Manager
        { type: 'parent', title: "Productivity", url: baseProductivityPath, icon: "folder-kanban", category: "productivity", permission: `navbar:Productivity:Parent` },
        { type: 'child', title: "Dashboard", url: `${baseProductivityPath}/`, icon: "bar-chart-3", category: "productivity", permission: `navbar:Productivity:Dashboard` },
        { type: 'child', title: "Kanban", url: `${baseProductivityPath}/kanban`, icon: "bar-chart-3", category: "productivity", permission: `navbar:Productivity:Kanban` },
        { type: 'child', title: "Mailbox", url: `${baseProductivityPath}/mailbox`, icon: "mail", category: "productivity", permission: `navbar:Productivity:Mailbox` },
        { type: 'child', title: "Message", url: `${baseProductivityPath}/message`, icon: "bar-chart-3", category: "productivity", permission: `navbar:Productivity:Message` },

        // AI Agent
        { type: 'parent', title: "AI Agent", url: `${baseAgentPath}/`, icon: "brain", category: "agent", permission: `navbar:Agent:Parent` },

        // Miscellaneous
        { type: 'parent', title: "Miscellaneous", url: baseMiscellaneousPath, icon: "blocks", category: "miscellaneous", permission: `navbar:Miscellaneous:Parent` },
        { type: 'child', title: "Dashboard", url: `${baseMiscellaneousPath}/`, icon: "bar-chart-3", category: "miscellaneous", permission: `navbar:Miscellaneous:Dashboard` },
        { type: 'child', title: "Quotation", url: `${baseMiscellaneousPath}/quotation`, icon: "bar-chart-3", category: "miscellaneous", permission: `navbar:Miscellaneous:Quotation` },
        { type: 'child', title: "Lead Generation", url: `${baseMiscellaneousPath}/leads`, icon: "bar-chart-3", category: "miscellaneous", permission: `navbar:Miscellaneous:Leads` },
        { type: 'child', title: "Lead Generation v-2", url: `${baseMiscellaneousPath}/leads-v2`, icon: "bar-chart-3", category: "miscellaneous", permission: `navbar:Miscellaneous:LeadsV2` },

        // System
        { type: 'parent', title: "System", url: basePath, icon: "monitor-cog", category: "system", permission: `navbar:System:Parent` },
        { type: 'child', title: "Access Control", url: `${systemPath}/access`, icon: "bar-chart-3", category: "system", permission: `navbar:System:AccessControl` },
        { type: 'child', title: "Credentials", url: `${systemPath}/credential`, icon: "bar-chart-3", category: "system", permission: `navbar:System:Credentials` },
        { type: 'child', title: "Logs", url: `${systemPath}/log`, icon: "bar-chart-3", category: "system", permission: `navbar:System:Logs` },
        { type: 'child', title: "Mailer", url: `${systemPath}/mailer`, icon: "bar-chart-3", category: "system", permission: `navbar:System:Mailer` },
        { type: 'child', title: "Cron Jobs", url: `${systemPath}/cron`, icon: "bar-chart-3", category: "system", permission: `navbar:System:CronJobs` },
        { type: 'child', title: "Settings", url: `${systemPath}/setting`, icon: "bar-chart-3", category: "system", permission: `navbar:System:Settings` },
    ];
};
