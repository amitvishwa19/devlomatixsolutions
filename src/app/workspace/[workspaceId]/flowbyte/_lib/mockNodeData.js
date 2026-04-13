// Generates realistic mock input/output data for each node type during simulated execution

const randomId = () => Math.random().toString(36).slice(2, 10);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomEmail = () => `user${randomInt(1, 999)}@example.com`;
const randomIp = () => `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
const randomTimestamp = () => new Date(Date.now() - randomInt(0, 86400000)).toISOString();

const generators = {
  // Triggers
  schedule: () => ({
    input: {},
    output: { triggered: true, timestamp: randomTimestamp(), executionCount: randomInt(1, 500) },
  }),
  webhook: () => ({
    input: {},
    output: {
      headers: { "content-type": "application/json", "x-request-id": randomId() },
      body: { event: "item.created", data: { id: randomId(), name: "New Item" } },
      method: "POST",
      path: "/webhook/" + randomId(),
    },
  }),
  trigger: () => ({
    input: {},
    output: { triggered: true, timestamp: randomTimestamp(), source: "manual" },
  }),
  "email-trigger": () => ({
    input: {},
    output: {
      from: randomEmail(),
      subject: "Order Confirmation #" + randomInt(1000, 9999),
      date: randomTimestamp(),
      hasAttachments: Math.random() > 0.5,
    },
  }),
  "chat-trigger": () => ({
    input: {},
    output: {
      message: "Hello, can you help me with my order?",
      sessionId: randomId(),
      timestamp: randomTimestamp(),
    },
  }),
  "error-trigger": () => ({
    input: {},
    output: { errorMessage: "Connection timeout", errorCode: 504, workflow: "Data Sync", node: "HTTP Request" },
  }),

  // HTTP / API
  http: (prev) => ({
    input: { url: "https://api.example.com/data", method: "GET", headers: { Authorization: "Bearer ***" }, ...(prev || {}) },
    output: {
      statusCode: 200,
      headers: { "content-type": "application/json", "x-ratelimit-remaining": String(randomInt(10, 100)) },
      data: [
        { id: randomInt(1, 100), name: "Product A", price: randomInt(10, 500), stock: randomInt(0, 200) },
        { id: randomInt(101, 200), name: "Product B", price: randomInt(10, 500), stock: randomInt(0, 200) },
        { id: randomInt(201, 300), name: "Product C", price: randomInt(10, 500), stock: randomInt(0, 200) },
      ],
    },
  }),

  // Logic
  if: (prev) => ({
    input: { condition: "status === 200", value: prev || {} },
    output: { result: true, branch: "true", evaluatedCondition: "200 === 200" },
  }),
  switch: (prev) => ({
    input: { value: prev?.data || "active", rules: ["active", "pending", "closed"] },
    output: { matchedRule: "active", outputIndex: 0, fallthrough: false },
  }),
  filter: (prev) => ({
    input: { items: prev?.data || [{ id: 1 }, { id: 2 }, { id: 3 }], condition: "price > 100" },
    output: { kept: 2, removed: 1, items: [{ id: 1, price: 250 }, { id: 3, price: 499 }] },
  }),
  merge: () => ({
    input: { input1: [{ id: 1, name: "A" }], input2: [{ id: 1, value: 42 }] },
    output: { merged: [{ id: 1, name: "A", value: 42 }], mode: "combine", matchField: "id" },
  }),
  loop: (prev) => ({
    input: { items: prev?.data || [1, 2, 3], batchSize: 1 },
    output: { processedItems: 3, currentBatch: 3, done: true },
  }),
  wait: () => ({
    input: { duration: 5, unit: "seconds" },
    output: { waited: true, resumedAt: randomTimestamp() },
  }),

  // Data
  set: (prev) => ({
    input: { ...(prev || {}), rules: [{ field: "fullName", value: "={{$json.first}} {{$json.last}}" }] },
    output: { fullName: "John Doe", processedAt: randomTimestamp(), itemCount: randomInt(1, 50) },
  }),
  code: (prev) => ({
    input: { items: prev?.data || [{ id: 1 }], language: "JavaScript" },
    output: { result: { transformed: true, count: randomInt(1, 20), hash: randomId() }, executionTime: `${randomInt(5, 200)}ms` },
  }),

  // Communication
  email: (prev) => ({
    input: { to: randomEmail(), subject: "Notification", body: "Your order has been processed.", ...(prev || {}) },
    output: { messageId: `<${randomId()}@mail.example.com>`, accepted: [randomEmail()], response: "250 OK" },
  }),
  slack: (prev) => ({
    input: { channel: "#general", text: prev?.message || "Workflow completed successfully!", username: "n8n Bot" },
    output: { ok: true, channel: "C0123456", ts: `${Date.now() / 1000}`, messageId: randomId() },
  }),
  discord: (prev) => ({
    input: { channelId: "123456789", content: prev?.message || "Alert: New event detected" },
    output: { id: randomId(), timestamp: randomTimestamp(), channelId: "123456789" },
  }),
  telegram: (prev) => ({
    input: { chatId: randomInt(100000, 999999), text: prev?.message || "Status update" },
    output: { messageId: randomInt(1, 10000), chat: { id: randomInt(100000, 999999), type: "private" } },
  }),
  twilio: () => ({
    input: { to: "+1234567890", body: "Your verification code is 4582" },
    output: { sid: "SM" + randomId(), status: "queued", dateCreated: randomTimestamp() },
  }),

  // Database
  database: (prev) => ({
    input: { operation: "select", table: "users", where: { active: true }, ...(prev || {}) },
    output: { rows: [{ id: 1, name: "Alice", email: "alice@test.com" }, { id: 2, name: "Bob", email: "bob@test.com" }], rowCount: 2 },
  }),
  postgres: (prev) => ({
    input: { query: "SELECT * FROM orders WHERE status = 'pending'", ...(prev || {}) },
    output: {
      rows: [
        { order_id: randomInt(1000, 9999), customer: "Alice", total: randomInt(50, 500), status: "pending" },
        { order_id: randomInt(1000, 9999), customer: "Bob", total: randomInt(50, 500), status: "pending" },
      ],
      rowCount: 2, command: "SELECT",
    },
  }),
  mysql: () => ({
    input: { query: "SELECT COUNT(*) as total FROM products" },
    output: { rows: [{ total: randomInt(100, 5000) }], affectedRows: 0, changedRows: 0 },
  }),
  redis: () => ({
    input: { operation: "get", key: "session:" + randomId() },
    output: { value: JSON.stringify({ userId: randomId(), role: "admin" }), ttl: randomInt(60, 3600) },
  }),

  // Google
  "google-sheets": (prev) => ({
    input: { spreadsheetId: randomId(), range: "Sheet1!A1:D10", operation: "read", ...(prev || {}) },
    output: {
      values: [
        ["Name", "Email", "Score"],
        ["Alice", "alice@test.com", "95"],
        ["Bob", "bob@test.com", "87"],
      ],
      updatedRange: "Sheet1!A1:C3",
    },
  }),
  "google-calendar": () => ({
    input: { calendarId: "primary", timeMin: randomTimestamp() },
    output: {
      events: [
        { id: randomId(), summary: "Team Standup", start: "2024-01-15T09:00:00Z", attendees: 5 },
        { id: randomId(), summary: "Sprint Review", start: "2024-01-15T14:00:00Z", attendees: 12 },
      ],
    },
  }),
  "google-drive": () => ({
    input: { operation: "list", folderId: randomId() },
    output: {
      files: [
        { id: randomId(), name: "Report.pdf", mimeType: "application/pdf", size: randomInt(10000, 5000000) },
        { id: randomId(), name: "Data.xlsx", mimeType: "application/vnd.ms-excel", size: randomInt(5000, 100000) },
      ],
    },
  }),

  // Productivity
  notion: () => ({
    input: { databaseId: randomId(), filter: { property: "Status", select: { equals: "In Progress" } } },
    output: {
      results: [
        { id: randomId(), properties: { Name: "Feature X", Status: "In Progress", Priority: "High" } },
        { id: randomId(), properties: { Name: "Bug Fix Y", Status: "In Progress", Priority: "Medium" } },
      ],
      hasMore: false,
    },
  }),
  airtable: () => ({
    input: { baseId: randomId(), table: "Tasks", view: "Grid view" },
    output: {
      records: [
        { id: "rec" + randomId(), fields: { Name: "Task 1", Status: "Done", Assignee: "Alice" } },
        { id: "rec" + randomId(), fields: { Name: "Task 2", Status: "Todo", Assignee: "Bob" } },
      ],
    },
  }),
  trello: () => ({
    input: { boardId: randomId(), listId: randomId() },
    output: { cards: [{ id: randomId(), name: "Deploy v2.0", labels: ["urgent"], due: randomTimestamp() }] },
  }),
  jira: () => ({
    input: { project: "PROJ", jql: "status = 'Open'" },
    output: {
      issues: [
        { key: "PROJ-" + randomInt(100, 999), summary: "Login page error", status: "Open", priority: "High" },
      ],
      total: randomInt(1, 50),
    },
  }),
  github: () => ({
    input: { owner: "acme", repo: "app", operation: "listPullRequests" },
    output: {
      pullRequests: [
        { number: randomInt(100, 999), title: "Add dark mode", state: "open", author: "dev1", additions: randomInt(10, 500) },
      ],
    },
  }),

  // Storage
  s3: () => ({
    input: { bucket: "my-bucket", key: "uploads/data.json", operation: "getObject" },
    output: { contentLength: randomInt(100, 50000), contentType: "application/json", lastModified: randomTimestamp(), etag: `"${randomId()}"` },
  }),

  // AI / LLM
  "ai-agent": (prev) => ({
    input: { prompt: prev?.message || "Analyze the sales data and provide insights", model: "gpt-4", tools: ["search", "calculator"] },
    output: {
      response: "Based on the sales data, revenue increased by 23% QoQ. Key drivers: 1) New product launch (+$45K), 2) Expanded marketing (+15% conversions). Recommendation: Focus on product B which shows highest growth potential.",
      tokensUsed: { prompt: randomInt(200, 800), completion: randomInt(100, 500) },
      toolCalls: [{ name: "calculator", input: "45000 / 195000 * 100", output: "23.08%" }],
    },
  }),
  openai: (prev) => ({
    input: { model: "gpt-4", messages: [{ role: "user", content: prev?.prompt || "Summarize this text" }], temperature: 0.7 },
    output: {
      content: "The document discusses three main points: market expansion, cost optimization, and team restructuring. Key takeaway is the projected 15% growth.",
      model: "gpt-4-0613",
      usage: { promptTokens: randomInt(50, 300), completionTokens: randomInt(30, 200), totalTokens: randomInt(80, 500) },
      finishReason: "stop",
    },
  }),
  anthropic: (prev) => ({
    input: { model: "claude-3-opus", prompt: prev?.prompt || "Explain this code" },
    output: {
      content: "This function implements a binary search algorithm with O(log n) complexity. It recursively divides the search space in half.",
      stopReason: "end_turn",
      usage: { inputTokens: randomInt(100, 400), outputTokens: randomInt(50, 300) },
    },
  }),
  "google-ai": (prev) => ({
    input: { model: "gemini-pro", prompt: prev?.prompt || "Translate to French" },
    output: { content: "Bonjour, comment puis-je vous aider aujourd'hui?", safetyRatings: [{ category: "HARM", probability: "NEGLIGIBLE" }] },
  }),
  ollama: () => ({
    input: { model: "llama2", prompt: "What is machine learning?" },
    output: { response: "Machine learning is a subset of AI that enables systems to learn from data patterns without explicit programming.", model: "llama2:latest", evalDuration: `${randomInt(500, 3000)}ms` },
  }),
  huggingface: () => ({
    input: { model: "distilbert-base", inputs: "I love this product!" },
    output: { label: "POSITIVE", score: 0.9876, model: "distilbert-base-uncased-finetuned-sst-2-english" },
  }),
  groq: () => ({
    input: { model: "mixtral-8x7b", prompt: "List 3 benefits of cloud computing" },
    output: { content: "1. Scalability 2. Cost efficiency 3. Global accessibility", tokensPerSecond: randomInt(300, 800) },
  }),

  // AI sub-components
  "ai-chain": () => ({
    input: { type: "sequential", steps: ["retrieve", "summarize", "respond"] },
    output: { result: "Chain completed", stepsExecuted: 3, totalDuration: `${randomInt(1, 5)}s` },
  }),
  "ai-tool": () => ({
    input: { name: "web_search", description: "Search the web for information" },
    output: { registered: true, toolId: randomId(), schema: { type: "function", parameters: { query: "string" } } },
  }),
  "ai-output-parser": () => ({
    input: { format: "json", rawOutput: '{"name": "test", "value": 42}' },
    output: { parsed: { name: "test", value: 42 }, format: "json", valid: true },
  }),

  // Memory
  "buffer-memory": () => ({
    input: { operation: "load", sessionId: randomId() },
    output: {
      messages: [
        { role: "user", content: "What's the weather?" },
        { role: "assistant", content: "It's sunny, 72°F." },
      ],
      tokenCount: randomInt(50, 500),
    },
  }),
  "window-memory": () => ({
    input: { windowSize: 5, sessionId: randomId() },
    output: { messages: [{ role: "user", content: "Latest message" }], windowSize: 5, totalMessages: randomInt(5, 50) },
  }),
  "vector-store-memory": () => ({
    input: { query: "previous conversation about pricing", topK: 3 },
    output: { results: [{ content: "We discussed the $99/mo plan", score: 0.92 }], searchTime: `${randomInt(10, 100)}ms` },
  }),
  "summary-memory": () => ({
    input: { sessionId: randomId() },
    output: { summary: "User asked about product pricing and feature comparison. Interested in enterprise plan.", tokensSaved: randomInt(100, 1000) },
  }),

  // Vector Stores
  pinecone: () => ({
    input: { operation: "query", vector: [0.1, 0.2, 0.3], topK: 5, namespace: "products" },
    output: { matches: [{ id: randomId(), score: 0.95, metadata: { title: "Product Guide" } }], namespace: "products" },
  }),
  qdrant: () => ({
    input: { collection: "docs", vector: [0.5, 0.3, 0.8], limit: 3 },
    output: { points: [{ id: randomId(), score: 0.91, payload: { text: "API documentation" } }] },
  }),
  chromadb: () => ({
    input: { collection: "knowledge", queryTexts: ["How to deploy?"] },
    output: { ids: [randomId()], documents: ["Deploy using docker-compose up -d"], distances: [0.12] },
  }),

  // Embeddings
  "openai-embeddings": () => ({
    input: { model: "text-embedding-ada-002", input: "Hello world" },
    output: { embedding: [0.0023, -0.0091, 0.0152, "...1536 dimensions"], model: "text-embedding-ada-002", tokens: randomInt(2, 20) },
  }),
  "cohere-embeddings": () => ({
    input: { model: "embed-english-v3.0", texts: ["Sample text"] },
    output: { embeddings: [[0.034, -0.012, 0.056]], meta: { apiVersion: "2", billedUnits: 1 } },
  }),
  "google-embeddings": () => ({
    input: { model: "embedding-001", content: "Search query" },
    output: { embedding: [0.012, -0.045, 0.078, "...768 dimensions"], tokenCount: randomInt(3, 15) },
  }),

  // Document Loaders
  "pdf-loader": () => ({
    input: { filePath: "/uploads/report.pdf" },
    output: { documents: [{ pageContent: "Q3 Revenue Report: Total revenue reached $2.4M...", metadata: { page: 1, totalPages: 12 } }], totalPages: 12 },
  }),
  "csv-loader": () => ({
    input: { filePath: "/uploads/data.csv", separator: "," },
    output: { rows: [{ name: "Alice", age: 30, city: "NYC" }, { name: "Bob", age: 25, city: "LA" }], totalRows: randomInt(10, 1000), columns: ["name", "age", "city"] },
  }),
  "web-scraper": () => ({
    input: { url: "https://example.com/blog", selector: "article" },
    output: { title: "Getting Started with AI", content: "This guide covers the fundamentals...", links: randomInt(5, 30), wordCount: randomInt(200, 2000) },
  }),
  "json-loader": () => ({
    input: { filePath: "/uploads/config.json", jsonPath: "$.settings" },
    output: { data: { theme: "dark", language: "en", notifications: true }, itemCount: 3 },
  }),

  // Text Splitters
  "recursive-splitter": () => ({
    input: { text: "Long document text...", chunkSize: 1000, chunkOverlap: 200 },
    output: { chunks: randomInt(5, 50), avgChunkSize: randomInt(800, 1000), totalCharacters: randomInt(5000, 50000) },
  }),
  "token-splitter": () => ({
    input: { text: "Document to split...", tokensPerChunk: 500 },
    output: { chunks: randomInt(3, 30), totalTokens: randomInt(1000, 15000), model: "gpt-4" },
  }),

  // Media
  "image-edit": () => ({
    input: { operation: "resize", width: 800, height: 600, format: "png" },
    output: { width: 800, height: 600, format: "png", size: `${randomInt(50, 500)}KB`, url: "https://cdn.example.com/" + randomId() },
  }),
  "text-to-speech": () => ({
    input: { text: "Hello, welcome to our service!", voice: "alloy", model: "tts-1" },
    output: { audioUrl: "https://cdn.example.com/audio/" + randomId() + ".mp3", duration: `${randomInt(1, 10)}s`, format: "mp3" },
  }),
  "speech-to-text": () => ({
    input: { audioUrl: "https://cdn.example.com/recording.mp3", language: "en" },
    output: { text: "Please process my order number 4582", confidence: 0.97, language: "en", duration: `${randomInt(5, 60)}s` },
  }),
  "generate-image": () => ({
    input: { prompt: "A futuristic city skyline at sunset", model: "dall-e-3", size: "1024x1024" },
    output: { url: "https://cdn.example.com/img/" + randomId() + ".png", revisedPrompt: "A detailed futuristic city...", size: "1024x1024" },
  }),

  // Analytics
  "google-analytics": () => ({
    input: { property: "GA4-123456", dateRange: "last7days", metrics: ["sessions", "pageviews"] },
    output: { sessions: randomInt(1000, 50000), pageviews: randomInt(3000, 150000), bounceRate: `${randomInt(20, 60)}%`, avgDuration: `${randomInt(60, 300)}s` },
  }),
  segment: () => ({
    input: { event: "page_view", userId: randomId(), properties: { page: "/pricing" } },
    output: { success: true, messageId: randomId(), timestamp: randomTimestamp() },
  }),

  // Security
  oauth2: () => ({
    input: { grantType: "authorization_code", clientId: "***", scope: "read write" },
    output: { accessToken: "***" + randomId().slice(0, 4), tokenType: "Bearer", expiresIn: 3600, scope: "read write" },
  }),
  jwt: () => ({
    input: { payload: { sub: randomId(), role: "admin" }, algorithm: "HS256" },
    output: { token: "eyJ..." + randomId(), expiresAt: randomTimestamp(), claims: { sub: randomId(), role: "admin" } },
  }),
  crypto: () => ({
    input: { operation: "hash", algorithm: "SHA-256", data: "sensitive-data" },
    output: { hash: randomId() + randomId(), algorithm: "SHA-256", encoding: "hex" },
  }),

  // Video
  video: () => ({
    input: { url: "https://example.com/video.mp4" },
    output: { duration: `${randomInt(10, 300)}s`, resolution: "1920x1080", format: "mp4" },
  }),
};

export function generateMockData(nodeType, prevOutput) {
  const generator = generators[nodeType];
  if (generator) return generator(prevOutput);
  // Fallback for unknown types
  return {
    input: { data: prevOutput || { item: "sample" } },
    output: { success: true, processedAt: randomTimestamp(), result: { id: randomId(), status: "completed" } },
  };
}
