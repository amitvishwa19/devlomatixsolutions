import { useState, useEffect, useCallback } from "react";
import { Key, Plus, MoreHorizontal, Trash2, Edit, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Credential {
  id: string;
  name: string;
  credential_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const CREDENTIAL_TYPES = [
  { value: "generic", label: "Generic API Key" },
  { value: "slack", label: "Slack" },
  { value: "google", label: "Google" },
  { value: "openai", label: "OpenAI" },
  { value: "postgres", label: "PostgreSQL" },
  { value: "github", label: "GitHub" },
  { value: "discord", label: "Discord" },
  { value: "smtp", label: "SMTP / Email" },
  { value: "webhook", label: "Webhook" },
];

async function callCredentialsApi(action: string, body?: Record<string, unknown>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-credentials?action=${action}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function Credentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("generic");
  const [value, setValue] = useState("");

  const fetchCredentials = useCallback(async () => {
    try {
      const data = await callCredentialsApi("list");
      setCredentials(data.credentials || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCredentials(); }, [fetchCredentials]);

  const resetForm = () => { setName(""); setType("generic"); setValue(""); setEditingId(null); };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (cred: Credential) => {
    setEditingId(cred.id);
    setName(cred.name);
    setType(cred.credential_type);
    setValue("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!editingId && !value.trim()) { toast.error("Value is required"); return; }

    setSaving(true);
    try {
      if (editingId) {
        const body: Record<string, unknown> = { id: editingId, name, credential_type: type };
        if (value.trim()) body.value = value;
        await callCredentialsApi("update", body);
        toast.success("Credential updated");
      } else {
        await callCredentialsApi("create", { name, credential_type: type, value });
        toast.success("Credential created");
      }
      setDialogOpen(false);
      resetForm();
      fetchCredentials();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await callCredentialsApi("delete", { id });
      toast.success("Credential deleted");
      fetchCredentials();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Credentials</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? "Loading..." : `${credentials.length} credential${credentials.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Credential
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : credentials.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No credentials yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Add API keys and secrets to use in your workflows</p>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add your first credential
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {credentials.map((cred) => (
            <div key={cred.id} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-muted">
                  <Key className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{cred.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {CREDENTIAL_TYPES.find(t => t.value === cred.credential_type)?.label || cred.credential_type} · Created {timeAgo(cred.created_at)}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(cred)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(cred.id)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Credential" : "Add Credential"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="My API Key" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CREDENTIAL_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{editingId ? "New Value (leave blank to keep current)" : "Value"}</Label>
              <Input type="password" value={value} onChange={e => setValue(e.target.value)} placeholder="sk-••••••••" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
