
import { WaitFor } from '../../_lib/waitFor';

export async function FillInputExecutor(enviorment) {
    //console.log('@@ PageToHtmlExecutor')
    try {
        const selector = enviorment.getInput('Selector')
        if (!selector) {
            enviorment.log.error('Input selector not defined')
        }

        const value = enviorment.getInput('Value')
        if (!value) {
            enviorment.log.error('Input value not defined')
        }

        await enviorment.getPage().type(selector, value)
        //WaitFor(3000)

        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
} 