import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with the key from .env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    console.log("Testing Gemini API with key:", apiKey.substring(0, 10) + "...");

    // Trying the exact model string the user mentioned: "google/gemini-2.5-flash-image" 
    // and also the base model name "gemini-2.5-flash-image" just in case
    const modelNames = ["google/gemini-2.5-flash-image", "gemini-2.5-flash-image"];

    for (const modelName of modelNames) {
        console.log(`\n============== Testing model: ${modelName} ==============`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            console.log(`Sending prompt to ${modelName}...`);
            const result = await model.generateContent("generate an image of a cute cat running in a park");

            console.log("Success! Response:");
            // For text responses
            try {
                console.log(result.response.text());
            } catch (e) { }

            // In case it returns an image natively or parts differently
            if (result.response.candidates && result.response.candidates.length > 0) {
                const parts = result.response.candidates[0].content.parts;
                console.log("Parts returned:", parts.map(p => Object.keys(p)));
            }

        } catch (error) {
            console.error(`Error with model ${modelName}:`, error.message);
        }
    }
}

run();
