
import * as cheerio from 'cheerio';
import { WaitFor } from '../../_lib/waitFor';

export async function ExtractTextFromElementExecutor(enviorment) {
    //console.log('@@ PageToHtmlExecutor')
    try {
        //console.log('@@enviorment', enviorment)
        //const selector = enviorment.browser
        const selector = enviorment.getInput('Selector')
        if (!selector) {
            console.error('Selector not defined')
            enviorment.log.error('Selector not defined')
            return false
        }
        const html = await enviorment.getInput('Html')
        if (!html) {
            enviorment.log.error('Html not defined')
            return false
        }

        const $ = cheerio.load(html)
        const element = $(selector)

        if (!element) {
            console.log('Element not found')
            return false
        }

        const extractedText = $.text(element)
        if (!extractedText) {
            enviorment.log.error('Element has no text')
            return false
        }

        enviorment.setOutput('Extracted text', extractedText)

        return true
    } catch (error) {
        //console.log('@error @LaunchBrowserExecutor', error)
        enviorment.log.error(error.message)
        return false
    }

} 