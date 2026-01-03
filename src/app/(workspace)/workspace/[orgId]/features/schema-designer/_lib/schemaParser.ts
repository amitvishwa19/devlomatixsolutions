export interface SchemaField {
  name: string;
  type: string;
  isOptional: boolean;
  isId: boolean;
  isUnique: boolean;
  defaultValue?: string;
  relation?: {
    model: string;
    fields: string[];
    references: string[];
    onDelete?: string;
  };
}

export interface ParsedModel {
  name: string;
  fields: SchemaField[];
}

// Map Prisma types to PostgreSQL types
const typeMapping: Record<string, string> = {
  'String': 'TEXT',
  'Int': 'INTEGER',
  'Float': 'DOUBLE PRECISION',
  'Boolean': 'BOOLEAN',
  'DateTime': 'TIMESTAMPTZ',
  'Json': 'JSONB',
  'BigInt': 'BIGINT',
  'Decimal': 'DECIMAL',
  'Bytes': 'BYTEA',
};

export function parsePrismaSchema(schema: string): ParsedModel[] {
  const models: ParsedModel[] = [];
  const lines = schema.split('\n').map(l => l.trim()).filter(l => l);
  
  let currentModel: ParsedModel | null = null;
  
  for (const line of lines) {
    // Skip comments
    if (line.startsWith('//') || line.startsWith('@@')) continue;
    
    // Check for model definition (we treat any indented field block as a model)
    // For single model input, treat the whole thing as one model
    if (!currentModel && lines.some(l => l.includes('@id'))) {
      // Extract model name if present, otherwise use "CustomModel"
      const modelMatch = schema.match(/model\s+(\w+)\s*\{/);
      currentModel = {
        name: modelMatch ? modelMatch[1] : 'CustomModel',
        fields: []
      };
    }
    
    if (!currentModel) continue;
    
    // Parse field line
    const fieldMatch = line.match(/^(\w+)\s+(\w+)(\?)?\s*(.*)?$/);
    if (fieldMatch && !line.startsWith('model') && !line.startsWith('}')) {
      const [, name, type, optional, decorators = ''] = fieldMatch;
      
      // Skip relation fields (they reference other models)
      if (decorators.includes('@relation')) {
        const relationMatch = decorators.match(/@relation\(fields:\s*\[(\w+)\],\s*references:\s*\[(\w+)\](?:,\s*onDelete:(\w+))?\)/);
        if (relationMatch) {
          // This is a relation definition, skip the model reference but keep the foreign key field
          continue;
        }
      }
      
      const field: SchemaField = {
        name,
        type,
        isOptional: optional === '?',
        isId: decorators.includes('@id'),
        isUnique: decorators.includes('@unique'),
      };
      
      // Parse default value
      const defaultMatch = decorators.match(/@default\((\w+)(\()?(\))?\)/);
      if (defaultMatch) {
        field.defaultValue = defaultMatch[1];
      }
      
      currentModel.fields.push(field);
    }
  }
  
  if (currentModel && currentModel.fields.length > 0) {
    models.push(currentModel);
  }
  
  return models;
}

export function generateMigrationSQL(model: ParsedModel): string {
  const tableName = model.name.toLowerCase() + 's';
  const columns: string[] = [];
  
  for (const field of model.fields) {
    let sqlType = typeMapping[field.type] || 'TEXT';
    let columnDef = `${field.name} ${sqlType}`;
    
    // Handle ID field
    if (field.isId) {
      if (field.defaultValue === 'cuid' || field.defaultValue === 'uuid') {
        columnDef = `${field.name} UUID PRIMARY KEY DEFAULT gen_random_uuid()`;
      } else {
        columnDef = `${field.name} ${sqlType} PRIMARY KEY`;
      }
    } else {
      // Handle nullable
      if (!field.isOptional) {
        columnDef += ' NOT NULL';
      }
      
      // Handle unique
      if (field.isUnique) {
        columnDef += ' UNIQUE';
      }
      
      // Handle defaults
      if (field.defaultValue === 'now') {
        columnDef += ' DEFAULT now()';
      } else if (field.defaultValue === 'true') {
        columnDef += ' DEFAULT true';
      } else if (field.defaultValue === 'false') {
        columnDef += ' DEFAULT false';
      }
    }
    
    columns.push(columnDef);
  }
  
  // Check if there's a userId field for foreign key
  const hasUserId = model.fields.some(f => f.name === 'userId');
  
  const sql = `-- Create ${tableName} table
CREATE TABLE IF NOT EXISTS public.${tableName} (
  ${columns.join(',\n  ')}
);

-- Enable RLS
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read ${tableName}" ON public.${tableName} FOR SELECT USING (true);
CREATE POLICY "Public manage ${tableName}" ON public.${tableName} FOR ALL USING (true) WITH CHECK (true);

-- Create updated_at trigger if column exists
${model.fields.some(f => f.name === 'updatedAt') ? `
DROP TRIGGER IF EXISTS update_${tableName}_updated_at ON public.${tableName};
CREATE TRIGGER update_${tableName}_updated_at BEFORE UPDATE ON public.${tableName}
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
` : ''}`;

  return sql;
}

export function generateSeedData(model: ParsedModel, count: number = 10): Record<string, unknown>[] {
  const seeds: Record<string, unknown>[] = [];
  
  for (let i = 0; i < count; i++) {
    const record: Record<string, unknown> = {};
    
    for (const field of model.fields) {
      // Skip auto-generated fields
      if (field.isId && (field.defaultValue === 'cuid' || field.defaultValue === 'uuid')) {
        continue;
      }
      
      // Skip auto timestamps
      if (field.name === 'createdAt' || field.name === 'updatedAt') {
        continue;
      }
      
      // Generate mock data based on type
      switch (field.type) {
        case 'String':
          if (field.name.toLowerCase().includes('email')) {
            record[field.name] = `user${i + 1}@example.com`;
          } else if (field.name.toLowerCase().includes('name')) {
            record[field.name] = `Sample ${field.name} ${i + 1}`;
          } else if (field.name.toLowerCase().includes('height')) {
            record[field.name] = `${160 + Math.floor(Math.random() * 40)} cm`;
          } else if (field.name.toLowerCase().includes('weight')) {
            record[field.name] = `${50 + Math.floor(Math.random() * 50)} kg`;
          } else if (field.name.toLowerCase().includes('blood')) {
            record[field.name] = `${100 + Math.floor(Math.random() * 40)}/${60 + Math.floor(Math.random() * 30)}`;
          } else if (field.name.toLowerCase().includes('heart') || field.name.toLowerCase().includes('rate')) {
            record[field.name] = `${60 + Math.floor(Math.random() * 40)} bpm`;
          } else if (field.name.toLowerCase().includes('temp')) {
            record[field.name] = `${36 + Math.random() * 2}°C`;
          } else if (field.name.toLowerCase().includes('oxygen')) {
            record[field.name] = `${95 + Math.floor(Math.random() * 5)}%`;
          } else {
            record[field.name] = field.isOptional ? (Math.random() > 0.5 ? `Sample ${i + 1}` : null) : `Sample ${field.name} ${i + 1}`;
          }
          break;
        case 'Int':
        case 'BigInt':
          record[field.name] = Math.floor(Math.random() * 100);
          break;
        case 'Float':
        case 'Decimal':
          record[field.name] = Math.round(Math.random() * 100 * 100) / 100;
          break;
        case 'Boolean':
          record[field.name] = Math.random() > 0.5;
          break;
        case 'DateTime':
          record[field.name] = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
          break;
        case 'Json':
          record[field.name] = { sample: true, index: i };
          break;
        default:
          if (!field.isOptional) {
            record[field.name] = `Value ${i + 1}`;
          }
      }
    }
    
    seeds.push(record);
  }
  
  return seeds;
}

export function generateSeederCode(model: ParsedModel): string {
  const tableName = model.name.toLowerCase() + 's';
  const seedData = generateSeedData(model, 10);
  
  return `const mock${model.name}s = ${JSON.stringify(seedData, null, 2)};

// Insert into ${tableName}
const { data, error } = await supabase
  .from('${tableName}')
  .insert(mock${model.name}s)
  .select();

if (error) {
  console.error("${model.name} insert error:", error);
  throw new Error(\`Failed to insert ${tableName}: \${error.message}\`);
}
console.log(\`Inserted \${data.length} ${tableName}\`);`;
}
