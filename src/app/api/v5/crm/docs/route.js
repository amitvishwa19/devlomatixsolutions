import { NextResponse } from "next/server";
import { apiSuccess } from "../_lib/response";

export const dynamic = "force-dynamic";

/**
 * GET /api/v5/crm/docs
 * Interactive OpenAPI Specification & Endpoint Catalog for Devlomatix CRM API v5
 */
export async function GET() {
    const apiSpec = {
        openapi: "3.1.0",
        info: {
            title: "Devlomatix CRM External API Suite v5",
            version: "5.0.0",
            description: "Enterprise CRM REST API with unified `usertoken` authentication, FlowGenix AI Intelligence, FlowForge Automation triggers, PayFlow 1-Click Invoicing, and KonnectX WhatsApp Cloud integration."
        },
        authentication: {
            type: "Encrypted User Token",
            supportedHeaders: [
                "usertoken: <token>",
                "user-token: <token>",
                "x-user-token: <token>",
                "authorization: Bearer <token>"
            ],
            queryParamFallback: "?usertoken=<token>"
        },
        endpoints: [
            {
                module: "Deals & Pipelines",
                path: "/api/v5/crm/deals",
                method: "GET",
                description: "List CRM deals with optional search, pipeline filtering, stage filtering, and pagination.",
                queryParams: ["page", "limit", "search", "pipelineId", "stageId", "ownerId", "workspaceId"]
            },
            {
                module: "Deals & Pipelines",
                path: "/api/v5/crm/deals",
                method: "POST",
                description: "Create a new CRM deal. Auto-resolves default pipeline and stage if omitted.",
                body: {
                    title: "string (required)",
                    value: "number (optional)",
                    currency: "string (default: 'INR')",
                    pipelineId: "string (optional)",
                    stageId: "string (optional)",
                    contactId: "string (optional)",
                    accountId: "string (optional)",
                    priority: "LOW | MEDIUM | HIGH | URGENT",
                    expectedClose: "ISO string (optional)",
                    notes: "string (optional)",
                    tags: "array of strings (optional)"
                }
            },
            {
                module: "Deals & Pipelines",
                path: "/api/v5/crm/deals/:dealId",
                method: "GET",
                description: "Retrieve a single deal with pipeline, stage, contact, account, and activity history."
            },
            {
                module: "Deals & Pipelines",
                path: "/api/v5/crm/deals/:dealId",
                method: "PATCH",
                description: "Update deal metadata (title, value, priority, expected close, notes, tags)."
            },
            {
                module: "Deals & Pipelines",
                path: "/api/v5/crm/deals/:dealId",
                method: "DELETE",
                description: "Delete a CRM deal."
            },
            {
                module: "Deals & Pipelines",
                path: "/api/v5/crm/deals/:dealId/stage",
                method: "POST",
                description: "Transition a deal to a new stage and trigger automated FlowForge workflow webhooks.",
                body: {
                    stageId: "string (required)"
                }
            },
            {
                module: "Commercial & Invoicing",
                path: "/api/v5/crm/deals/:dealId/quotation",
                method: "POST",
                description: "Generate a commercial quotation PDF / document for a deal with line items.",
                body: {
                    items: "array of { description, quantity, rate, amount }",
                    notes: "string (optional)",
                    validUntil: "ISO string (optional)"
                }
            },
            {
                module: "Commercial & Invoicing",
                path: "/api/v5/crm/deals/:dealId/invoice",
                method: "POST",
                description: "1-Click PayFlow invoice issuance for won deals with payment link generation.",
                body: {
                    items: "array of { description, quantity, rate, amount }",
                    dueDate: "ISO string (optional)",
                    taxRate: "number (optional)",
                    discount: "number (optional)"
                }
            },
            {
                module: "Contacts (People)",
                path: "/api/v5/crm/contacts",
                method: "GET",
                description: "Query CRM contacts with search, tag filters, account filters, and pagination."
            },
            {
                module: "Contacts (People)",
                path: "/api/v5/crm/contacts",
                method: "POST",
                description: "Create a new CRM contact with duplicate detection and optional FlowForge automation.",
                body: {
                    name: "string (required)",
                    phone: "string (required for WhatsApp integration)",
                    email: "string (optional)",
                    accountId: "string (optional)",
                    jobTitle: "string (optional)",
                    department: "string (optional)",
                    tags: "array of strings (optional)"
                }
            },
            {
                module: "Contacts (People)",
                path: "/api/v5/crm/contacts/:contactId",
                method: "GET | PATCH | DELETE",
                description: "Read, update, or delete a single CRM contact."
            },
            {
                module: "Contacts & Messaging",
                path: "/api/v5/crm/contacts/:contactId/whatsapp",
                method: "POST",
                description: "Send WhatsApp message via KonnectX Cloud API and log to CRM timeline.",
                body: {
                    message: "string (required)",
                    templateName: "string (optional)",
                    dealId: "string (optional)"
                }
            },
            {
                module: "Accounts (Companies)",
                path: "/api/v5/crm/accounts",
                method: "GET | POST",
                description: "List and create company accounts."
            },
            {
                module: "Accounts (Companies)",
                path: "/api/v5/crm/accounts/:accountId",
                method: "GET | PATCH | DELETE",
                description: "Read, update, or delete a company account."
            },
            {
                module: "Pipelines & Stages",
                path: "/api/v5/crm/pipelines",
                method: "GET | POST",
                description: "Manage custom deal pipelines and stages with win probability configuration."
            },
            {
                module: "Tasks & Follow-ups",
                path: "/api/v5/crm/tasks",
                method: "GET | POST",
                description: "List and schedule follow-up tasks linked to deals and contacts."
            },
            {
                module: "Tasks & Follow-ups",
                path: "/api/v5/crm/tasks/:taskId",
                method: "PATCH | DELETE",
                description: "Update task completion status or delete task."
            },
            {
                module: "Activity Stream",
                path: "/api/v5/crm/activities",
                method: "GET | POST",
                description: "Read audit timeline and log calls, meetings, notes, and touchpoints."
            },
            {
                module: "Analytics & Forecasting",
                path: "/api/v5/crm/analytics/forecast",
                method: "GET",
                description: "Calculate expected pipeline revenue, commit floor, best-case scenario, and conversion rates."
            },
            {
                module: "Analytics & Forecasting",
                path: "/api/v5/crm/analytics/leaderboard",
                method: "GET",
                description: "Team sales leaderboard, rep quota attainment, and activity volume breakdown."
            },
            {
                module: "Data Ingestion & Sync",
                path: "/api/v5/crm/import/bulk",
                method: "POST",
                description: "Bulk import Contacts, Accounts, and Deals with validation and deduplication.",
                body: {
                    rows: "array of contact & deal objects",
                    options: "{ skipDuplicates, autoCreateDeals, pipelineId, stageId }"
                }
            },
            {
                module: "Data Ingestion & Sync",
                path: "/api/v5/crm/import/whatsapp-sync",
                method: "POST",
                description: "1-Click KonnectX WhatsApp chat synchronization into CRM contacts and timelines."
            },
            {
                module: "FlowGenix AI Sales Intelligence",
                path: "/api/v5/crm/copilot/score",
                method: "POST",
                description: "FlowGenix AI Deal Health, Momentum, and Win Probability scoring.",
                body: {
                    dealId: "string (required)"
                }
            },
            {
                module: "FlowGenix AI Sales Intelligence",
                path: "/api/v5/crm/copilot/chat",
                method: "POST",
                description: "Interactive AI Sales Copilot strategy advisory chat with real-time pipeline context.",
                body: {
                    message: "string (required)",
                    chatHistory: "array of { role, content } (optional)"
                }
            }
        ]
    };

    return apiSuccess(apiSpec);
}
