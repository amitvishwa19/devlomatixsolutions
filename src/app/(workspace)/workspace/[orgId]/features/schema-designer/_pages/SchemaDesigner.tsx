import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SchemaInput } from "../components/SchemaInput";
import { GeneratedOutput } from "../components/GeneratedOutput";
import { parsePrismaSchema, ParsedModel } from "../lib/schemaParser";
import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SchemaDesigner = () => {
  const [searchParams] = useSearchParams();
  const editTable = searchParams.get('edit');

  const [parsedModels, setParsedModels] = useState<ParsedModel[]>([]);
  const [tableName, setTableName] = useState("");
  const [schemaDefinition, setSchemaDefinition] = useState("");
  const [initialSchema, setInitialSchema] = useState("");

  useEffect(() => {
    if (editTable) {
      loadExistingSchema(editTable);
    }
  }, [editTable]);

  const loadExistingSchema = async (name: string) => {
    const { data, error } = await supabase
      .from('database_designer')
      .select('*')
      .eq('table_name', name)
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

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">
            {editTable ? `Edit: ${editTable}` : 'New Schema Design'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SchemaInput
            onSchemaChange={handleSchemaChange}
            initialTableName={tableName}
            initialSchema={initialSchema}
          />
          <GeneratedOutput
            models={parsedModels}
            tableName={tableName}
            schemaDefinition={schemaDefinition}
          />
        </div>
      </div>
    </div>
  );
};

export default SchemaDesigner;
