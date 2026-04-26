'use client'

const CHAT_URL = process.env.NEXT_PUBLIC_AI_CHAT_URL || "/api/v5/agent";

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}) {
  if (!CHAT_URL) {
    onError?.("AI Chat URL is not configured.");
    onDone();
    return;
  }

  try {
    // Exact same request format as the working playground
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: lastMessage,
          hashtag: false // Match playground's default
        }),
      });
      
      if (resp.ok) {
        try {
          const data = await resp.json();
          if (data.response) {
            onDelta(data.response);
          } else if (data.message) {
            onError?.(data.message);
          }
        } catch { onError?.("Failed to parse response"); }
        onDone();
        return;
      }
    
      if (!resp.ok) {
        let errMsg = "AI request failed";
        try {
          const errData = await resp.json();
          errMsg = errData.message || errMsg;
        } catch { /* ignore */ }
        onError?.(errMsg);
        onDone();
        return;
      }
  } catch (error) {
    onError?.(error.message || "An unexpected error occurred.");
    onDone();
  }
}
