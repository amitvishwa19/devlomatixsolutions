import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./flowgenix/pages/Index.tsx";
import Setup from "./flowgenix/pages/Setup.tsx";
import Canvas from "./flowgenix/pages/Canvas.tsx";
import CanvasIndex from "./flowgenix/pages/CanvasIndex.tsx";
import Workflows from "./flowgenix/pages/Workflows.tsx";
import RunHistory from "./flowgenix/pages/RunHistory.tsx";
import Credentials from "./flowgenix/pages/Credentials.tsx";
import NotFound from "./flowgenix/pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/runs" element={<RunHistory />} />
          <Route path="/credentials" element={<Credentials />} />
          <Route path="/canvas" element={<CanvasIndex />} />
          <Route path="/canvas/:id" element={<Canvas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
