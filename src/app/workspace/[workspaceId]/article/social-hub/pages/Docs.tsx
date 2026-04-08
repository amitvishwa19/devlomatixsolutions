import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

const BASE_URL = `https://lhpdtqyteowtehhnsxpc.supabase.co/functions/v1`;

interface Endpoint {
  name: string;
  method: string;
  path: string;
  description: string;
  params: { name: string; type: string; required: boolean; description: string }[];
  example: object;
  response: string;
}

const endpoints: Endpoint[] = [
  {
    name: "Generate Post",
    method: "POST",
    path: "/generate-post",
    description: "Generate social media content for one or more topics across multiple platforms.",
    params: [
      { name: "topic", type: "string", required: false, description: "Single topic (use topic or topics)" },
      { name: "topics", type: "string[]", required: false, description: "Array of topics for bulk generation" },
      { name: "content-type", type: "string", required: false, description: "post | thread | caption | story (default: post)" },
      { name: "tone", type: "string", required: false, description: "professional | casual | humorous | inspirational | educational" },
      { name: "platforms", type: "string", required: false, description: "Comma-separated: linkedin,instagram,twitter,facebook,tiktok" },
      { name: "words", type: "string", required: false, description: "Target word count (default: 500)" },
      { name: "image", type: "boolean", required: false, description: "Generate accompanying image (default: true)" },
      { name: "language", type: "string", required: false, description: "Output language: english, hindi, spanish, etc." },
      { name: "keywords", type: "string[]", required: false, description: "SEO keywords to weave into content" },
      { name: "schedule", type: "object", required: false, description: "{ publish_time, timezone } scheduling metadata" },
    ],
    example: {
      topic: "AI in healthcare",
      "content-type": "post",
      tone: "professional",
      platforms: "linkedin,twitter",
      words: "500",
      language: "english",
      keywords: ["AI healthcare", "medical AI"],
    },
    response: `{
  "success": true,
  "topic": "AI in healthcare",
  "results": [
    {
      "platform": "linkedin",
      "title": "...",
      "description": "...",
      "content": "...",
      "hashtags": ["AIHealthcare", "MedTech"],
      "imageUrl": "...",
      "language": "english",
      "keywords": ["AI healthcare"]
    }
  ]
}`,
  },
  {
    name: "Rewrite Content",
    method: "POST",
    path: "/rewrite-content",
    description: "Improve or rewrite existing content with a specific tone and platform optimization.",
    params: [
      { name: "content", type: "string", required: true, description: "The original content to rewrite" },
      { name: "tone", type: "string", required: false, description: "Target tone for the rewrite" },
      { name: "platform", type: "string", required: false, description: "Target platform to optimize for" },
      { name: "language", type: "string", required: false, description: "Output language" },
      { name: "instructions", type: "string", required: false, description: "Custom rewrite instructions" },
    ],
    example: {
      content: "AI is changing healthcare by helping doctors diagnose diseases faster.",
      tone: "inspirational",
      platform: "linkedin",
    },
    response: `{
  "success": true,
  "original_length": 65,
  "rewritten": {
    "content": "...",
    "improvements": ["Added emotional hook", "Professional tone"],
    "hashtags": ["HealthcareAI"]
  }
}`,
  },
  {
    name: "Generate Hashtags",
    method: "POST",
    path: "/generate-hashtags",
    description: "Generate trending, categorized hashtags for a topic and platform.",
    params: [
      { name: "topic", type: "string", required: true, description: "Topic to generate hashtags for" },
      { name: "platform", type: "string", required: false, description: "Target platform" },
      { name: "count", type: "number", required: false, description: "Number of hashtags (default: 20)" },
    ],
    example: { topic: "sustainable fashion", platform: "instagram", count: 15 },
    response: `{
  "success": true,
  "topic": "sustainable fashion",
  "hashtags": {
    "trending": ["SustainableFashion"],
    "niche": ["EcoStyle"],
    "branded": ["GreenWardrobe"],
    "general": ["Fashion"]
  },
  "total_count": 15
}`,
  },
  {
    name: "Content Calendar",
    method: "POST",
    path: "/content-calendar",
    description: "Generate a structured content calendar for a week or month.",
    params: [
      { name: "topics", type: "string[]", required: true, description: "Array of topics to plan content for" },
      { name: "platforms", type: "string", required: false, description: "Comma-separated platforms" },
      { name: "duration", type: "string", required: false, description: "week | 2weeks | month" },
      { name: "tone", type: "string", required: false, description: "Content tone" },
      { name: "language", type: "string", required: false, description: "Output language" },
      { name: "start_date", type: "string", required: false, description: "Start date (YYYY-MM-DD)" },
    ],
    example: { topics: ["AI", "productivity"], platforms: "linkedin,twitter", duration: "week" },
    response: `{
  "success": true,
  "calendar": [
    {
      "day": 1, "date": "2024-01-15",
      "platform": "linkedin", "content_type": "post",
      "topic": "AI trends", "idea": "...",
      "best_time": "10:00 AM",
      "hashtags": ["AI"], "goal": "engagement"
    }
  ],
  "strategy_notes": "..."
}`,
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copy}>
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

const Docs = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">API Documentation</h1>
        <p className="text-muted-foreground">Complete reference for all endpoints</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <code className="text-xs bg-muted px-3 py-1 rounded text-muted-foreground">{BASE_URL}</code>
          <CopyButton text={BASE_URL} />
        </div>
      </div>

      <Tabs defaultValue="generate-post">
        <TabsList className="grid grid-cols-4 mb-6">
          {endpoints.map((ep) => (
            <TabsTrigger key={ep.path} value={ep.path.slice(1)} className="text-xs">
              {ep.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {endpoints.map((ep) => (
          <TabsContent key={ep.path} value={ep.path.slice(1)}>
            <Card className="border-border/50 bg-card/60">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{ep.method}</Badge>
                  <code className="text-sm text-foreground">{ep.path}</code>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{ep.description}</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Parameters</h3>
                  <div className="space-y-2">
                    {ep.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-3 text-sm">
                        <code className="bg-muted px-2 py-0.5 rounded text-xs min-w-[120px]">{p.name}</code>
                        <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                        {p.required && <Badge className="bg-destructive/20 text-destructive text-[10px]">required</Badge>}
                        <span className="text-muted-foreground text-xs">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">Example Request</h3>
                    <CopyButton text={JSON.stringify(ep.example, null, 2)} />
                  </div>
                  <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{JSON.stringify(ep.example, null, 2)}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Example Response</h3>
                  <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{ep.response}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">cURL</h3>
                    <CopyButton text={`curl -X POST ${BASE_URL}${ep.path} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_ANON_KEY" \\\n  -d '${JSON.stringify(ep.example)}'`} />
                  </div>
                  <pre className="bg-muted/50 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{`curl -X POST ${BASE_URL}${ep.path} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_ANON_KEY" \\
  -d '${JSON.stringify(ep.example)}'`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Docs;