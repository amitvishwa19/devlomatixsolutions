import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

import before1 from "@/assets/gallery-before-1.jpg";
import after1 from "@/assets/gallery-after-1.jpg";
import before2 from "@/assets/gallery-before-2.jpg";
import after2 from "@/assets/gallery-after-2.jpg";
import before3 from "@/assets/gallery-before-3.jpg";
import after3 from "@/assets/gallery-after-3.jpg";
import before4 from "@/assets/gallery-before-4.jpg";
import after4 from "@/assets/gallery-after-4.jpg";

const galleryItems = [
  {
    beforeImg: before1,
    afterImg: after1,
    before: "Thick dust layer reducing output by 35%",
    after: "Spotless panels — full efficiency restored",
    type: "Residential",
    panels: "24 panels",
    efficiency: "+35%",
  },
  {
    beforeImg: before2,
    afterImg: after2,
    before: "Bird droppings and debris buildup",
    after: "Deep cleaned with soft chemicals",
    type: "Commercial",
    panels: "120 panels",
    efficiency: "+28%",
  },
  {
    beforeImg: before3,
    afterImg: after3,
    before: "Pollution stains after monsoon season",
    after: "Crystal clear — ready for peak sunlight",
    type: "Solar Farm",
    panels: "500+ panels",
    efficiency: "+40%",
  },
  {
    beforeImg: before4,
    afterImg: after4,
    before: "Hard water deposits and mineral scaling",
    after: "Chemical treatment removed all deposits",
    type: "Industrial",
    panels: "80 panels",
    efficiency: "+32%",
  },
];

interface BeforeAfterSliderProps {
  beforeImg: string;
  afterImg: string;
}

const BeforeAfterSlider = ({ beforeImg, afterImg }: BeforeAfterSliderProps) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-56 sm:h-64 overflow-hidden cursor-col-resize select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After image (full) */}
      <img
        src={afterImg}
        alt="After cleaning"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        width={800}
        height={512}
      />

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImg}
          alt="Before cleaning"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${containerRef.current?.offsetWidth || 800}px`, maxWidth: "none" }}
          loading="lazy"
          width={800}
          height={512}
        />
      </div>

      {/* Slider line & handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="w-0.5 h-full bg-primary-foreground/90 shadow-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary border-2 border-primary-foreground shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
            <path d="M5 3L2 8L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-20">
        <Badge className="bg-destructive/80 text-destructive-foreground text-xs backdrop-blur-sm border-0">
          Before
        </Badge>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <Badge className="bg-primary/80 text-primary-foreground text-xs backdrop-blur-sm border-0">
          After
        </Badge>
      </div>
    </div>
  );
};

const Gallery = () => {
  return (
    <section id="gallery" className="py-28 relative overflow-hidden bg-muted/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[200px]" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-[0.2em] mb-4">
            <span className="w-8 h-px bg-primary" />
            Our Work
            <span className="w-8 h-px bg-primary" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Before & After Results
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Drag the slider to see the dramatic difference professional cleaning makes.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              <BeforeAfterSlider beforeImg={item.beforeImg} afterImg={item.afterImg} />

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                    {item.type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.panels}</span>
                    <Badge className="bg-primary/10 text-primary border-0 text-xs font-bold">
                      {item.efficiency} output
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-destructive/80 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
                    {item.before}
                  </p>
                  <p className="text-sm text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {item.after}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
