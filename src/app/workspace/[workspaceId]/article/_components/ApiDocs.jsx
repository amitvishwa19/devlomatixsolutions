import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Terminal, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const ApiDocs = () => {
    const { toast } = useToast();

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied to clipboard!" });
    };

    return (
        <div className="pt-6 px-4 pb-12 max-w-5xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-4">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Developer Documentation</span>
                </div>
                <h1 className="font-display text-3xl font-bold mb-2">
                    <span className="text-primary">API</span>{" "}
                    <span className="text-foreground">Reference</span>
                </h1>
                <p className="text-muted-foreground">Integrate AI content generation directly into your own applications.</p>
            </div>

            <div className="space-y-8">
                {/* Authentication Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="text-green-500 w-5 h-5" /> Authentication</h2>
                    <Card className="border-border shadow-sm bg-card">
                        <CardHeader className="border-b border-border/30 bg-secondary/10">
                            <CardTitle className="text-base text-foreground">API Keys</CardTitle>
                            <CardDescription>Authenticate your requests using Bearer tokens.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="bg-secondary/30 rounded-md p-4 relative group border border-border/30">
                                <code className="text-sm text-foreground/90 font-mono">
                                    Authorization: Bearer YOUR_API_KEY
                                </code>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 opacity-50 group-hover:opacity-100 transition-opacity"
                                    onClick={() => copyCode("Authorization: Bearer YOUR_API_KEY")}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Generate Endpoint Section */}
                <section>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Terminal className="text-primary w-5 h-5" /> Endpoints</h2>
                    <Card className="border-border shadow-sm bg-card">
                        <CardHeader className="border-b border-border/30 bg-secondary/10">
                            <div className="flex items-center gap-3">
                                <span className="bg-green-500/10 text-green-500 font-mono font-bold px-3 py-1 rounded text-sm">POST</span>
                                <CardTitle className="text-base font-mono">/api/v1/generate</CardTitle>
                            </div>
                            <CardDescription className="pt-1">Generate social media content for specific platforms.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-sm mb-3">Request Body</h3>
                                <div className="bg-secondary/30 rounded-md p-4 relative group border border-border/30 overflow-x-auto">
                                    <pre className="text-sm text-foreground/90 font-mono">
{`{
  "topic": "launching a new SaaS product for project management",
  "platforms": ["twitter", "linkedin"],
  "tone": "professional",
  "language": "english"
}`}
                                    </pre>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-2 opacity-50 group-hover:opacity-100 transition-opacity"
                                        onClick={() => copyCode(`{\n  "topic": "launching a new SaaS product for project management",\n  "platforms": ["twitter", "linkedin"],\n  "tone": "professional",\n  "language": "english"\n}`)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-sm mb-3">Success Response <span className="text-xs font-normal text-muted-foreground ml-2">(200 OK)</span></h3>
                                <div className="bg-secondary/30 rounded-md p-4 relative group border border-border/30 overflow-x-auto">
                                    <pre className="text-sm text-foreground/90 font-mono">
{`{
  "success": true,
  "data": {
    "twitter": {
      "content": "Excited to launch our new project management SaaS! 🚀\\nStreamline your workflow and boost productivity.\\n\\nCheck it out here: [link]",
      "hashtags": ["SaaS", "Productivity", "ProjectManagement"]
    },
    ...
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
                
                {/* Rewriter Endpoint Section */}
                <section>
                    <Card className="border-border shadow-sm bg-card">
                        <CardHeader className="border-b border-border/30 bg-secondary/10">
                            <div className="flex items-center gap-3">
                                <span className="bg-green-500/10 text-green-500 font-mono font-bold px-3 py-1 rounded text-sm">POST</span>
                                <CardTitle className="text-base font-mono">/api/v1/rewrite</CardTitle>
                            </div>
                            <CardDescription className="pt-1">Rewrite existing content to match a specific tone or language.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="bg-secondary/30 rounded-md p-4 relative group border border-border/30 overflow-x-auto">
                                <pre className="text-sm text-foreground/90 font-mono">
{`{
  "content": "We made a new tool. It helps you work fast.",
  "tone": "professional",
  "instructions": "Make it sound enterprise-ready"
}`}
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 opacity-50 group-hover:opacity-100 transition-opacity"
                                    onClick={() => copyCode(`{\n  "content": "We made a new tool. It helps you work fast.",\n  "tone": "professional",\n  "instructions": "Make it sound enterprise-ready"\n}`)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
};
