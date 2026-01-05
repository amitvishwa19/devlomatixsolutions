import { useState } from "react";
import { Copy, Check, Link, Mail, Users, X, UserPlus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Document, SharedUser } from "./types";

interface ShareDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  sharedUsers: SharedUser[];
  onShare: (email: string, permission: string) => void;
  onRemoveShare: (userId: string) => void;
  onUpdatePermission: (userId: string, permission: string) => void;
}

const permissionLabels = {
  view: "Can view",
  edit: "Can edit",
  admin: "Full access",
};

const permissionColors = {
  view: "bg-secondary text-secondary-foreground",
  edit: "bg-primary/10 text-primary",
  admin: "bg-chart-3/10 text-chart-3",
};

export function ShareDocumentDialog({
  open,
  onOpenChange,
  document,
  sharedUsers,
  onShare,
  onRemoveShare,
  onUpdatePermission,
}: ShareDocumentDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShare = () => {
    if (email.trim()) {
      onShare(email.trim(), permission);
      setEmail("");
      setPermission("view");
    }
  };

  const handleCopyLink = () => {
    const link = `https://medicare.app/documents/shared/${document?.id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleCopyEmail = (userEmail: string) => {
    navigator.clipboard.writeText(userEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!document) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Share Document
          </SheetTitle>
          <SheetDescription>
            Share "{document.name}" with team members or external collaborators.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] mt-4">
          <div className="space-y-5 pr-4">
            {/* Add People Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add people</Label>
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === "Enter" && handleShare()}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={permission} onValueChange={setPermission}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">Can view</SelectItem>
                      <SelectItem value="edit">Can edit</SelectItem>
                      <SelectItem value="admin">Full access</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleShare} disabled={!email.trim()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shared With Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Shared with</Label>
                <span className="text-xs text-muted-foreground">
                  {sharedUsers.length} {sharedUsers.length === 1 ? "person" : "people"}
                </span>
              </div>

              {sharedUsers.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    This document hasn't been shared yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sharedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors group"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Select
                        value={user.permission}
                        onValueChange={(value) => onUpdatePermission(user.id, value)}
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="view">Can view</SelectItem>
                          <SelectItem value="edit">Can edit</SelectItem>
                          <SelectItem value="admin">Full access</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveShare(user.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Copy Link Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Get shareable link</Label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border">
                  <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    medicare.app/documents/shared/{document.id.slice(0, 8)}...
                  </span>
                </div>
                <Button variant="outline" onClick={handleCopyLink}>
                  {linkCopied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view this document based on their permissions.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
