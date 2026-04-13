const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export type ChatMsg = { role: "user" | "assistant"; content: string };

export async function streamChat({
  messages,
  model,
  temperature,
  systemPrompt,
  enableTools,
  onDelta,
  onDone,
  onError,
}: {
  messages: ChatMsg[];
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  enableTools?: boolean;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}) {
  const useStream = !enableTools; // tool-calling uses non-streaming

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

    let newlineIndex: number;
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
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
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
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}
