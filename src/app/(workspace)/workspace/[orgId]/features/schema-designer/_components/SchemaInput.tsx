import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Code, PenTool, FileText, AlertCircle, CheckCircle2, Wand2 } from "lucide-react";
import { parsePrismaSchema } from "../lib/schemaParser";
import { FieldDef } from "../types";
import { FieldRow } from "./FieldRow";
import { SchemaToolbar } from "./SchemaToolbar";
import { VersionHistoryDialog } from "./VersionHistoryDialog";
import { useFieldValidation } from "../hooks/useFieldValidation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SchemaInputProps {
  onSchemaChange: (schema: string, tableName: string) => void;
  initialTableName?: string;
  initialSchema?: string;
  availableTables?: string[];
}

const defaultSchema = `id String @id @default(cuid())

userId String

title String
description String?
status String @default("active")

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt`;

export function SchemaInput({ 
  onSchemaChange, 
  initialTableName = "", 
  initialSchema = "",
  availableTables = []
}: SchemaInputProps) {
  const [tableName, setTableName] = useState(initialTableName);
  const [rawSchema, setRawSchema] = useState(initialSchema || defaultSchema);
  const [modelName, setModelName] = useState("CustomModel");
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [showEditableTable, setShowEditableTable] = useState(false);
  const [isParsed, setIsParsed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { errors, hasErrors, hasWarnings, getFieldErrors, getGlobalErrors, isValid } = useFieldValidation(fields);
  const globalErrors = getGlobalErrors();

  useEffect(() => {
    if (initialTableName) setTableName(initialTableName);
    if (initialSchema) {
      setRawSchema(initialSchema);
      parseSchemaToFields(initialSchema);
    }
  }, [initialTableName, initialSchema]);

  const parseSchemaToFields = (schema: string) => {
    const models = parsePrismaSchema(schema);
    if (models.length > 0) {
      const model = models[0];
      setModelName(model.name);
      const parsedFields: FieldDef[] = model.fields.map((f, index) => ({
        id: `parsed-${index}-${Date.now()}`,
        name: f.name,
        type: f.type,
        isOptional: f.isOptional,
        isId: f.isId,
        isUnique: f.isUnique,
        defaultValue: f.defaultValue || 'none',
      }));
      setFields(parsedFields);
      setShowEditableTable(true);
      setIsParsed(true);
    }
  };

  const addField = () => {
    const newField: FieldDef = {
      id: Date.now().toString(),
      name: '',
      type: 'String',
      isOptional: true,
      isId: false,
      isUnique: false,
      defaultValue: 'none',
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldDef>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const generateSchemaFromFields = (): string => {
    return fields.map(f => {
      let line = `${f.name} ${f.type}${f.isOptional ? '?' : ''}`;
      const decorators: string[] = [];
      if (f.isId) decorators.push('@id');
      if (f.isUnique) decorators.push('@unique');
      if (f.defaultValue && f.defaultValue !== 'none') decorators.push(`@default(${f.defaultValue}())`);
      if (f.relationTo) decorators.push(`@relation(references: [${f.relationField || 'id'}])`);
      if (decorators.length) line += ' ' + decorators.join(' ');
      return line;
    }).join('\n');
  };

  const handleParseSchema = () => {
    parseSchemaToFields(rawSchema);
    toast.success('Schema parsed successfully');
  };

  const handleGenerateFromFields = () => {
    if (!isValid) {
      toast.error('Please fix validation errors before generating');
      return;
    }
    const schema = generateSchemaFromFields();
    const finalModelName = tableName || modelName;
    const fullSchema = `model ${finalModelName} {\n${schema}\n}`;
    setRawSchema(fullSchema);
    onSchemaChange(fullSchema, finalModelName);
    toast.success('Schema generated');
  };

  const handleStartFresh = () => {
    setFields([
      { id: '1', name: 'id', type: 'String', isOptional: false, isId: true, isUnique: false, defaultValue: 'cuid' },
      { id: '2', name: 'createdAt', type: 'DateTime', isOptional: false, isId: false, isUnique: false, defaultValue: 'now' },
      { id: '3', name: 'updatedAt', type: 'DateTime', isOptional: false, isId: false, isUnique: false, defaultValue: 'now' },
    ]);
    setShowEditableTable(true);
    setIsParsed(false);
  };

  const handleBackToPaste = () => {
    setShowEditableTable(false);
    setIsParsed(false);
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.tableName) setTableName(json.tableName);
        if (json.modelName) setModelName(json.modelName);
        if (json.fields && Array.isArray(json.fields)) {
          const importedFields: FieldDef[] = json.fields.map((f: Partial<FieldDef>, i: number) => ({
            id: `imported-${i}-${Date.now()}`,
            name: f.name || '',
            type: f.type || 'String',
            isOptional: f.isOptional ?? true,
            isId: f.isId ?? false,
            isUnique: f.isUnique ?? false,
            defaultValue: f.defaultValue || 'none',
            relationTo: f.relationTo,
            relationField: f.relationField,
          }));
          setFields(importedFields);
          setShowEditableTable(true);
          toast.success('Schema imported from JSON');
        }
      } catch {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportJSON = () => {
    const exportData = {
      tableName,
      modelName,
      fields: fields.map(f => ({
        name: f.name,
        type: f.type,
        isOptional: f.isOptional,
        isId: f.isId,
        isUnique: f.isUnique,
        defaultValue: f.defaultValue,
        relationTo: f.relationTo,
        relationField: f.relationField,
      })),
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName || 'schema'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Schema exported as JSON');
  };

  const handleExportSQL = () => {
    const schema = generateSchemaFromFields();
    const finalModelName = tableName || modelName;
    const fullSchema = `model ${finalModelName} {\n${schema}\n}`;
    const models = parsePrismaSchema(fullSchema);
    
    if (models.length > 0) {
      const { generateMigrationSQL } = require('@/lib/schemaParser');
      const sql = generateMigrationSQL(models[0]);
      
      const blob = new Blob([sql], { type: 'text/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName || 'migration'}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('SQL migration exported');
    }
  };

  const handleRestoreVersion = (schema: string) => {
    setRawSchema(schema);
    parseSchemaToFields(schema);
    toast.success('Schema restored from version');
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      
      <VersionHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        tableName={tableName}
        onRestore={handleRestoreVersion}
      />

      <Card className="w-full shadow-md border-border/50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                Schema Designer
              </CardTitle>
              <CardDescription className="mt-1">
                Design your database schema visually or paste Prisma syntax
              </CardDescription>
            </div>
            {showEditableTable && (
              <div className="flex items-center gap-2">
                {hasErrors && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.filter(e => e.type === 'error').length} errors
                  </Badge>
                )}
                {hasWarnings && !hasErrors && (
                  <Badge variant="outline" className="gap-1 border-warning text-warning">
                    <AlertCircle className="h-3 w-3" />
                    {errors.filter(e => e.type === 'warning').length} warnings
                  </Badge>
                )}
                {isValid && fields.length > 0 && (
                  <Badge variant="outline" className="gap-1 border-success text-success">
                    <CheckCircle2 className="h-3 w-3" />
                    Valid
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="tableName" className="text-sm font-medium">Table Name</Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g., users, products, orders"
              className="h-10"
            />
          </div>

          {!showEditableTable ? (
            <div className="space-y-4 animate-fade-in">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9"
                  onClick={handleStartFresh}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  Design from Scratch
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 h-9"
                  onClick={handleImportJSON}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  Import JSON
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Prisma-like Schema
                </Label>
                <Textarea
                  value={rawSchema}
                  onChange={(e) => setRawSchema(e.target.value)}
                  placeholder="Paste your Prisma schema here..."
                  className="min-h-[280px] font-mono text-sm resize-none"
                />
              </div>
              
              <Button onClick={handleParseSchema} className="w-full gap-2 h-10">
                <Code className="h-4 w-4" />
                Parse & Edit Fields
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToPaste}
                    className="gap-1.5 h-8 text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Paste
                  </Button>
                  {isParsed && (
                    <Badge variant="secondary" className="text-xs">
                      Parsed from schema
                    </Badge>
                  )}
                </div>
                <SchemaToolbar
                  onAddField={addField}
                  onImportJSON={handleImportJSON}
                  onExportJSON={handleExportJSON}
                  onExportSQL={handleExportSQL}
                  onViewHistory={() => setHistoryOpen(true)}
                  hasFields={fields.length > 0}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Model Name</Label>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g., User, Post, Product"
                  className="h-10"
                />
              </div>

              {globalErrors.length > 0 && (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
                  <ul className="text-sm text-warning space-y-1">
                    {globalErrors.map((e, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Fields</Label>
                  <span className="text-xs text-muted-foreground">{fields.length} fields</span>
                </div>
                <div className="border rounded-lg overflow-hidden bg-card">
                  <div className="grid grid-cols-[24px_1fr_130px_110px_60px_50px_50px_50px_36px] gap-2 px-3 py-2.5 bg-muted/50 text-xs font-medium border-b text-muted-foreground">
                    <span></span>
                    <span>Name</span>
                    <span>Type</span>
                    <span>Default</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-center">Opt</TooltipTrigger>
                        <TooltipContent>Optional (nullable)</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-center">PK</TooltipTrigger>
                        <TooltipContent>Primary Key</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-center">Uniq</TooltipTrigger>
                        <TooltipContent>Unique constraint</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-center">Rel</TooltipTrigger>
                        <TooltipContent>Relation to another table</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span></span>
                  </div>
                  
                  <div className="max-h-[380px] overflow-y-auto">
                    {fields.length === 0 ? (
                      <div className="p-10 text-center text-muted-foreground">
                        <div className="text-4xl mb-2">📝</div>
                        <p>No fields defined yet</p>
                        <p className="text-sm mt-1">Click "Add Field" to start designing your schema</p>
                      </div>
                    ) : (
                      fields.map((field) => (
                        <FieldRow
                          key={field.id}
                          field={field}
                          errors={getFieldErrors(field.id)}
                          tables={availableTables}
                          onUpdate={(updates) => updateField(field.id, updates)}
                          onRemove={() => removeField(field.id)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateFromFields} 
                className={cn(
                  "w-full h-11 gap-2 transition-all",
                  isValid && fields.length > 0 && "shadow-glow"
                )}
                disabled={!tableName && !modelName || fields.length === 0 || hasErrors}
              >
                <Wand2 className="h-4 w-4" />
                Generate Migration & Seed Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
