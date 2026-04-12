import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Search, Upload, Calendar, CheckCircle2, Circle, Clock, FileText, MapPin, Briefcase, Star, MessageSquare, ChevronRight, Eye, User } from "lucide-react";
import { stages } from "@/ATS/data/mockData";

interface PortalApplication {
  id: string;
  jobTitle: string;
  department: string;
  location: string;
  appliedDate: string;
  stage: string;
  stageIndex: number;
  totalStages: number;
  lastUpdate: string;
  feedback?: string;
  interviewSlots?: { id: string; date: string; time: string; type: string; booked: boolean }[];
  documents: { id: string; name: string; type: string; uploadedAt: string }[];
  timeline: { id: string; date: string; event: string; detail: string }[];
}

const mockApplications: PortalApplication[] = [
  {
    id: "app1",
    jobTitle: "Senior Frontend Developer",
    department: "Engineering",
    location: "Remote",
    appliedDate: "2026-03-18",
    stage: "Interview",
    stageIndex: 2,
    totalStages: 5,
    lastUpdate: "2026-04-10",
    interviewSlots: [
      { id: "s1", date: "2026-04-15", time: "10:00 AM", type: "Technical Interview", booked: false },
      { id: "s2", date: "2026-04-15", time: "2:00 PM", type: "Technical Interview", booked: false },
      { id: "s3", date: "2026-04-16", time: "11:00 AM", type: "Technical Interview", booked: false },
      { id: "s4", date: "2026-04-17", time: "9:00 AM", type: "Technical Interview", booked: false },
    ],
    documents: [
      { id: "d1", name: "Resume_AnanyaGupta.pdf", type: "Resume", uploadedAt: "2026-03-18" },
      { id: "d2", name: "CoverLetter.pdf", type: "Cover Letter", uploadedAt: "2026-03-18" },
    ],
    timeline: [
      { id: "t1", date: "2026-04-10", event: "Moved to Interview", detail: "You've been selected for a technical interview!" },
      { id: "t2", date: "2026-04-05", event: "Screening Completed", detail: "Your application has been reviewed by the hiring team" },
      { id: "t3", date: "2026-03-18", event: "Application Received", detail: "Thank you for applying to Senior Frontend Developer" },
    ],
  },
  {
    id: "app2",
    jobTitle: "Product Designer",
    department: "Design",
    location: "Mumbai, MH",
    appliedDate: "2026-04-01",
    stage: "Screening",
    stageIndex: 1,
    totalStages: 5,
    lastUpdate: "2026-04-08",
    documents: [
      { id: "d3", name: "Resume_AnanyaGupta.pdf", type: "Resume", uploadedAt: "2026-04-01" },
      { id: "d4", name: "Portfolio.pdf", type: "Portfolio", uploadedAt: "2026-04-01" },
    ],
    timeline: [
      { id: "t4", date: "2026-04-08", event: "Under Review", detail: "Your application is being reviewed by the design team" },
      { id: "t5", date: "2026-04-01", event: "Application Received", detail: "Thank you for applying to Product Designer" },
    ],
  },
];

const stageLabels = ["Applied", "Screening", "Interview", "Offer", "Hired"];

const CandidatePortal = () => {
  const [lookupEmail, setLookupEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [applications, setApplications] = useState<PortalApplication[]>(mockApplications);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState("Resume");
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => {
    if (!lookupEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsLoggedIn(true);
    toast.success("Welcome back! Here are your applications.");
  };

  const currentApp = applications.find((a) => a.id === selectedApp);

  const bookSlot = (appId: string, slotId: string) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === appId
          ? {
              ...app,
              interviewSlots: app.interviewSlots?.map((s) => ({ ...s, booked: s.id === slotId })),
              timeline: [
                { id: `t-${Date.now()}`, date: new Date().toISOString().split("T")[0], event: "Interview Scheduled", detail: `You selected a time slot for your interview` },
                ...app.timeline,
              ],
            }
          : app
      )
    );
    toast.success("Interview scheduled! You'll receive a confirmation email.");
  };

  const uploadDocument = () => {
    if (!uploadName || !selectedApp) return;
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp
          ? {
              ...app,
              documents: [...app.documents, { id: `d-${Date.now()}`, name: uploadName, type: uploadType, uploadedAt: new Date().toISOString().split("T")[0] }],
              timeline: [
                { id: `t-${Date.now()}`, date: new Date().toISOString().split("T")[0], event: "Document Uploaded", detail: `Uploaded ${uploadType}: ${uploadName}` },
                ...app.timeline,
              ],
            }
          : app
      )
    );
    setUploadName("");
    setUploadOpen(false);
    toast.success("Document uploaded successfully");
  };

  const sendMessage = () => {
    if (!message || !selectedApp) return;
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp
          ? {
              ...app,
              timeline: [
                { id: `t-${Date.now()}`, date: new Date().toISOString().split("T")[0], event: "Message Sent", detail: message },
                ...app.timeline,
              ],
            }
          : app
      )
    );
    setMessage("");
    setMessageOpen(false);
    toast.success("Message sent to the hiring team");
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl">Candidate Portal</CardTitle>
            <CardDescription>Check your application status, upload documents, and schedule interviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="Enter the email you applied with"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button className="w-full" onClick={handleLogin}>View My Applications</Button>
            <p className="text-xs text-center text-muted-foreground">
              Enter the email address associated with your job applications
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application detail view
  if (currentApp) {
    const bookedSlot = currentApp.interviewSlots?.find((s) => s.booked);
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)}>← Back</Button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentApp.jobTitle}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{currentApp.department}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{currentApp.location}</span>
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Applied {currentApp.appliedDate}</span>
            </div>
          </div>

          {/* Stage Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                {stageLabels.map((label, i) => (
                  <div key={label} className="flex flex-col items-center flex-1">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      i < currentApp.stageIndex ? "bg-success text-success-foreground" :
                      i === currentApp.stageIndex ? "bg-primary text-primary-foreground" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {i < currentApp.stageIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-[10px] mt-1 ${i <= currentApp.stageIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
                  </div>
                ))}
              </div>
              <Progress value={(currentApp.stageIndex / (currentApp.totalStages - 1)) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Interview Scheduling */}
          {currentApp.interviewSlots && currentApp.interviewSlots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Schedule Your Interview
                </CardTitle>
                <CardDescription>
                  {bookedSlot ? "Your interview is confirmed!" : "Select a time slot that works for you"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {currentApp.interviewSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        slot.booked ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">{slot.date}</div>
                        <div className="text-xs text-muted-foreground">{slot.time} • {slot.type}</div>
                      </div>
                      {slot.booked ? (
                        <Badge className="bg-success/10 text-success">Booked</Badge>
                      ) : bookedSlot ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => bookSlot(currentApp.id, slot.id)}>Select</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents & Messages */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Documents</CardTitle>
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1"><Upload className="h-3 w-3" /> Upload</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Document Name</Label>
                        <Input value={uploadName} onChange={(e) => setUploadName(e.target.value)} placeholder="e.g., References.pdf" />
                      </div>
                      <div className="space-y-2">
                        <Label>Document Type</Label>
                        <Select value={uploadType} onValueChange={setUploadType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Resume">Resume</SelectItem>
                            <SelectItem value="Cover Letter">Cover Letter</SelectItem>
                            <SelectItem value="Portfolio">Portfolio</SelectItem>
                            <SelectItem value="References">References</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="rounded-lg border-2 border-dashed p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Drag & drop or click to browse</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                      <Button onClick={uploadDocument} className="w-full">Upload Document</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentApp.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <div className="text-sm font-medium text-foreground">{doc.name}</div>
                          <div className="text-[10px] text-muted-foreground">{doc.type} • {doc.uploadedAt}</div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Messages</CardTitle>
                <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1"><MessageSquare className="h-3 w-3" /> Send</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Message Hiring Team</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Your Message</Label>
                        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message to the hiring team..." rows={4} />
                      </div>
                      <Button onClick={sendMessage} className="w-full">Send Message</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentApp.timeline.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="w-px flex-1 bg-border" />
                      </div>
                      <div className="pb-3">
                        <div className="text-sm font-medium text-foreground">{event.event}</div>
                        <div className="text-xs text-muted-foreground">{event.detail}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{event.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Applications list
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground">{applications.length} active applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsLoggedIn(false)}>Sign Out</Button>
        </div>

        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedApp(app.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{app.jobTitle}</h3>
                      <Badge variant="outline" className="bg-primary/10 text-primary text-[10px]">{app.stage}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{app.department}</span>
                      <span>{app.location}</span>
                      <span>Applied {app.appliedDate}</span>
                    </div>
                    <div className="mt-3">
                      <Progress value={(app.stageIndex / (app.totalStages - 1)) * 100} className="h-1.5" />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">Step {app.stageIndex + 1} of {app.totalStages}</span>
                        <span className="text-[10px] text-muted-foreground">Updated {app.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidatePortal;
