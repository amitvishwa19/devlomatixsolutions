import puppeteer from 'puppeteer';
import { WaitFor } from '../../_lib/waitFor';

export async function LaunchBrowserExecutor(enviorment) {

    try {
        //const websiteUrl = enviorment.inputs['Website URL']
        //console.log('@@ENV', JSON.stringify(enviorment, null, 4), 'websiteUrl', websiteUrl)

        const websiteUrl = enviorment.getInput('Website URL')
        //console.log('@@ENV', 'websiteUrl', websiteUrl)


        const browser = await puppeteer.launch({
            headless: false //for testing
        })

        enviorment.setBrowser(browser)

        //await WaitFor(3000)
        //await browser.close()
        enviorment.log.success('Browser launched successfully')
        const page = await browser.newPage()

        console.log('@@page', page)

        await page.goto(websiteUrl)
        enviorment.setPage(page)
        enviorment.log.info(`Open page  at: ${websiteUrl}`)

        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
    // console.log('@ Running launch browser executor')
    // return true
}