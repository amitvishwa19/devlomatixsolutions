/**
 * Navigation configuration for the application Sidebar and Access Control.
 * This file serves as the single source of truth for the application's menu structure.
 */

export const getSidebarItems = (workspaceId) => {
    const basePath = `/workspace/${workspaceId}`;
    const baseWhathappPath = `${basePath}/wa`;
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
        { type: 'parent', title: "Workspace", url: basePath, icon: "layout-dashboard", category: "Workspace" },
        { type: 'child', title: "Dashboard", url: basePath, category: "Workspace" },
        { type: 'child', title: "Article", url: `${basePath}/article`, category: "Workspace" },
        { type: 'child', title: "Category", url: `${basePath}/category`, category: "Workspace" },
        { type: 'child', title: "Contacts", url: `${basePath}/contact`, category: "Workspace" },

        // eCommerce
        { type: 'parent', title: "eCommerce", url: baseEcommercePath, icon: "shopping-cart", category: "eCommerce" },
        { type: 'child', title: "Dashboard", url: baseEcommercePath, category: "eCommerce" },
        { type: 'child', title: "Orders", url: `${baseEcommercePath}/orders`, category: "eCommerce" },
        { type: 'child', title: "Products", url: `${baseEcommercePath}/products`, category: "eCommerce" },
        { type: 'child', title: "Abandoned", url: `${baseEcommercePath}/abandoned`, category: "eCommerce" },
        { type: 'child', title: "Settings", url: `${baseEcommercePath}/settings`, category: "eCommerce" },

        // WHATSAPP (KonnectX)
        { type: 'parent', title: "KonnectX", url: baseWhathappPath, icon: "bot-message-square", category: "konnectx" },
        { type: 'child', title: "Dashboard", url: baseWhathappPath, icon: "bar-chart-3", category: "konnectx" },
        { type: 'child', title: "Chats", url: `${baseWhathappPath}/chats`, icon: "message-square", category: "konnectx" },
        { type: 'child', title: "Contacts", url: `${baseWhathappPath}/contacts`, icon: "users", category: "konnectx" },
        { type: 'child', title: "Templates", url: `${baseWhathappPath}/template`, icon: "zap", category: "konnectx" },
        { type: 'child', title: "Campaigns", url: `${baseWhathappPath}/campaigns`, icon: "megaphone", category: "konnectx" },
        { type: 'child', title: "Analytics", url: `${baseWhathappPath}/analytics`, icon: "bar-chart-3", category: "konnectx" },
        { type: 'child', title: "Chatbot", url: `${baseWhathappPath}/chatbot`, icon: "zap", category: "konnectx" },
        { type: 'child', title: "eCommerce", url: `${baseWhathappPath}/ecommerce`, icon: "shopping-cart", category: "konnectx" },
        { type: 'child', title: "Settings", url: `${baseWhathappPath}/settings`, icon: "settings", category: "konnectx" },

        // Document Manager
        { type: 'parent', title: "Documents", url: basePath, icon: "file", category: "documents" },
        { type: 'child', title: "Dashboard", url: baseDocPath, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Files", url: `${baseDocPath}/files`, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Folders", url: `${baseDocPath}/folders`, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Uploads", url: `${baseDocPath}/uploads`, icon: "bar-chart-3", category: "documents" },
        { type: 'child', title: "Trash", url: `${baseDocPath}/trash`, icon: "trash", category: "documents" },

        // Applicant tracking system
        { type: 'parent', title: "ATS Management", url: baseAtsPath, icon: "user", category: "ats" },
        { type: 'child', title: "Dashboard", url: baseAtsPath, icon: "bar-chart-3", category: "ats" },
        { type: 'child', title: "Jobs", url: `${baseAtsPath}/jobs`, icon: "bar-chart-3", category: "ats" },
        { type: 'child', title: "Candidates", url: `${baseAtsPath}/candidates`, icon: "bar-chart-3", category: "ats" },
        { type: 'child', title: "Pipeline", url: `${baseAtsPath}/pipeline`, icon: "bar-chart-3", category: "ats" },

        // flowbyte
        { type: 'parent', title: "FLowByte", url: baseFlowbytePath, icon: "workflow", category: "flowbyte" },
        { type: 'child', title: "Workflows", url: baseFlowbytePath, icon: "bar-chart-3", category: "flowbyte" },
        { type: 'child', title: "Executions", url: `${baseFlowbytePath}/executions`, icon: "bar-chart-3", category: "flowbyte" },
        { type: 'child', title: "Credentials", url: `${baseFlowbytePath}/credentials`, icon: "bar-chart-3", category: "flowbyte" },
        { type: 'child', title: "Templates", url: `${baseFlowbytePath}/templates`, icon: "bar-chart-3", category: "flowbyte" },
        { type: 'child', title: "Settings", url: `${baseFlowbytePath}/settings`, icon: "bar-chart-3", category: "flowbyte" },

        // Productivity Manager
        { type: 'parent', title: "Productivity", url: baseProductivityPath, icon: "folder-kanban", category: "productivity" },
        { type: 'child', title: "Dashboard", url: `${baseProductivityPath}/`, icon: "bar-chart-3", category: "productivity" },
        { type: 'child', title: "Kanban", url: `${baseProductivityPath}/kanban`, icon: "bar-chart-3", category: "productivity" },
        { type: 'child', title: "Mailbox", url: `${baseProductivityPath}/mailbox`, icon: "mail", category: "productivity" },
        { type: 'child', title: "Message", url: `${baseProductivityPath}/message`, icon: "bar-chart-3", category: "productivity" },

        // AI Agent
        { type: 'parent', title: "AI Agent", url: `${baseAgentPath}/`, icon: "brain", category: "agent" },

        // Miscellaneous
        { type: 'parent', title: "Miscellaneous", url: baseMiscellaneousPath, icon: "blocks", category: "miscellaneous" },
        { type: 'child', title: "Dashboard", url: `${baseMiscellaneousPath}/`, icon: "bar-chart-3", category: "miscellaneous" },
        { type: 'child', title: "Quotation", url: `${baseMiscellaneousPath}/quotation`, icon: "bar-chart-3", category: "miscellaneous" },
        { type: 'child', title: "Lead Generation", url: `${baseMiscellaneousPath}/leads`, icon: "bar-chart-3", category: "miscellaneous" },
        { type: 'child', title: "Lead Generation v-2", url: `${baseMiscellaneousPath}/leads-v2`, icon: "bar-chart-3", category: "miscellaneous" },

        // System
        { type: 'parent', title: "System", url: basePath, icon: "monitor-cog", category: "system" },
        { type: 'child', title: "Access Control", url: `${systemPath}/access`, icon: "bar-chart-3", category: "system" },
        { type: 'child', title: "Credentials", url: `${systemPath}/credential`, icon: "bar-chart-3", category: "system" },
        { type: 'child', title: "Logs", url: `${systemPath}/log`, icon: "bar-chart-3", category: "system" },
        { type: 'child', title: "Mailer", url: `${systemPath}/mailer`, icon: "bar-chart-3", category: "system" },
        { type: 'child', title: "Cron Jobs", url: `${systemPath}/cron`, icon: "bar-chart-3", category: "system" },
        { type: 'child', title: "Settings", url: `${systemPath}/setting`, icon: "bar-chart-3", category: "system" },
    ];
};
