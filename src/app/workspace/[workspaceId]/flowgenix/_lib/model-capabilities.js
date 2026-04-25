const RULES = [
  { cap: "thinking", re: /(thinking|reason|r1|o1|o3|o4|deepseek-r|qwq|reflection)/i },
  { cap: "coding", re: /(code|coder|codestral|deepseek-?v?2?\.?\d?-coder|qwen.*coder)/i },
  { cap: "vision", re: /(vision|vl|image|multimodal|gpt-4o|gemini|claude-3|llava|pixtral|llama.*vision)/i },
  { cap: "search", re: /(search|sonar|perplexity|online)/i },
  { cap: "long-ctx", re: /(128k|200k|256k|1m|long|gemini-1\.5|gemini-2)/i },
];

export function inferCapabilities(m) {
  const hay = `${m.model} ${m.label} ${m.strengths ?? ""}`;
  const caps = new Set();
  for (const r of RULES) if (r.re.test(hay)) caps.add(r.cap);
  return [...caps];
}
