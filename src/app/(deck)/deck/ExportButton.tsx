import { motion } from "framer-motion";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ExportButtonProps {
    totalSlides: number;
    onGoToSlide: (index: number) => void;
    getCurrentSlideElement: () => HTMLElement | null;
}

const ExportButton = ({ totalSlides, onGoToSlide, getCurrentSlideElement }: ExportButtonProps) => {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const exportToPDF = async () => {
        setIsExporting(true);
        setProgress(0);

        // Store original slide
        const originalSlide = 0;

        try {
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [1920, 1080],
            });

            // Get the computed background color from the current theme
            const computedStyle = getComputedStyle(document.documentElement);
            const bgColor = computedStyle.getPropertyValue('--background').trim();
            const [h, s, l] = bgColor.split(' ').map(v => parseFloat(v));
            const backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;

            for (let i = 0; i < totalSlides; i++) {
                onGoToSlide(i);
                // Wait longer for animations to fully complete
                await new Promise((resolve) => setTimeout(resolve, 1500));

                const slideElement = getCurrentSlideElement();
                if (slideElement) {
                    const canvas = await html2canvas(slideElement, {
                        scale: 2,
                        useCORS: true,
                        backgroundColor: backgroundColor,
                        logging: false,
                        allowTaint: true,
                        removeContainer: true,
                        // Ignore animations during capture
                        onclone: (clonedDoc) => {
                            // Remove all animations from cloned document
                            const style = clonedDoc.createElement('style');
                            style.innerHTML = `
                *, *::before, *::after {
                  animation: none !important;
                  transition: none !important;
                  transform: none !important;
                }
              `;
                            clonedDoc.head.appendChild(style);

                            // Ensure all elements are visible
                            const allElements = clonedDoc.querySelectorAll('*');
                            allElements.forEach((el) => {
                                const element = el as HTMLElement;
                                if (element.style) {
                                    element.style.opacity = '1';
                                }
                            });
                        },
                    });

                    const imgData = canvas.toDataURL("image/png", 1.0);

                    if (i > 0) {
                        pdf.addPage([1920, 1080], "landscape");
                    }

                    pdf.addImage(imgData, "PNG", 0, 0, 1920, 1080);
                }

                setProgress(Math.round(((i + 1) / totalSlides) * 100));
            }

            pdf.save("MediCare-Presentation.pdf");
            onGoToSlide(originalSlide);
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setIsExporting(false);
            setProgress(0);
        }
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            onClick={exportToPDF}
            disabled={isExporting}
            className=" p-2 glass-effect rounded-full hover:bg-muted/50 transition-colors z-50 flex items-center gap-2 disabled:opacity-50"
            aria-label="Export to PDF"
        >
            {isExporting ? (
                <>
                    <Loader2 className="w-5 h-5 text-foreground animate-spin" />
                    <span className="text-sm text-foreground pr-2">{progress}%</span>
                </>
            ) : (
                <Download className="w-5 h-5 text-foreground" />
            )}
        </motion.button>
    );
};

export default ExportButton;
