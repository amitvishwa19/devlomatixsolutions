


export async function WaitForElementExecutor(enviorment) {
    //console.log('@@ PageToHtmlExecutor')
    try {
        const selector = enviorment.getInput('Selector')
        if (!selector) {
            enviorment.log.error('Input selector not defined')
        }

        const visibility = enviorment.getInput('Visibility')
        if (!visibility) {
            enviorment.log.error('Input visibility not defined')
        }

        await enviorment.getPage().waitForSelector(selector, {
            visible: visibility === 'visible',
            hidden: visibility === 'hidden'
        })

        enviorment.log.info(`Element ${selector} became: ${visibility}`)

        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
} 