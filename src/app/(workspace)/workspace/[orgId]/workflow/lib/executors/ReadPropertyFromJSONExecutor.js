


export async function ReadPropertyFromJSONExecutor(enviorment) {
    console.log('@@ ReadPropertyFromJSONExecutor')
    try {
        const jsonData = enviorment.getInput('JSON')
        console.log('@jsonReadPropertyFromJSONExecutorData-enviorment', enviorment, jsonData)
        if (!jsonData) {
            enviorment.log.error('Input JSON data not defined')
        }

        const propertyName = enviorment.getInput('Property Name')
        if (!propertyName) {
            enviorment.log.error('Input property name not defined')
        }

        const json = JSON.parse(jsonData)
        const propertyValue = json[propertyName]
        if (!propertyValue) {
            enviorment.log.error('Property not found')
            return false
        }

        enviorment.setOutput('Property value', propertyName)

        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
} 