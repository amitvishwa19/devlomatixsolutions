import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/flowgenix/components/AppLayout";
import { Loader2 } from "lucide-react";
import { listWorkflows } from "@/flowgenix/lib/workflow-storage";

const CanvasIndex = () => {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const wfs = await listWorkflows({ templates: false });
      if (wfs.length > 0) {
        navigate(`/canvas/${wfs[0].id}`, { replace: true });
      } else {
        navigate("/workflows", { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <AppLayout>
      <div className="flex h-full items-center justify-center text-muted-foreground font-mono text-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" /> opening canvas...
      </div>
    </AppLayout>
  );
};

export default CanvasIndex;
