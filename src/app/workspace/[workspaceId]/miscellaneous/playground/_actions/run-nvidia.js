'use server';

import axios from 'axios';

export async function runNvidiaAction(payload) {
    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    const headers = {
        "Authorization": "Bearer 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",
        "Accept": "application/json",
        "Content-Type": "application/json"
    };

    try {
        const response = await axios.post(invokeUrl, payload, { headers });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("NVIDIA API Error:", error.response?.data || error.message);
        return { 
            success: false, 
            error: error.response?.data?.message || error.message 
        };
    }
}
