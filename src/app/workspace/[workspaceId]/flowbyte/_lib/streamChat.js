'use client'

const CHAT_URL = process.env.NEXT_PUBLIC_AI_CHAT_URL || "";

export async function streamChat({
  messages,
  model,
  temperature,
  systemPrompt,
  enableTools,
  onDelta,
  onDone,
  onError,
}) {
  const useStream = !enableTools; // tool-calling uses non-streaming

  if (!CHAT_URL) {
    console.error("NEXT_PUBLIC_AI_CHAT_URL is not defined");
    onError?.("AI Chat URL is not configured. Please set NEXT_PUBLIC_AI_CHAT_URL in your environment.");
    onDone();
    return;
  }

  try {
    const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // You might need an API key or auth token here depending on your backend
        },
        body: JSON.stringify({
          messages,
          model: model || "gpt-4",
          temperature: temperature ?? 0.7,
          systemPrompt,
          stream: useStream,
          enableTools: enableTools || false,
        }),
      });
      
      // Handle non-streaming (tool-calling) response
      if (!useStream && resp.ok) {
        try {
          const data = await resp.json();
          if (data.response) {
            onDelta(data.response);
          } else if (data.error) {
            onError?.(data.error);
          }
        } catch { onError?.("Failed to parse response"); }
        onDone();
        return;
      }
    
      if (!resp.ok) {
        let errMsg = "AI request failed";
        try {
          const errData = await resp.json();
          errMsg = errData.error || errMsg;
        } catch { /* ignore */ }
        onError?.(errMsg);
        onDone();
        return;
      }
    
      if (!resp.body) {
        onError?.("No response body");
        onDone();
        return;
      }
    
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
    
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
    
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
    
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
    
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            onDone();
            return;
          }
    
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    
      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) onDelta(content);
          } catch { /* ignore */ }
        }
      }
    
      onDone();
  } catch (error) {
    onError?.(error.message || "An unexpected error occurred during chat streaming.");
    onDone();
  }
}
