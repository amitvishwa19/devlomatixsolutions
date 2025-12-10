export function createLogCollector() {
    const logs = []
    const getAll = () => logs

    // LogLevels.forEach(element => {

    // });


    return {
        getAll,
        info: (message) => logs.push({ level: 'info', message: message, timeStamp: new Date() }),
        error: (message) => logs.push({ level: 'error', message: message, timeStamp: new Date() }),
        success: (message) => logs.push({ level: 'success', message: message, timeStamp: new Date() }),
    }
}