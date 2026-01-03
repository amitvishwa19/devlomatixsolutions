import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SchemaInput } from "./SchemaInput";
import { GeneratedOutput } from "./GeneratedOutput";
import { parsePrismaSchema, ParsedModel } from "../lib/schemaParser";
import { supabase } from "@/integrations/supabase/client";

interface SchemaDesignerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTableName?: string | null;
  onSaved?: () => void;
}

export const SchemaDesignerModal = ({
  open,
  onOpenChange,
  editTableName,
  onSaved,
}: SchemaDesignerModalProps) => {
  const [parsedModels, setParsedModels] = useState<ParsedModel[]>([]);
  const [tableName, setTableName] = useState("");
  const [schemaDefinition, setSchemaDefinition] = useState("");
  const [initialSchema, setInitialSchema] = useState("");
  const [availableTables, setAvailableTables] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadAvailableTables();
      if (editTableName) {
        loadExistingSchema(editTableName);
      } else {
        // Reset for new schema
        setTableName("");
        setSchemaDefinition("");
        setInitialSchema("");
        setParsedModels([]);
      }
    }
  }, [open, editTableName]);

  const loadAvailableTables = async () => {
    const { data } = await supabase
      .from("database_designer")
      .select("table_name");
    
    if (data) {
      setAvailableTables(data.map(d => d.table_name));
    }
  };

  const loadExistingSchema = async (name: string) => {
    const { data, error } = await supabase
      .from("database_designer")
      .select("*")
      .eq("table_name", name)
      .maybeSingle();

    if (data && !error) {
      setTableName(data.table_name);
      setInitialSchema(data.schema_definition);
      setSchemaDefinition(data.schema_definition);
      const models = parsePrismaSchema(data.schema_definition);
      setParsedModels(models);
    }
  };

  const handleSchemaChange = (schema: string, name: string) => {
    setSchemaDefinition(schema);
    setTableName(name);
    const models = parsePrismaSchema(schema);
    setParsedModels(models);
  };

  const handleSaved = () => {
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">
            {editTableName ? `Edit Schema: ${editTableName}` : "Create New Schema"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <SchemaInput
              onSchemaChange={handleSchemaChange}
              initialTableName={tableName}
              initialSchema={initialSchema}
              availableTables={availableTables.filter(t => t !== editTableName)}
            />
            <GeneratedOutput
              models={parsedModels}
              tableName={tableName}
              schemaDefinition={schemaDefinition}
              onSaved={handleSaved}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
