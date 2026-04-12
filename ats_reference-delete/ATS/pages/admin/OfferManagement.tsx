import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DollarSign, FileCheck, Clock, CheckCircle, XCircle, Plus, TrendingUp, Send } from "lucide-react";
import { toast } from "sonner";

interface Offer {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  jobTitle: string;
  salary: string;
  equity: string;
  signingBonus: string;
  startDate: string;
  expiryDate: string;
  status: "draft" | "sent" | "accepted" | "declined" | "negotiating" | "expired";
  sentAt?: string;
  respondedAt?: string;
  notes: string;
}

const mockOffers: Offer[] = [
  { id: "o1", candidateId: "3", candidateName: "Meera Krishnan", candidateAvatar: "MK", jobTitle: "Product Designer", salary: "₹20,00,000", equity: "0.05%", signingBonus: "₹1,50,000", startDate: "2026-05-01", expiryDate: "2026-04-20", status: "sent", sentAt: "2026-04-10", notes: "Standard offer package" },
  { id: "o2", candidateId: "5", candidateName: "Deepika Nair", candidateAvatar: "DN", jobTitle: "Senior Frontend Developer", salary: "₹25,00,000", equity: "0.08%", signingBonus: "₹2,00,000", startDate: "2026-04-15", expiryDate: "2026-04-12", status: "accepted", sentAt: "2026-04-05", respondedAt: "2026-04-07", notes: "Accepted with original terms" },
  { id: "o3", candidateId: "1", candidateName: "Ananya Gupta", candidateAvatar: "AG", jobTitle: "Senior Frontend Developer", salary: "₹22,00,000", equity: "0.06%", signingBonus: "₹1,75,000", startDate: "2026-05-15", expiryDate: "2026-04-25", status: "draft", notes: "Pending final approval" },
  { id: "o4", candidateId: "6", candidateName: "Karthik Iyer", candidateAvatar: "KI", jobTitle: "Product Designer", salary: "₹18,00,000", equity: "0.04%", signingBonus: "₹1,00,000", startDate: "2026-05-01", expiryDate: "2026-04-18", status: "negotiating", sentAt: "2026-04-08", notes: "Requesting higher base salary" },
];

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  draft: { color: "bg-muted text-muted-foreground", icon: FileCheck, label: "Draft" },
  sent: { color: "bg-primary/10 text-primary", icon: Send, label: "Sent" },
  accepted: { color: "bg-success/10 text-success", icon: CheckCircle, label: "Accepted" },
  declined: { color: "bg-destructive/10 text-destructive", icon: XCircle, label: "Declined" },
  negotiating: { color: "bg-accent/20 text-accent-foreground", icon: TrendingUp, label: "Negotiating" },
  expired: { color: "bg-muted text-muted-foreground", icon: Clock, label: "Expired" },
};

const OfferManagement = () => {
  const [offers, setOffers] = useState(mockOffers);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = statusFilter === "all" ? offers : offers.filter((o) => o.status === statusFilter);

  const stats = {
    total: offers.length,
    pending: offers.filter((o) => o.status === "sent" || o.status === "negotiating").length,
    accepted: offers.filter((o) => o.status === "accepted").length,
    acceptRate: offers.length > 0 ? Math.round((offers.filter((o) => o.status === "accepted").length / offers.filter((o) => ["accepted", "declined"].includes(o.status)).length || 0) * 100) : 0,
  };

  const updateStatus = (id: string, status: Offer["status"]) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status, respondedAt: ["accepted", "declined"].includes(status) ? new Date().toISOString().split("T")[0] : o.respondedAt } : o)));
    toast.success(`Offer ${status}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-primary" /> Offer Management
          </h1>
          <p className="text-muted-foreground">Track and manage candidate offers</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Create Offer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Offer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Candidate</Label><Input placeholder="Select candidate..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Base Salary</Label><Input placeholder="$120,000" /></div>
                <div><Label>Equity</Label><Input placeholder="0.05%" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Signing Bonus</Label><Input placeholder="$10,000" /></div>
                <div><Label>Start Date</Label><Input type="date" /></div>
              </div>
              <div><Label>Offer Expiry</Label><Input type="date" /></div>
              <Button className="w-full" onClick={() => { setDialogOpen(false); toast.success("Offer created as draft"); }}>Create Draft Offer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Offers", value: stats.total, icon: FileCheck },
          { label: "Pending", value: stats.pending, icon: Clock },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle },
          { label: "Accept Rate", value: `${stats.acceptRate || 0}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Icon className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Offers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Compensation</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((offer) => {
                  const config = statusConfig[offer.status];
                  const Icon = config.icon;
                  return (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{offer.candidateAvatar}</div>
                          <span className="font-medium text-foreground">{offer.candidateName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{offer.jobTitle}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-sm font-medium text-foreground"><DollarSign className="h-3 w-3" />{offer.salary}</div>
                          <div className="text-[10px] text-muted-foreground">{offer.equity} equity • {offer.signingBonus} bonus</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{offer.startDate}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{offer.expiryDate}</TableCell>
                      <TableCell>
                        <Badge className={`${config.color} gap-1 text-xs`}><Icon className="h-3 w-3" />{config.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {offer.status === "draft" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateStatus(offer.id, "sent")}>
                              <Send className="h-3 w-3" /> Send
                            </Button>
                          )}
                          {offer.status === "sent" && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(offer.id, "accepted")}>Accept</Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" onClick={() => updateStatus(offer.id, "declined")}>Decline</Button>
                            </>
                          )}
                          {offer.status === "negotiating" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateStatus(offer.id, "sent")}>Resend</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferManagement;
