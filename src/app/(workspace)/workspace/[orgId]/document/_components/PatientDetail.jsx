import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { mockPatients } from "@/data/mockPatients";
import { mockDocuments } from "@/data/mockDocuments";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentCard } from "@/components/DocumentCard";
import { categoryLabels } from "@/types/document";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  Shield,
  AlertCircle,
  Pill,
  Stethoscope,
  FileText,
  Activity,
  Heart,
  Syringe,
  Clipboard,
  CheckCircle,
} from "lucide-react";

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const patient = mockPatients.find((p) => p.id === patientId);
  const patientDocuments = mockDocuments.filter((d) => d.patientId === patientId);

  if (!patient) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Patient Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The patient you're looking for doesn't exist.
              </p>
              <Button onClick={() => navigate("/patients")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "discharged":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "inactive":
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getHistoryIcon = (type) => {
    switch (type) {
      case "diagnosis":
        return Stethoscope;
      case "surgery":
        return Heart;
      case "treatment":
        return Pill;
      case "vaccination":
        return Syringe;
      case "checkup":
        return Clipboard;
      default:
        return Activity;
    }
  };

  const getHistoryColor = (type) => {
    switch (type) {
      case "diagnosis":
        return "text-amber-400 bg-amber-500/10";
      case "surgery":
        return "text-red-400 bg-red-500/10";
      case "treatment":
        return "text-blue-400 bg-blue-500/10";
      case "vaccination":
        return "text-emerald-400 bg-emerald-500/10";
      case "checkup":
        return "text-cyan-400 bg-cyan-500/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/patients")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>

          {/* Patient Header */}
          <Card className="bg-card/50 border-border/50 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    {getInitials(patient.firstName, patient.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {patient.firstName} {patient.lastName}
                    </h1>
                    <Badge variant="outline" className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{patient.id}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">
                        {calculateAge(patient.dateOfBirth)} years old
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground capitalize">{patient.gender}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Droplet className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Blood Type: {patient.bloodType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{patient.department}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="documents">
                Documents ({patientDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="history">Medical History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{patient.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{patient.address}</span>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Emergency Contact
                      </p>
                      <p className="text-sm font-medium">{patient.emergencyContact.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.emergencyContact.phone} • {patient.emergencyContact.relationship}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Insurance */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Insurance Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {patient.insuranceProvider ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Provider
                          </p>
                          <p className="text-sm font-medium">{patient.insuranceProvider}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            Policy Number
                          </p>
                          <p className="text-sm font-mono">{patient.insuranceNumber}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No insurance on file</p>
                    )}
                  </CardContent>
                </Card>

                {/* Allergies */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy) => (
                          <Badge
                            key={allergy}
                            variant="outline"
                            className="bg-red-500/10 text-red-400 border-red-500/30"
                          >
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-400" />
                        No known allergies
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Current Medications */}
                <Card className="bg-card/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Pill className="h-5 w-5 text-blue-400" />
                      Current Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patient.currentMedications.length > 0 ? (
                      <ul className="space-y-2">
                        {patient.currentMedications.map((medication) => (
                          <li key={medication} className="text-sm flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            {medication}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No current medications</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {patientDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {patientDocuments.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              ) : (
                <Card className="bg-card/50 border-border/50">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No Documents Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      This patient doesn't have any documents yet.
                    </p>
                    <Button>
                      <FileText className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Medical History Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

                      <div className="space-y-6">
                        {patient.medicalHistory.map((entry, index) => {
                          const Icon = getHistoryIcon(entry.type);
                          const colorClass = getHistoryColor(entry.type);

                          return (
                            <div key={entry.id} className="relative flex gap-4">
                              <div
                                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 pb-6">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h4 className="font-medium text-foreground">{entry.title}</h4>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {entry.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {new Date(entry.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}{" "}
                                  • {entry.doctor}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {entry.description}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
