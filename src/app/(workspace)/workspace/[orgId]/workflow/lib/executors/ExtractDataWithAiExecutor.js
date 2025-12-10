import { db } from "@/lib/db"
import { symmetricDecrypt } from "@/lib/encryption"
import OpenAI from "openai"
import { GoogleGenerativeAI } from '@google/generative-ai'


export async function ExtractDataWithAiExecutor(enviorment) {
    //console.log('@@ PageToHtmlExecutor')
    try {
        const credentials = enviorment.getInput('Credentials')
        console.log('@@ExtractDataWithAiExecutor-enviorment', enviorment)
        if (!credentials) {
            enviorment.log.error('Input credentials not defined')
        }

        const prompt = enviorment.getInput('Prompt')
        if (!prompt) {
            enviorment.log.error('Input prompt not defined')
        }

        const content = enviorment.getInput('Content')
        if (!content) {
            enviorment.log.error('Input content not defined')
        }

        const credential = await db.credential.findUnique({
            where: { id: credentials }
        })
        if (!credential) {
            enviorment.log.error('credential not found')
            return false
        }

        const plainCredentialValue = symmetricDecrypt(credential.value)
        if (!plainCredentialValue) {
            enviorment.log.error('cannot decrypt credential')
            return false
        }

        const mockExtractedData = {
            userNameSelector: '#username',
            passwordSelector: '#password',
            loginSelector: 'body > div > form > input.btn.btn-primary'
        }

        // const openai = new OpenAI({
        //     apiKey: plainCredentialValue
        // })

        const genAI = new GoogleGenerativeAI(plainCredentialValue);
        //const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const prompt2 = `You are an expert tour guide. User is planning a trip to delhi for 10 days.     Create an vacation itinerary for the user based on this info.    Any other information relavant for the trip provided by user is cheap. consider this while making the plan. `;
        const result = await model.generateContent({
            "contents": [
                {
                    "role": "model",
                    "parts": { "text": "You are a webscraper helper that extracts data from HTML or text. You will be given a piece of text or HTML content as input and also the prompt with the data you have to extract.The response should always be only the extracted data as a JSON array or object, without any additional words or explanations.Analyze the input carefully and extract data  precisely based on the prompt.If no data is found, return an empty JSON array.Work only with the provided content  and ensure the output is always a valid JSON array without any surrounding text" }
                },
                {
                    "role": "user",
                    "parts": { "text": content }
                },
                {
                    "role": "user",
                    "parts": { "text": prompt }
                }
            ],
            generationConfig: { "response_mime_type": "application/json" }
        })
        const response = result.response;
        const text = response.text();
        // enviorment.log.info(text)
        // enviorment.setOutput('Extracted Data', JSON.stringify(text))

        enviorment.log.info(JSON.stringify(mockExtractedData))
        enviorment.setOutput('Extracted Data', JSON.stringify(mockExtractedData))

        return true
    } catch (error) {
        enviorment.log.error(error.message)
        return false
    }
} 