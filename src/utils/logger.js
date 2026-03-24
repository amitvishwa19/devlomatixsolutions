import axios from "./axios";

/**
 * Client-Side System Logger
 * Reports events to the backend SystemLog database
 */
export const clientLogger = {
    async log(workspaceId, level, type, message, details = null) {
        if (!workspaceId) return;
        try {
            await axios.post(`/api/workspace/${workspaceId}/system/logs`, {
                level,
                type,
                message,
                details
            });
        } catch (error) {
            // Quietly fail on client to not disrupt UX
            console.warn("[CLIENT_LOGGER_REPORT_FAIL]", error);
        }
    },

    async info(workspaceId, message, details = null, type = 'SYSTEM') {
        return this.log(workspaceId, 'INFO', type, message, details);
    },

    async error(workspaceId, message, details = null, type = 'SYSTEM') {
        return this.log(workspaceId, 'ERROR', type, message, details);
    },

    async success(workspaceId, message, details = null, type = 'SYSTEM') {
        return this.log(workspaceId, 'SUCCESS', type, message, details);
    },

    async warn(workspaceId, message, details = null, type = 'SYSTEM') {
        return this.log(workspaceId, 'WARNING', type, message, details);
    }
};
