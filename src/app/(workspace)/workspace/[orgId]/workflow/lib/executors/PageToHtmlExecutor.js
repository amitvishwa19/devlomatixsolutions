
import { WaitFor } from '../../_lib/waitFor';

export async function PageToHtmlExecutor(enviorment) {
    //console.log('@@ PageToHtmlExecutor')
    try {

        const browser = enviorment.browser
        const html = await enviorment.getPage()?.content()

        //console.log('@@html', html)

        enviorment.setOutput('Html', html)
        //enviorment.log.info(`Open page  at: ${websiteUrl}`)
        enviorment.log.success(`Page to HTML success`)
        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
    // console.log('@ Running launch browser executor')
    // return true
} 