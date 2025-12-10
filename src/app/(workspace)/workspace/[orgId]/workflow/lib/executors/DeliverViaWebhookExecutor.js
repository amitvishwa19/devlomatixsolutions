


export async function DeliverViaWebhookExecutor(enviorment) {
    //console.log('@@ PageToHtmlExecutor')
    try {


        const targetURL = enviorment.getInput('Target URL')
        if (!targetURL) {
            enviorment.log.error('Target URL not defined')
        }

        const body = enviorment.getInput('Body')
        if (!targetURL) {
            enviorment.log.error('Body not defined')
        }


        const response = await fetch(targetURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const statusCode = response.status
        if (statusCode !== 200) {
            enviorment.log.error(`Status code ${statusCode}`)
            return false
        }

        const responseBody = await response.json()
        enviorment.log.info(JSON.stringify(responseBody, null, 4))
        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
} 