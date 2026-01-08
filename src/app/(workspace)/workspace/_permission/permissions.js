export const PERMISSIONS = {
    DASHBOARD: {
        VIEW: "dashboard.view",
    },

    WORKFLOW: {
        VIEW: "workflow.view",
        CREATE: "workflow.create",
        EDIT: "workflow.edit",
        DELETE: "workflow.delete",
    },

    APPOINTMENTS: {
        VIEW: "appointments.view",
        CREATE: "appointments.create",
        EDIT: "appointments.edit",
        CANCEL: "appointments.cancel",
    },

    CALENDAR: {
        VIEW: "calendar.view",
        MANAGE: "calendar.manage",
    },

    KANBAN: {
        VIEW: "kanban.view",
        CREATE: "kanban.create",
        EDIT: "kanban.edit",
        DELETE: "kanban.delete",
    },

    DOCUMENTS: {
        VIEW: "documents.view",
        UPLOAD: "documents.upload",
        EDIT: "documents.edit",
        DELETE: "documents.delete",
    },

    ARTICLES: {
        VIEW: "articles.view",
        CREATE: "articles.create",
        EDIT: "articles.edit",
        DELETE: "articles.delete",
        PUBLISH: "articles.publish",
    },

    TAXONOMY: {
        VIEW: "taxonomy.view",
        CREATE: "taxonomy.create",
        EDIT: "taxonomy.edit",
        DELETE: "taxonomy.delete",
    },

    PATIENTS: {
        VIEW: "patients.view",
        CREATE: "patients.create",
        EDIT: "patients.edit",
        DELETE: "patients.delete",
    },

    PRESCRIPTIONS: {
        VIEW: "prescriptions.view",
        CREATE: "prescriptions.create",
        EDIT: "prescriptions.edit",
        CANCEL: "prescriptions.cancel",
    },

    SERVICES: {
        VIEW: "services.view",
        CREATE: "services.create",
        EDIT: "services.edit",
        DELETE: "services.delete",
    },

    LABORATORY: {
        VIEW: "laboratory.view",
        ORDER: "laboratory.order",
        UPDATE_RESULT: "laboratory.update_result",
        APPROVE: "laboratory.approve",
    },

    ROOMS_BEDS: {
        VIEW: "rooms_beds.view",
        CREATE_ROOM: "rooms_beds.create_room",
        EDIT_ROOM: "rooms_beds.edit_room",
        ASSIGN_BED: "rooms_beds.assign_bed",
        TRANSFER_BED: "rooms_beds.transfer_bed",
    },

    INVENTORY: {
        VIEW: "inventory.view",
        CREATE: "inventory.create",
        EDIT: "inventory.edit",
        DELETE: "inventory.delete",
    },

    INVOICES: {
        VIEW: "invoices.view",
        CREATE: "invoices.create",
        EDIT: "invoices.edit",
        DELETE: "invoices.delete",
        SEND: "invoices.send",
    },

    PAYMENTS: {
        VIEW: "payments.view",
        COLLECT: "payments.collect",
        REFUND: "payments.refund",
    },

    PHARMACY: {
        VIEW: "pharmacy.view",
        DISPENSE: "pharmacy.dispense",
        RETURN: "pharmacy.return",
        MANAGE_STOCK: "pharmacy.manage_stock",
    },

    COMMUNICATION: {
        VIEW: "communication.view",
        SEND: "communication.send",
        MANAGE_TEMPLATES: "communication.manage_templates",
    },

    MAILBOX: {
        VIEW: "mailbox.view",
        SEND: "mailbox.send",
        DELETE: "mailbox.delete",
    },

    ACCESS_MANAGEMENT: {
        VIEW: "access_management.view",
        CREATE_ROLE: "access_management.create_role",
        EDIT_ROLE: "access_management.edit_role",
        DELETE_ROLE: "access_management.delete_role",
        ASSIGN_PERMISSION: "access_management.assign_permission",
    },

    SUPER_ADMIN: {
        ALL: "*",
    },
};
