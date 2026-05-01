"use server";

export async function testOpenAIConnection(apiKey, model = "gpt-3.5-turbo") {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "hi" }],
                max_tokens: 1,
            }),
        });

        if (response.ok) {
            return { ok: true, message: "Connection successful" };
        } else {
            const err = await response.json();
            return { ok: false, message: err?.error?.message || "Invalid API key" };
        }
    } catch (error) {
        return { ok: false, message: error.message };
    }
}

export async function testAnthropicConnection(apiKey, model = "claude-3-haiku-20240307") {
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model,
                max_tokens: 1,
                messages: [{ role: "user", content: "hi" }],
            }),
        });

        if (response.ok) {
            return { ok: true, message: "Connection successful" };
        } else {
            const err = await response.json();
            return { ok: false, message: err?.error?.message || "Invalid API key" };
        }
    } catch (error) {
        return { ok: false, message: error.message };
    }
}

export async function testOpenRouterConnection(apiKey, model = "google/gemini-2.0-flash-exp:free") {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "hi" }],
                max_tokens: 1,
            }),
        });

        if (response.ok) {
            return { ok: true, message: "Connection successful" };
        } else {
            const err = await response.json();
            return { ok: false, message: err?.error?.message || "Invalid API key" };
        }
    } catch (error) {
        return { ok: false, message: error.message };
    }
}

export async function testNvidiaConnection(apiKey, model = "meta/llama-3.1-405b-instruct") {
    try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages: [{ role: "user", content: "hi" }],
                max_tokens: 50,
            }),
        });

        if (response.ok) {
            const j = await response.json();
            const reply = j.choices[0]?.message?.content || "Connection successful (no content)";
            return { ok: true, message: reply };
        } else {
            const err = await response.json();
            return { ok: false, message: err?.detail || err?.message || "Invalid API key or model" };
        }
    } catch (error) {
        return { ok: false, message: error.message };
    }
}

export async function testModelConnection(m) {
    const p = (m.provider || "").toLowerCase();
    if (p === "openai") return testOpenAIConnection(m.apiKey, m.model || m.name);
    if (p === "anthropic") return testAnthropicConnection(m.apiKey, m.model || m.name);
    if (p === "openrouter") return testOpenRouterConnection(m.apiKey, m.model || m.name);
    if (p === "nvidia") return testNvidiaConnection(m.apiKey, m.model || m.name);

    // Generic fallback for others
    try {
        const response = await fetch(m.baseUrl || m.baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${m.apiKey}`,
            },
            body: JSON.stringify({
                model: m.model || m.name,
                messages: [{ role: "user", content: "hi" }],
                max_tokens: 1,
            }),
        });
        if (response.ok) return { ok: true, message: "Connection successful" };
        return { ok: false, message: "Connection failed" };
    } catch (e) {
        return { ok: false, message: e.message };
    }
}

export async function testModelConnectionV2(m) {
    const p = (m.provider || "").toLowerCase();
    if (p !== "nvidia") {
        return { ok: false, message: "v-2 testing is currently only optimized for NVIDIA Reasoning models" };
    }

    try {
        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${m.apiKey}`,
            },
            body: JSON.stringify({
                model: m.model || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
                messages: [{ role: "user", content: "Explain 1+1 in one sentence." }],
                temperature: 0.6,
                top_p: 0.95,
                max_tokens: 1024,
                reasoning_budget: 1024,
                chat_template_kwargs: { "enable_thinking": true },
            }),
        });

        if (response.ok) {
            const j = await response.json();
            const reasoning = j.choices[0]?.message?.reasoning_content;
            const content = j.choices[0]?.message?.content;

            if (reasoning) {
                return { ok: true, message: `Reasoning OK: ${reasoning.slice(0, 50)}... | Content: ${content.slice(0, 30)}` };
            }
            return { ok: true, message: `Success (No Reasoning): ${content.slice(0, 50)}` };
        } else {
            const err = await response.json();
            return { ok: false, message: err?.detail || err?.message || "v-2 test failed" };
        }
    } catch (e) {
        return { ok: false, message: e.message };
    }
}
