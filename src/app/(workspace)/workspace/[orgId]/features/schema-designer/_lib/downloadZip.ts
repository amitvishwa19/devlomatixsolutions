import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Import all source files as raw text using Vite's ?raw suffix
import indexTs from '../index.ts?raw';
import typesTs from '../types.ts?raw';
import schemaInputTsx from '../components/SchemaInput.tsx?raw';
import generatedOutputTsx from '../components/GeneratedOutput.tsx?raw';
import schemaDesignerModalTsx from '../components/SchemaDesignerModal.tsx?raw';
import erDiagramTsx from '../components/ERDiagram.tsx?raw';
import fieldRowTsx from '../components/FieldRow.tsx?raw';
import schemaToolbarTsx from '../components/SchemaToolbar.tsx?raw';
import versionHistoryDialogTsx from '../components/VersionHistoryDialog.tsx?raw';
import useFieldValidationTs from '../hooks/useFieldValidation.ts?raw';
import schemaParserTs from './schemaParser.ts?raw';
import schemaDesignerPageTsx from '../pages/SchemaDesigner.tsx?raw';

const README_CONTENT = `# Schema Designer Module

A professional database schema designer built with React and TypeScript.

## Features

- **Visual Schema Editor**: Design tables with a user-friendly interface
- **Field Validation**: Real-time validation for field names, types, and constraints
- **Import/Export**: Support for JSON and SQL export
- **Schema Versioning**: Track changes with version history
- **ERD Visualization**: Visual entity-relationship diagrams
- **Relationships**: Define foreign key relationships between tables

## Structure

\`\`\`
schema-designer/
├── components/
│   ├── SchemaInput.tsx        # Main schema input form
│   ├── GeneratedOutput.tsx    # SQL/seed code output
│   ├── SchemaDesignerModal.tsx # Modal wrapper
│   ├── ERDiagram.tsx          # Entity relationship diagram
│   ├── FieldRow.tsx           # Individual field editor
│   ├── SchemaToolbar.tsx      # Toolbar with actions
│   └── VersionHistoryDialog.tsx # Version history viewer
├── hooks/
│   └── useFieldValidation.ts  # Field validation hook
├── lib/
│   ├── schemaParser.ts        # Prisma schema parser
│   └── downloadZip.ts         # Zip download utility
├── pages/
│   └── SchemaDesigner.tsx     # Full page designer
├── types.ts                   # TypeScript interfaces
└── index.ts                   # Barrel exports
\`\`\`

## Usage

\`\`\`tsx
import { SchemaDesignerModal } from './schema-designer';

function App() {
  const [open, setOpen] = useState(false);
  
  return (
    <SchemaDesignerModal 
      open={open}
      onOpenChange={setOpen}
      onSaved={() => console.log('Schema saved!')}
    />
  );
}
\`\`\`

## Dependencies

- React 18+
- Tailwind CSS
- shadcn/ui components
- Supabase client
- lucide-react icons

## License

MIT
`;

export async function downloadSchemaDesignerZip() {
  const zip = new JSZip();
  const folder = zip.folder('schema-designer');

  if (!folder) {
    throw new Error('Failed to create folder in zip');
  }

  // Add all source files
  folder.file('index.ts', indexTs);
  folder.file('types.ts', typesTs);
  folder.file('README.md', README_CONTENT);

  // Components
  const components = folder.folder('components');
  if (components) {
    components.file('SchemaInput.tsx', schemaInputTsx);
    components.file('GeneratedOutput.tsx', generatedOutputTsx);
    components.file('SchemaDesignerModal.tsx', schemaDesignerModalTsx);
    components.file('ERDiagram.tsx', erDiagramTsx);
    components.file('FieldRow.tsx', fieldRowTsx);
    components.file('SchemaToolbar.tsx', schemaToolbarTsx);
    components.file('VersionHistoryDialog.tsx', versionHistoryDialogTsx);
  }

  // Hooks
  const hooks = folder.folder('hooks');
  if (hooks) {
    hooks.file('useFieldValidation.ts', useFieldValidationTs);
  }

  // Lib
  const lib = folder.folder('lib');
  if (lib) {
    lib.file('schemaParser.ts', schemaParserTs);
  }

  // Pages
  const pages = folder.folder('pages');
  if (pages) {
    pages.file('SchemaDesigner.tsx', schemaDesignerPageTsx);
  }

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'schema-designer.zip');
}
