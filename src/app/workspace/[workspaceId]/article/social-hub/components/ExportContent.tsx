import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedContent } from "@/social-hub/lib/gemini";

interface ExportContentProps {
  contents: { platform: string; data: GeneratedContent; imageUrl?: string }[];
  topic: string;
}

function toCSV(contents: ExportContentProps["contents"]): string {
  const header = "Platform,Title,Description,Content,Hashtags\n";
  const rows = contents.map((c) => {
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      c.platform,
      escape(c.data.title),
      escape(c.data.description),
      escape(c.data.content),
      escape(c.data.hashtags.map((h) => `#${h}`).join(" ")),
    ].join(",");
  });
  return header + rows.join("\n");
}

function toMarkdown(contents: ExportContentProps["contents"], topic: string): string {
  let md = `# Generated Content: ${topic}\n\n`;
  md += `_Generated on ${new Date().toLocaleDateString()}_\n\n---\n\n`;
  for (const c of contents) {
    md += `## ${c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}\n\n`;
    md += `### ${c.data.title}\n\n`;
    if (c.data.description) md += `> ${c.data.description}\n\n`;
    md += `${c.data.content}\n\n`;
    if (c.data.hashtags.length > 0) {
      md += `**Hashtags:** ${c.data.hashtags.map((h) => `#${h}`).join(" ")}\n\n`;
    }
    md += `---\n\n`;
  }
  return md;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportContent({ contents, topic }: ExportContentProps) {
  const { toast } = useToast();

  if (contents.length === 0) return null;

  const handleExportCSV = () => {
    downloadFile(toCSV(contents), `content-${Date.now()}.csv`, "text/csv");
    toast({ title: "Exported as CSV" });
  };

  const handleExportMarkdown = () => {
    downloadFile(toMarkdown(contents, topic), `content-${Date.now()}.md`, "text/markdown");
    toast({ title: "Exported as Markdown" });
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(contents.map((c) => ({
      platform: c.platform,
      ...c.data,
      imageUrl: c.imageUrl,
    })), null, 2);
    downloadFile(json, `content-${Date.now()}.json`, "application/json");
    toast({ title: "Exported as JSON" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-border/50">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportCSV}>
          <Table className="w-4 h-4 mr-2" /> CSV Spreadsheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportMarkdown}>
          <FileText className="w-4 h-4 mr-2" /> Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <Download className="w-4 h-4 mr-2" /> JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}