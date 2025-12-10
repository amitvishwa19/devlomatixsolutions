


export async function ClickElementExecutor(enviorment) {
    //console.log('@@ PageToHtmlExecutor')
    try {
        const selector = enviorment.getInput('Selector')
        if (!selector) {
            enviorment.log.error('Input selector not defined')
        }



        await enviorment.getPage().click(selector)
        //WaitFor(3000)

        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
} 