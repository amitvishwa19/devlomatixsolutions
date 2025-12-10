export const TaskParamTypes = {
    STRING: 'STRING',
    BROWSER_INSTANCE: 'BROWSER_INSTANCE',
    SELECT: 'SELECT',
    CREDENTIAL: 'CREDENTIAL'
}

export const TaskType = {
    LAUNCH_BROWSER: 'LAUNCH_BROWSER',
    PAGE_TO_HTML: 'PAGE_TO_HTML',
    EXTRACT_TEXT_FROM_ELEMENT: 'EXTRACT_TEXT_FROM_ELEMENT',
    FILL_INPUT: 'FILL_INPUT',
    CLICK_ELEMENT: 'CLICK_ELEMENT',
    WAIT_FOR_ELEMENT: 'WAIT_FOR_ELEMENT',
    DELIVER_VIA_WEBHOOK: 'DELIVER_VIA_WEBHOOK',
    EXTRACT_DATA_WITH_AI: 'EXTRACT_DATA_WITH_AI',
    READ_PROPERTY_FROM_JSON: 'READ_PROPERTY_FROM_JSON'
}

export const ExecutionStatus = {
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
}

export const ExecutionPhaseStatus = {
    CREATED: 'CREATED',
    PENDING: 'PENDING',
    RUNNING: 'RUNNING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
}

export const ExecutionStatusTrigger = {
    MANUAL: 'MANUAL',
    CRON: 'CRON'
}

export const LogLevels = {
    INFO: "INFO",
    DEBUG: "DEBUG",
    ERROR: "ERROR",
    WARNING: "WARNING"

}