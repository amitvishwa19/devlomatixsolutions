import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  Calendar, 
  Droplet, 
  Eye,
  FileText,
  Stethoscope
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PatientCard({ patient }) {
  const navigate = useNavigate();
  
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
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(patient.firstName, patient.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-sm text-muted-foreground">{patient.id}</p>
              </div>
              <Badge variant="outline" className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{calculateAge(patient.dateOfBirth)} years</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplet className="h-3.5 w-3.5" />
                <span>{patient.bloodType}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span className="truncate">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span className="capitalize">{patient.gender}</span>
              </div>
            </div>

            {patient.department && (
              <div className="mt-3 flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm text-primary">{patient.department}</span>
                {patient.assignedDoctor && (
                  <span className="text-sm text-muted-foreground">• {patient.assignedDoctor}</span>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                View Profile
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Documents
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
