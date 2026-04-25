import { useEffect, useState } from "react";
import { FileText, Film, Image as ImageIcon, AlertTriangle } from "lucide-react";

// MIME → expected template header format
const MIME_TO_FORMAT = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/webp": "IMAGE",
  "video/mp4": "VIDEO",
  "video/3gpp": "VIDEO",
  "application/pdf": "DOCUMENT",
};

export function detectMismatch(file, expectedFormat) {
  if (!file || !expectedFormat || expectedFormat === "TEXT" || expectedFormat === "NONE") return null;
  const detected = MIME_TO_FORMAT[file.type];
  if (!detected) return `Unsupported file type "${file.type}". Meta accepts JPEG/PNG, MP4/3GP, or PDF.`;
  if (detected !== expectedFormat) {
    return `This template's header expects ${expectedFormat}, but you picked a ${detected} file.`;
  }
  return null;
}

export function MediaPreview({ file, expectedFormat }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pdfThumb, setPdfThumb] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setPdfThumb(null);
      setPdfError(null);
      return;
    }
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    if (file.type === "application/pdf") {
      let cancelled = false;
      (async () => {
        try {
          // pdfjs needs a worker; use the CDN-hosted one for the matching version
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
          const buf = await file.arrayBuffer();
          const doc = await pdfjs.getDocument({ data: buf }).promise;
          const page = await doc.getPage(1);
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const scale = Math.min(240 / viewport.width, 320 / viewport.height);
          const v = page.getViewport({ scale });
          canvas.width = v.width;
          canvas.height = v.height;
          await page.render({ canvasContext: ctx, viewport: v }).promise;
          if (!cancelled) setPdfThumb(canvas.toDataURL("image/png"));
        } catch (e) {
          if (!cancelled) setPdfError(e?.message || "Could not render PDF");
        }
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [file]);

  const mismatch = detectMismatch(file, expectedFormat);

  if (!file) return null;

  const sizeKb = (file.size / 1024).toFixed(1);
  const sizeLabel = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3 rounded-md border border-border/60 bg-card/40 p-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted">
          {file.type.startsWith("image/") && previewUrl ? (
            <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />
          ) : file.type.startsWith("video/") && previewUrl ? (
            <video src={previewUrl} className="h-full w-full object-cover" muted />
          ) : file.type === "application/pdf" && pdfThumb ? (
            <img src={pdfThumb} alt="PDF first page" className="h-full w-full object-cover" />
          ) : file.type === "application/pdf" ? (
            <FileText className="h-8 w-8 text-muted-foreground" />
          ) : file.type.startsWith("video/") ? (
            <Film className="h-8 w-8 text-muted-foreground" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{file.type || "unknown"} · {sizeLabel}</p>
          {pdfError && <p className="text-[11px] text-amber-600 dark:text-amber-400">PDF preview: {pdfError}</p>}
        </div>
      </div>
      {mismatch && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{mismatch}</span>
        </div>
      )}
    </div>
  );
}
