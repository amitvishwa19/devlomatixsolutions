import { useState } from "react";
import { Copy, Check, Link, Mail, Users, X, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ShareDocumentDialog({ open, onOpenChange, document, sharedUsers, onShare, onRemoveShare, onUpdatePermission }) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShare = () => {
    if (email.trim()) {
      onShare(email.trim(), permission);
      setEmail("");
      setPermission("view");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://medicare.app/documents/shared/${document?.id}`);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (!document) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Share Document</SheetTitle>
          <SheetDescription>Share "{document.name}" with team members.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)] mt-4">
          <div className="space-y-5 pr-4">
            <div className="space-y-3">
              <Label>Add people</Label>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" onKeyDown={(e) => e.key === "Enter" && handleShare()} />
                </div>
                <div className="flex gap-2">
                  <Select value={permission} onValueChange={setPermission}>
                    <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">Can view</SelectItem>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="admin">Full access</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleShare} disabled={!email.trim()}><UserPlus className="h-4 w-4 mr-2" />Add</Button>
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Shared with ({sharedUsers.length})</Label>
              {sharedUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Not shared yet</p>
              ) : (
                <div className="space-y-2">
                  {sharedUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 group">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs">{user.name.split(" ").map(n => n[0]).join("").toUpperCase()}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user.name}</p><p className="text-xs text-muted-foreground truncate">{user.email}</p></div>
                      <Select value={user.permission} onValueChange={(value) => onUpdatePermission(user.id, value)}>
                        <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="view">Can view</SelectItem><SelectItem value="edit">Can edit</SelectItem><SelectItem value="admin">Full access</SelectItem></SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => onRemoveShare(user.id)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Separator />
            <div className="space-y-3">
              <Label>Get shareable link</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border"><Link className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground truncate">medicare.app/documents/...</span></div>
                <Button variant="outline" onClick={handleCopyLink}>{linkCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}</Button>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
