import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText, Loader2, X, Copy, Check, ImageIcon, Sparkles } from "lucide-react";


export function PrescriptionParser({ onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);


  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ title: "File too large", description: "Please upload an image smaller than 10MB", variant: "destructive" }); return; }
    setSelectedFile(file); setExtractedText(null);
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result);
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!selectedFile || !selectedImage) return;
    setIsProcessing(true); setExtractedText(null);
    try {
      // Simulated extraction - replace with your own API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockExtractedText = `**Prescription Details**

        Patient Name: [Extracted from image]
        Date: ${new Date().toLocaleDateString()}

        **Medications:**
        - Medication details would be extracted here

        **Instructions:**
        - Dosage instructions would appear here

        Note: This is a placeholder. Connect to your preferred OCR/AI service to enable real prescription parsing.`;

      setExtractedText(mockExtractedText);
      toast({ title: "Prescription parsed", description: "Text extracted successfully" });
    } catch (error) {
      toast({ title: "Processing failed", description: error.message, variant: "destructive" });
    }
    finally { setIsProcessing(false); }
  };


  const copyToClipboard = async () => {
    if (!extractedText) return;
    try { await navigator.clipboard.writeText(extractedText); setCopied(true); toast({ title: "Copied" }); setTimeout(() => setCopied(false), 2000); }
    catch { console.log('prescription parcer error') }
  };

  const clearSelection = () => { setSelectedImage(null); setSelectedFile(null); setExtractedText(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div><div><h2 className="text-xl font-semibold text-foreground">AI Prescription Parser</h2><p className="text-sm text-muted-foreground">Upload a prescription image to extract text</p></div></div>
        {onClose && <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Upload Prescription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            {!selectedImage ? <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">Click to upload prescription</p>
              <p className="text-sm text-muted-foreground">JPEG, PNG up to 10MB</p>
            </div> :
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border border-border/50">
                  <img src={selectedImage} alt="Selected" className="w-full h-64 object-contain bg-black/20" />
                  <Button variant="secondary" size="icon" className="absolute top-2 right-2" onClick={clearSelection}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={processImage} disabled={isProcessing} className="flex-1">
                    {isProcessing ? <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                      : <><Sparkles className="h-4 w-4 mr-2" />
                        Extract Text</>}
                  </Button>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Change
                  </Button>
                </div>
              </div>}
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-3"><div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Extracted Text
            </CardTitle>
            {extractedText && <Button variant="ghost" size="sm" onClick={copyToClipboard}>{copied ? <Check className="h-4 w-4 mr-1.5 text-emerald-400" /> :
              <Copy className="h-4 w-4 mr-1.5" />}{copied ? "Copied" : "Copy"}</Button>}</div>
          </CardHeader>
          <CardContent>
            {isProcessing ? <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Analyzing...</p>
            </div> : extractedText ? <ScrollArea className="h-80">
              <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">{extractedText}</pre>
            </ScrollArea> : <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Upload and extract to see results
              </p>
            </div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
