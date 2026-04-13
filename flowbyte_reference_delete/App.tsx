import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/flowbite/hooks/useAuth";
import AppLayout from "@/flowbite/layouts/AppLayout";
import Index from "@/flowbite/pages/Index";
import WorkflowEditor from "@/flowbite/pages/WorkflowEditor";
import Executions from "@/flowbite/pages/Executions";
import Credentials from "@/flowbite/pages/Credentials";
import Templates from "@/flowbite/pages/Templates";
import Settings from "@/flowbite/pages/Settings";
import Auth from "@/flowbite/pages/Auth";
import NotFound from "@/flowbite/pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<Index />} />
        <Route path="/executions" element={<Executions />} />
        <Route path="/credentials" element={<Credentials />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/workflow/:id" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
