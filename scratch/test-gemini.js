import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
    const apiKey = 'AIzaSyCnCTnfS5vtk6aWZkm-VIit3oBXUVUMREg'; 
    const modelName = 'gemini-2.5-flash';
    const prompt = 'Hello, reply with "Success"';

    console.log(`Testing model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("Result:", response.text());
    } catch (err) {
        console.error("SDK Error:", err.message);
        
        console.log("Trying direct fetch...");
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const resData = await response.json();
            console.log("Direct API Response:", JSON.stringify(resData, null, 2));
        } catch (fetchErr) {
            console.error("Fetch Error:", fetchErr.message);
        }
    }
}

test();
