'use client';

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const galleryItems = [
  {
    beforeImg: "/solarbright/gallery-before-1.jpg",
    afterImg: "/solarbright/gallery-after-1.jpg",
    before: "Thick dust layer reducing output by 35%",
    after: "Spotless panels — full efficiency restored",
    type: "Residential",
    panels: "24 panels",
    efficiency: "+35%",
  },
  {
    beforeImg: "/solarbright/gallery-before-2.jpg",
    afterImg: "/solarbright/gallery-after-2.jpg",
    before: "Bird droppings and debris buildup",
    after: "Deep cleaned with soft chemicals",
    type: "Commercial",
    panels: "120 panels",
    efficiency: "+28%",
  },
  {
    beforeImg: "/solarbright/gallery-before-3.jpg",
    afterImg: "/solarbright/gallery-after-3.jpg",
    before: "Pollution stains after monsoon season",
    after: "Crystal clear — ready for peak sunlight",
    type: "Solar Farm",
    panels: "500+ panels",
    efficiency: "+40%",
  },
  {
    beforeImg: "/solarbright/gallery-before-4.jpg",
    afterImg: "/solarbright/gallery-after-4.jpg",
    before: "Hard water deposits and mineral scaling",
    after: "Chemical treatment removed all deposits",
    type: "Industrial",
    panels: "80 panels",
    efficiency: "+32%",
  },
];

const BeforeAfterSlider = ({ beforeImg, afterImg }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-56 sm:h-64 overflow-hidden cursor-col-resize select-none bg-muted/20"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After image (full) */}
      <img
        src={afterImg}
        alt="After cleaning"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeImg}
          alt="Before cleaning"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${containerRef.current?.offsetWidth || 800}px`, maxWidth: "none" }}
          loading="lazy"
        />
      </div>

      {/* Slider line & handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="w-0.5 h-full bg-white/80 shadow-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary border-2 border-white shadow-glow flex items-center justify-center pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
            <path d="M5 3L2 8L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 3L14 8L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-20 pointer-events-none">
        <Badge className="bg-destructive/80 text-white text-[10px] backdrop-blur-sm border-0 uppercase tracking-widest px-2 py-0.5">
          Before
        </Badge>
      </div>
      <div className="absolute top-3 right-3 z-20 pointer-events-none">
        <Badge className="bg-primary/80 text-white text-[10px] backdrop-blur-sm border-0 uppercase tracking-widest px-2 py-0.5">
          After
        </Badge>
      </div>
    </div>
  );
};

const Gallery = () => {
  return (
    <section id="gallery" className="py-28 relative overflow-hidden bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[200px] pointer-events-none" />

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
          <p className="text-muted-foreground mt-4 text-lg font-light">
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
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-glow transition-all duration-300"
            >
              <BeforeAfterSlider beforeImg={item.beforeImg} afterImg={item.afterImg} />

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-border text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                    {item.type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{item.panels}</span>
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-bold uppercase tracking-wider">
                      {item.efficiency} output
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-destructive/80 flex items-center gap-2 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
                    {item.before}
                  </p>
                  <p className="text-sm text-primary flex items-center gap-2 font-medium">
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
