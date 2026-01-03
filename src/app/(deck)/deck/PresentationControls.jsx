import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Maximize, 
  Minimize, 
  Play, 
  Pause, 
  Grid3X3,
  X,
  Loader2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PresentationControls = ({ 
  currentSlide, 
  totalSlides, 
  onGoToSlide,
  isAutoPlaying,
  onToggleAutoPlay,
  slideComponents,
  onExportStart,
  onExportEnd
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingSlide, setExportingSlide] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const exportCancelledRef = useRef(false);

  // Start timer on mount
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Handle Escape key to cancel export
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isExporting) {
        e.preventDefault();
        cancelExport();
      }
    };

    if (isExporting) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExporting]);

  const cancelExport = () => {
    exportCancelledRef.current = true;
    setIsExporting(false);
    setExportProgress(0);
    setExportingSlide(0);
    toast({
      title: "Export Cancelled",
      description: "PDF generation was cancelled.",
    });
    onExportEnd?.();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportingSlide(0);
    exportCancelledRef.current = false;
    onExportStart?.();

    toast({
      title: "Generating PDF",
      description: `Capturing ${totalSlides} slides. Press Escape to cancel.`,
    });

    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const waitForFonts = async () => {
      // Ensure custom webfonts are ready before capture
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }
      } catch {
        // ignore
      }
    };

    const waitForImages = async (rootEl) => {
      const images = Array.from(rootEl.querySelectorAll("img"));
      await Promise.all(
        images.map(async (img) => {
          try {
            if (img.complete && img.naturalWidth > 0) return;

            await new Promise((resolve) => {
              const cleanup = () => {
                img.removeEventListener("load", onDone);
                img.removeEventListener("error", onDone);
              };
              const onDone = () => {
                cleanup();
                resolve();
              };
              img.addEventListener("load", onDone);
              img.addEventListener("error", onDone);
            });

            if (img.decode) {
              try {
                await img.decode();
              } catch {
                // ignore
              }
            }
          } catch {
            // ignore
          }
        })
      );
    };

    const preloadInlineBackgroundImages = async (rootEl) => {
      // Some slides use inline style backgroundImage (e.g. hero images). Preload them.
      const urls = new Set();
      const all = Array.from(rootEl.querySelectorAll("*"));
      for (const el of all) {
        const bg = el.style?.backgroundImage;
        if (!bg || !bg.includes("url(")) continue;
        const matches = [...bg.matchAll(/url\(["']?(.*?)["']?\)/g)];
        for (const m of matches) {
          if (m?.[1]) urls.add(m[1]);
        }
      }

      await Promise.all(
        Array.from(urls).map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = src;
            })
        )
      );
    };

    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1920, 1080],
      });

      // Create a hidden container for rendering slides
      const hiddenContainer = document.createElement("div");
      hiddenContainer.style.position = "fixed";
      hiddenContainer.style.left = "-9999px";
      hiddenContainer.style.top = "0";
      hiddenContainer.style.width = "1920px";
      hiddenContainer.style.height = "1080px";
      hiddenContainer.style.overflow = "hidden";
      // IMPORTANT: --background is an HSL tuple, so it must be wrapped in hsl(...)
      hiddenContainer.style.background = "hsl(var(--background))";
      hiddenContainer.style.color = "hsl(var(--foreground))";
      document.body.appendChild(hiddenContainer);

      // Import ReactDOM for rendering
      const ReactDOM = await import("react-dom/client");

      try {
        for (let i = 0; i < slideComponents.length; i++) {
          // Check if export was cancelled
          if (exportCancelledRef.current) {
            break;
          }

          setExportingSlide(i + 1);
          setExportProgress(Math.round(((i) / slideComponents.length) * 100));

          const SlideComponent = slideComponents[i].component;

          // Create a wrapper for the slide
          const slideWrapper = document.createElement("div");
          slideWrapper.style.width = "1920px";
          slideWrapper.style.height = "1080px";
          slideWrapper.style.position = "relative";
          slideWrapper.style.overflow = "hidden";
          slideWrapper.style.background = "hsl(var(--background))";
          slideWrapper.style.color = "hsl(var(--foreground))";
          hiddenContainer.innerHTML = "";
          hiddenContainer.appendChild(slideWrapper);

          // Render the slide component
          const root = ReactDOM.createRoot(slideWrapper);
          root.render(<SlideComponent />);

          // Wait for DOM/layout + fonts/images + initial animations to finish
          await waitForFonts();
          await wait(50);
          
          if (exportCancelledRef.current) {
            root.unmount();
            break;
          }

          await preloadInlineBackgroundImages(slideWrapper);
          await waitForImages(slideWrapper);
          await wait(1400);

          if (exportCancelledRef.current) {
            root.unmount();
            break;
          }

          const bgColor = getComputedStyle(slideWrapper).backgroundColor;

          // Capture the slide
          const canvas = await html2canvas(slideWrapper, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: bgColor,
            width: 1920,
            height: 1080,
            windowWidth: 1920,
            windowHeight: 1080,
            scrollX: 0,
            scrollY: 0,
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.9);

          if (i > 0) {
            pdf.addPage([1920, 1080], "landscape");
          }
          pdf.addImage(imgData, "JPEG", 0, 0, 1920, 1080);

          root.unmount();
          
          setExportProgress(Math.round(((i + 1) / slideComponents.length) * 100));
        }

        // Only save if not cancelled
        if (!exportCancelledRef.current) {
          pdf.save("healthcare-presentation.pdf");

          toast({
            title: "PDF Exported",
            description: `Successfully exported ${totalSlides} slides.`,
          });
        }
      } finally {
        document.body.removeChild(hiddenContainer);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      onExportEnd?.();
    }
  };

  return (
    <>
      {/* Control Bar */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-6 left-20 z-50 flex items-center gap-2"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAutoPlay}
          className="glass hover:bg-primary/20"
          title={isAutoPlaying ? "Pause autoplay" : "Start autoplay"}
        >
          {isAutoPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowGrid(true)}
          className="glass hover:bg-primary/20"
          title="View all slides"
        >
          <Grid3X3 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="glass hover:bg-primary/20"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={exportToPDF}
          disabled={isExporting}
          className="glass hover:bg-primary/20"
          title="Export to PDF"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </Button>

        {/* Timer Display */}
        <div className="glass px-3 py-2 rounded-full flex items-center gap-2" title="Presentation duration">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-medium text-foreground">
            {formatTime(elapsedTime)}
          </span>
        </div>
      </motion.div>

      {/* PDF Export Progress Modal */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass p-8 rounded-2xl max-w-md w-full mx-4 text-center"
            >
              <div className="mb-6">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                  Generating PDF
                </h3>
                <p className="text-muted-foreground">
                  Capturing slide {exportingSlide} of {totalSlides}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <p className="text-2xl font-bold text-foreground mb-4">
                {exportProgress}%
              </p>

              {/* Cancel Button */}
              <Button
                variant="outline"
                onClick={cancelExport}
                className="mt-2"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel (Esc)
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide Grid Modal */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-lg overflow-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-heading font-bold text-foreground">
                  All Slides ({totalSlides})
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGrid(false)}
                  className="hover:bg-primary/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {slideComponents.map((slide, index) => {
                  const SlideComponent = slide.component;
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => {
                        onGoToSlide(index);
                        setShowGrid(false);
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-xl ${
                        currentSlide === index
                          ? "border-primary ring-2 ring-primary/50"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {/* Scaled down slide preview */}
                      <div className="absolute inset-0 origin-top-left scale-[0.15] w-[666%] h-[666%] pointer-events-none overflow-hidden">
                        <SlideComponent />
                      </div>
                      
                      {/* Slide number overlay */}
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs font-medium text-foreground">
                        {index + 1}
                      </div>
                      
                      {currentSlide === index && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-primary rounded text-xs font-medium text-primary-foreground">
                          Current
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PresentationControls;
