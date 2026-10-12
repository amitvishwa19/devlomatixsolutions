'use client';

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const galleryItems = [
  {
    beforeImg: "/solarbright/gallery-before-1.jpg",
    afterImg: "/solarbright/gallery-after-1.jpg",
    before: "Thick dust layer reducing output by 35%",
    after: "Spotless panels — full efficiency restored",
    type: "Residential Rooftop",
    panels: "24 panels",
    efficiency: "+35%",
  },
  {
    beforeImg: "/solarbright/gallery-before-2.jpg",
    afterImg: "/solarbright/gallery-after-2.jpg",
    before: "Bird droppings and industrial debris buildup",
    after: "Deep cleaned with anti-static formulation",
    type: "Commercial Office",
    panels: "120 panels",
    efficiency: "+28%",
  },
  {
    beforeImg: "/solarbright/gallery-before-3.jpg",
    afterImg: "/solarbright/gallery-after-3.jpg",
    before: "Severe dust coating post-dry season",
    after: "Crystal clear optical transmission",
    type: "Solar Farm",
    panels: "500+ panels",
    efficiency: "+40%",
  },
  {
    beforeImg: "/solarbright/gallery-before-4.jpg",
    afterImg: "/solarbright/gallery-after-4.jpg",
    before: "Hard water deposits and mineral scaling",
    after: "Deionized chemical wash eliminated deposits",
    type: "Industrial Facility",
    panels: "80 panels",
    efficiency: "+32%",
  },
];

function BeforeAfterSlider({ beforeImg, afterImg }) {
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
      {/* After image (full width beneath) */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={afterImg}
          alt="After cleaning"
          fill
          className="object-cover pointer-events-none"
        />
      </div>

      {/* Before image (clipped cleanly via CSS clip-path) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
      >
        <Image
          src={beforeImg}
          alt="Before cleaning"
          fill
          className="object-cover pointer-events-none"
        />
      </div>

      {/* Slider line & handle */}
      <div
        className="absolute top-0 bottom-0 z-10"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="w-0.5 h-full bg-white/90 shadow-lg" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center pointer-events-none">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-white">
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
        <Badge className="bg-amber-500 text-white text-[10px] backdrop-blur-sm border-0 uppercase tracking-widest px-2 py-0.5">
          After Clean
        </Badge>
      </div>
    </div>
  );
}

export function Gallery() {
  return (
    <section id="sb-gallery" className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="section-divider mx-auto max-w-5xl" />
      <div className="container mx-auto px-4 md:px-8 pt-16">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            <span className="w-6 h-px bg-amber-500" />
            Proven Track Record
            <span className="w-6 h-px bg-amber-500" />
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Before & After Field Results
          </h2>
          <p className="text-muted-foreground mt-3 text-base leading-relaxed">
            Drag the interactive divider to inspect the optical clarity and efficiency recovery.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {galleryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-border/70 bg-card overflow-hidden hover:border-amber-500/30 hover:shadow-lg transition-all"
            >
              <BeforeAfterSlider beforeImg={item.beforeImg} afterImg={item.afterImg} />

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-border text-muted-foreground text-[10px] uppercase tracking-wider font-bold">
                    {item.type}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-medium">{item.panels}</span>
                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px] font-bold uppercase tracking-wider">
                      {item.efficiency} Output
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-destructive/90 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                    {item.before}
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 flex items-center gap-2 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
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
}

export default Gallery;
