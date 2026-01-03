import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { parsePrismaSchema } from "../lib/schemaParser";
import { ZoomIn, ZoomOut, Maximize2, Move } from "lucide-react";

interface TableNode {
  id: string;
  name: string;
  x: number;
  y: number;
  fields: Array<{
    name: string;
    type: string;
    isId: boolean;
    isUnique: boolean;
  }>;
}

interface ERDiagramProps {
  className?: string;
}

export function ERDiagram({ className }: ERDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tables, setTables] = useState<TableNode[]>([]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('database_designer')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const tableNodes: TableNode[] = (data || []).map((item, index) => {
        const models = parsePrismaSchema(item.schema_definition);
        const model = models[0];
        
        // Position tables in a grid
        const cols = 3;
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        return {
          id: item.id,
          name: item.table_name,
          x: 50 + col * 280,
          y: 50 + row * 250,
          fields: model?.fields.map(f => ({
            name: f.name,
            type: f.type,
            isId: f.isId,
            isUnique: f.isUnique,
          })) || [],
        };
      });

      setTables(tableNodes);
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Entity Relationship Diagram</CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleReset} className="h-8 w-8">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="erd-canvas relative h-[500px] border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Loading diagram...
            </div>
          ) : tables.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Move className="h-8 w-8 opacity-50" />
              <p>No tables to display</p>
              <p className="text-sm">Create some schemas to see them here</p>
            </div>
          ) : (
            <div
              className="absolute inset-0 transition-transform"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'top left',
              }}
            >
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="absolute bg-card border rounded-lg shadow-md overflow-hidden min-w-[200px] animate-scale-in"
                  style={{ left: table.x, top: table.y }}
                >
                  <div className="bg-primary text-primary-foreground px-3 py-2 font-medium text-sm">
                    {table.name}
                  </div>
                  <div className="p-2 space-y-1">
                    {table.fields.slice(0, 8).map((field, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs px-2 py-1 rounded hover:bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          {field.isId && (
                            <Badge variant="outline" className="h-4 px-1 text-[10px]">PK</Badge>
                          )}
                          <span className={field.isId ? 'font-medium' : ''}>{field.name}</span>
                        </div>
                        <span className="text-muted-foreground">{field.type}</span>
                      </div>
                    ))}
                    {table.fields.length > 8 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        +{table.fields.length - 8} more fields
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
