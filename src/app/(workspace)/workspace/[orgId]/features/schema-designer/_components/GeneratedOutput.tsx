import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Database, Sprout, Play, Check, Save, Loader2, FileCode, Terminal } from "lucide-react";
import { ParsedModel, generateMigrationSQL, generateSeederCode, generateSeedData } from "../lib/schemaParser";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface GeneratedOutputProps {
  models: ParsedModel[];
  tableName: string;
  schemaDefinition: string;
  onSaved?: () => void;
}

export function GeneratedOutput({ models, tableName, schemaDefinition, onSaved }: GeneratedOutputProps) {
  const [executing, setExecuting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedMigration, setCopiedMigration] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);

  if (models.length === 0) {
    return (
      <Card className="w-full shadow-md border-border/50">
        <CardContent className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <FileCode className="h-8 w-8 opacity-50" />
          </div>
          <p className="text-lg font-medium">No Schema Generated</p>
          <p className="text-sm mt-1">Design your schema and click generate to see the output</p>
        </CardContent>
      </Card>
    );
  }

  const migrationSQL = models.map(m => generateMigrationSQL(m)).join('\n\n');
  const seederCode = models.map(m => generateSeederCode(m)).join('\n\n');

  const copyToClipboard = async (text: string, type: 'migration' | 'seed') => {
    await navigator.clipboard.writeText(text);
    if (type === 'migration') {
      setCopiedMigration(true);
      setTimeout(() => setCopiedMigration(false), 2000);
    } else {
      setCopiedSeed(true);
      setTimeout(() => setCopiedSeed(false), 2000);
    }
    toast.success(`${type === 'migration' ? 'Migration SQL' : 'Seed code'} copied to clipboard`);
  };

  const executeSeed = async () => {
    setExecuting(true);
    try {
      for (const model of models) {
        const seedTableName = tableName || model.name.toLowerCase() + 's';
        const seedData = generateSeedData(model, 10);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from(seedTableName as any) as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from(seedTableName as any) as any).insert(seedData);
        
        if (error) {
          throw new Error(`Failed to seed ${seedTableName}: ${error.message}`);
        }
      }
      toast.success("Seed data inserted successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Seeding failed';
      toast.error(message);
      console.error(error);
    } finally {
      setExecuting(false);
    }
  };

  const saveDesign = async () => {
    if (!tableName) {
      toast.error("Please provide a table name");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('database_designer')
        .upsert({
          table_name: tableName,
          schema_definition: schemaDefinition,
          migration_sql: migrationSQL,
          seed_code: seederCode,
        }, { onConflict: 'table_name' });

      if (error) throw error;
      toast.success(`Schema "${tableName}" saved successfully`);
      onSaved?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save';
      toast.error(message);
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full shadow-md border-border/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-md bg-accent/10">
                <Terminal className="h-4 w-4 text-accent" />
              </div>
              Generated Output
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-xs">
                {tableName || models[0]?.name.toLowerCase() + 's'}
              </Badge>
              <span className="text-xs">{models.length} model(s) • {models[0]?.fields.length || 0} fields</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="migration" className="w-full">
          <div className="border-b bg-muted/30">
            <TabsList className="h-12 w-full justify-start rounded-none border-0 bg-transparent px-4">
              <TabsTrigger 
                value="migration" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Database className="h-4 w-4" />
                Migration SQL
              </TabsTrigger>
              <TabsTrigger 
                value="seed" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Sprout className="h-4 w-4" />
                Seed Code
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="migration" className="m-0 p-4 space-y-4">
            <div className="relative group">
              <pre className="p-4 rounded-lg bg-muted/50 border text-sm font-mono overflow-x-auto max-h-[350px] overflow-y-auto leading-relaxed">
                <code className="text-foreground">{migrationSQL}</code>
              </pre>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(migrationSQL, 'migration')}
              >
                {copiedMigration ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedMigration ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Database className="h-4 w-4" />
              Run this SQL as a migration to create your table with RLS policies enabled.
            </p>
          </TabsContent>
          
          <TabsContent value="seed" className="m-0 p-4 space-y-4">
            <div className="relative group">
              <pre className="p-4 rounded-lg bg-muted/50 border text-sm font-mono overflow-x-auto max-h-[350px] overflow-y-auto leading-relaxed">
                <code className="text-foreground">{seederCode}</code>
              </pre>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(seederCode, 'seed')}
              >
                {copiedSeed ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedSeed ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Button 
              onClick={executeSeed} 
              disabled={executing}
              variant="outline"
              className="w-full gap-2 h-10"
            >
              {executing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {executing ? 'Seeding...' : 'Execute Seed Now'}
            </Button>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sprout className="h-4 w-4" />
              The table must exist before seeding. Run the migration first.
            </p>
          </TabsContent>
        </Tabs>

        <div className="p-4 pt-0">
          <Button
            onClick={saveDesign}
            disabled={saving || !tableName}
            className={cn(
              "w-full h-11 gap-2 transition-all",
              !saving && tableName && "shadow-glow"
            )}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Schema Design'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
