import { useEffect, useState } from "react";
import { AppLayout } from "@/flowgenix/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteCredential,
  listCredentials,
  type NodeCredentialRow,
} from "@/flowgenix/lib/node-credentials";

const Credentials = () => {
  const [rows, setRows] = useState<NodeCredentialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await listCredentials());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onDelete = async (id: string) => {
    setBusyId(id);
    try {
      await deleteCredential(id);
      setRows((r) => r.filter((x) => x.id !== id));
      toast.success("Deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <h1 className="font-mono text-lg font-semibold">Credentials</h1>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Reusable settings & secret presets per node kind. Sensitive values are stored in a separate table; the workflow JSON only keeps a reference.
        </p>

        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-mono text-xs">Name</TableHead>
                <TableHead className="font-mono text-xs">Kind</TableHead>
                <TableHead className="font-mono text-xs">Has secret</TableHead>
                <TableHead className="font-mono text-xs">Updated</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center font-mono text-xs text-muted-foreground">
                    loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center font-mono text-xs text-muted-foreground">
                    No presets yet — save one from any node's settings
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.name}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{r.kind}</TableCell>
                    <TableCell>
                      {r.secret_id ? (
                        <Badge variant="secondary" className="font-mono text-[10px]">yes</Badge>
                      ) : (
                        <span className="font-mono text-[10px] text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                      {new Date(r.updated_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busyId === r.id}
                        onClick={() => onDelete(r.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        {busyId === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
};

export default Credentials;
