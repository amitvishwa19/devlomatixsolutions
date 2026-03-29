'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { 
 X, 
 Check, 
 Crop as CropIcon, 
 RotateCcw, 
 Image as ImageIcon,
 Sliders,
 Maximize
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

export const ImageEditor = ({ imageUrl, onSave, onCancel }) => {
 const canvasRef = useRef(null);
 const [image, setImage] = useState(null);
 const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentages
 const [isCropping, setIsCropping] = useState(false);
 const [filters, setFilters] = useState({
 brightness: 100,
 contrast: 100,
 saturate: 100,
 grayscale: 0
 });

 useEffect(() => {
 const img = new Image();
 img.crossOrigin = "anonymous";
 img.src = imageUrl;
 img.onload = () => {
 setImage(img);
 drawCanvas(img, filters);
 };
 }, [imageUrl]);

 const drawCanvas = (img, currentFilters) => {
 const canvas = canvasRef.current;
 if (!canvas || !img) return;

 const ctx = canvas.getContext('2d');
 canvas.width = img.width;
 canvas.height = img.height;

 ctx.filter = `
 brightness(${currentFilters.brightness}%) 
 contrast(${currentFilters.contrast}%) 
 saturate(${currentFilters.saturate}%) 
 grayscale(${currentFilters.grayscale}%)
 `;
 
 ctx.drawImage(img, 0, 0);
 };

 const handleFilterChange = (key, value) => {
 const newFilters = { ...filters, [key]: value };
 setFilters(newFilters);
 drawCanvas(image, newFilters);
 };

 const handleSave = () => {
 const canvas = canvasRef.current;
 if (!canvas) return;

 let finalCanvas = canvas;

 if (isCropping) {
 const cropCanvas = document.createElement('canvas');
 const cropX = (crop.x / 100) * canvas.width;
 const cropY = (crop.y / 100) * canvas.height;
 const cropW = (crop.width / 100) * canvas.width;
 const cropH = (crop.height / 100) * canvas.height;

 cropCanvas.width = cropW;
 cropCanvas.height = cropH;
 const ctx = cropCanvas.getContext('2d');
 ctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
 finalCanvas = cropCanvas;
 }

 finalCanvas.toBlob((blob) => {
 onSave(blob);
 }, 'image/webp', 0.9);
 };

 return (
 <div className="flex flex-col h-full bg-background border rounded-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
 <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/10">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-md">
 <Sliders size={18} className="text-primary" />
 </div>
 <div>
 <h3 className="text-sm text-foreground">Image Refinement</h3>
 <p className="text-[10px] font-bold text-muted-foreground opacity-60">Adjust & Crop Visual Assets</p>
 </div>
 </div>
 <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
 <X size={18} />
 </Button>
 </div>

 <div className="flex-1 flex overflow-hidden">
 {/* Preview Area */}
 <div className="flex-1 bg-black/5 flex items-center justify-center p-8 relative overflow-hidden group">
 <div className="relative max-w-full max-h-full shadow-2xl rounded-md overflow-hidden border border-border/50">
 <canvas 
 ref={canvasRef} 
 className="max-w-full max-h-[60vh] object-contain"
 />
 
 {isCropping && (
 <div 
 className="absolute border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
 style={{
 left: `${crop.x}%`,
 top: `${crop.y}%`,
 width: `${crop.width}%`,
 height: `${crop.height}%`
 }}
 >
 <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full" />
 <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full" />
 <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary rounded-full" />
 <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary rounded-full" />
 </div>
 )}
 </div>
 </div>

 {/* Settings Sidebar */}
 <div className="w-80 border-l bg-muted/5 p-6 flex flex-col gap-8 overflow-y-auto">
 <div className="space-y-4">
 <label className="text-[10px] text-muted-foreground opacity-60">Tools</label>
 <div className="grid grid-cols-2 gap-2">
 <Button 
 variant={isCropping ? "default" : "outline"} 
 onClick={() => setIsCropping(!isCropping)}
 className="h-10 text-[10px] font-bold gap-2"
 >
 <CropIcon size={14} /> {isCropping ? "Cancel Crop" : "Crop"}
 </Button>
 <Button 
 variant="outline" 
 onClick={() => {
 setFilters({ brightness: 100, contrast: 100, saturate: 100, grayscale: 0 });
 drawCanvas(image, { brightness: 100, contrast: 100, saturate: 100, grayscale: 0 });
 }}
 className="h-10 text-[10px] font-bold gap-2"
 >
 <RotateCcw size={14} /> Reset
 </Button>
 </div>
 </div>

 <div className="space-y-6">
 <label className="text-[10px] text-muted-foreground opacity-60">Adjustments</label>
 
 <div className="space-y-4">
 <div className="space-y-3">
 <div className="flex justify-between text-[10px] font-bold">
 <span className="text-muted-foreground opacity-70">Brightness</span>
 <span className="text-primary">{filters.brightness}%</span>
 </div>
 <Slider 
 value={[filters.brightness]} 
 max={200} 
 min={0} 
 step={1} 
 onValueChange={([v]) => handleFilterChange('brightness', v)} 
 />
 </div>

 <div className="space-y-3">
 <div className="flex justify-between text-[10px] font-bold">
 <span className="text-muted-foreground opacity-70">Contrast</span>
 <span className="text-primary">{filters.contrast}%</span>
 </div>
 <Slider 
 value={[filters.contrast]} 
 max={200} 
 min={0} 
 step={1} 
 onValueChange={([v]) => handleFilterChange('contrast', v)} 
 />
 </div>

 <div className="space-y-3">
 <div className="flex justify-between text-[10px] font-bold">
 <span className="text-muted-foreground opacity-70">Saturation</span>
 <span className="text-primary">{filters.saturate}%</span>
 </div>
 <Slider 
 value={[filters.saturate]} 
 max={200} 
 min={0} 
 step={1} 
 onValueChange={([v]) => handleFilterChange('saturate', v)} 
 />
 </div>

 <div className="space-y-3">
 <div className="flex justify-between text-[10px] font-bold">
 <span className="text-muted-foreground opacity-70">Grayscale</span>
 <span className="text-primary">{filters.grayscale}%</span>
 </div>
 <Slider 
 value={[filters.grayscale]} 
 max={100} 
 min={0} 
 step={1} 
 onValueChange={([v]) => handleFilterChange('grayscale', v)} 
 />
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="px-8 py-6 border-t bg-muted/10 flex items-center justify-end gap-3">
 <Button variant="ghost" onClick={onCancel} className="text-[10px] px-8">Discard</Button>
 <Button onClick={handleSave} className="bg-primary text-primary-foreground text-[10px] px-10 shadow-lg shadow-primary/20">
 <Check size={14} className="mr-2" /> Save Changes
 </Button>
 </div>
 </div>
 );
};
