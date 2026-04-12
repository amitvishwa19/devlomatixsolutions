import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import LandingPage from "./ATS/pages/LandingPage";
import AdminLayout from "./ATS/components/AdminLayout";
import Dashboard from "./ATS/pages/admin/Dashboard";
import Jobs from "./ATS/pages/admin/Jobs";
import Candidates from "./ATS/pages/admin/Candidates";
import CandidateDetail from "./ATS/pages/admin/CandidateDetail";
import Pipeline from "./ATS/pages/admin/Pipeline";
import Interviews from "./ATS/pages/admin/Interviews";
import Analytics from "./ATS/pages/admin/Analytics";
import Settings from "./ATS/pages/admin/Settings";
import Reports from "./ATS/pages/admin/Reports";
import TalentPool from "./ATS/pages/admin/TalentPool";
import ResumeBank from "./ATS/pages/admin/ResumeBank";
import OfferManagement from "./ATS/pages/admin/OfferManagement";
import CandidateCompare from "./ATS/pages/admin/CandidateCompare";
import Onboarding from "./ATS/pages/admin/Onboarding";
import WorkflowAutomation from "./ATS/pages/admin/WorkflowAutomation";
import Compliance from "./ATS/pages/admin/Compliance";
import CareerPageBuilder from "./ATS/pages/admin/CareerPageBuilder";
import TeamWorkload from "./ATS/pages/admin/TeamWorkload";
import AuditLog from "./ATS/pages/admin/AuditLog";
import HelpDocumentation from "./ATS/pages/admin/HelpDocumentation";
import CandidatePortal from "./ATS/pages/CandidatePortal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="candidates/:id" element={<CandidateDetail />} />
            <Route path="pipeline" element={<Pipeline />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="talent-pool" element={<TalentPool />} />
            <Route path="resumes" element={<ResumeBank />} />
            <Route path="offers" element={<OfferManagement />} />
            <Route path="compare" element={<CandidateCompare />} />
            <Route path="reports" element={<Reports />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="workflows" element={<WorkflowAutomation />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="career-page" element={<CareerPageBuilder />} />
            <Route path="team-workload" element={<TeamWorkload />} />
            <Route path="audit-log" element={<AuditLog />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<HelpDocumentation />} />
          </Route>
          <Route path="/portal" element={<CandidatePortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
