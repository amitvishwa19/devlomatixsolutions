'use client'
import React from 'react'
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/components/ui/dropdown-menu';
import { FileText, Eye, Download, Printer, Loader2, ChevronDown, Sparkles, FileType } from 'lucide-react';
import { toast } from 'sonner';
//import html2canvas from 'html2canvas';
//import jsPDF from 'jspdf';
import logo from '@/assets/images/logo/logo.png';
import { QuotationForm } from './_components/QuotationForm';
import { QuotationPreview } from './_components/QuotationPreview';
import { ClassicQuotationPreview } from './_components/ClassicQuotationPreview';

export default function QuotationPage() {

    const [quotationData, setQuotationData] = useState(null);
    const [activeTab, setActiveTab] = useState('form');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [pdfStyle, setPdfStyle] = useState('modern');
    const [previewStyle, setPreviewStyle] = useState('modern');
    const modernPrintRef = useRef(null);
    const classicPrintRef = useRef(null);

    const handleGenerate = (data) => {
        setQuotationData(data);
        setActiveTab('preview');
        toast.success('Quotation generated successfully!');
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async (style) => {
        const printRef = style === 'modern' ? modernPrintRef : classicPrintRef;
        if (!printRef.current || !quotationData) return;

        setIsGeneratingPDF(true);
        setPdfStyle(style);
        toast.info(`Generating ${style === 'modern' ? 'Modern' : 'Classic'} PDF...`);

        // Small delay to ensure the correct preview is rendered
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const element = printRef.current;
            const bgColor = style === 'classic' ? '#fffef5' : '#ffffff';

            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: bgColor,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight,
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true,
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const pageHeightPx = pdfHeight / ratio;
            const totalPages = Math.ceil(imgHeight / pageHeightPx);

            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }

                const sourceY = page * pageHeightPx;
                const sourceHeight = Math.min(pageHeightPx, imgHeight - sourceY);

                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = imgWidth;
                pageCanvas.height = sourceHeight;
                const ctx = pageCanvas.getContext('2d');

                if (ctx) {
                    ctx.drawImage(
                        canvas,
                        0, sourceY,
                        imgWidth, sourceHeight,
                        0, 0,
                        imgWidth, sourceHeight
                    );

                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
                    const pageScaledHeight = sourceHeight * ratio;

                    pdf.addImage(pageImgData, 'JPEG', 0, 0, pdfWidth, pageScaledHeight);
                }
            }

            const styleLabel = style === 'modern' ? 'Modern' : 'Classic';
            const fileName = `${quotationData.quotationNumber}-${quotationData.clientName.replace(/\s+/g, '-')}-${styleLabel}.pdf`;
            pdf.save(fileName);

            toast.success('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div className='absolute inset-0 flex flex-col gap-2 p-2'>

            <ContentTopbar
                title='Quotation'
                description='Create quotation foe your client, share online and get started'
                icon='receipt-indian-rupee'

            />

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md  '>

                <div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="no-print">

                        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                            <TabsTrigger value="form" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Create Quotation
                            </TabsTrigger>
                            <TabsTrigger
                                value="preview"
                                className="flex items-center gap-2"
                                disabled={!quotationData}
                            >
                                <Eye className="h-4 w-4" />
                                Preview
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="form" className="mt-0">
                            <div className=" mx-auto">
                                <QuotationForm onGenerate={handleGenerate} />
                            </div>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-0">
                            {quotationData && (
                                <div className="space-y-4">
                                    {/* Style Toggle */}
                                    <div className="flex items-center justify-center gap-4 p-4 bg-card rounded-lg border border-border">
                                        <span className={`text-sm font-medium transition-colors ${previewStyle === 'modern' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            Modern
                                        </span>
                                        <button
                                            onClick={() => setPreviewStyle(prev => prev === 'modern' ? 'classic' : 'modern')}
                                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            aria-label="Toggle preview style"
                                        >
                                            <span className={`inline-block h-4 w-4 rounded-full bg-primary transition-transform ${previewStyle === 'classic' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className={`text-sm font-medium transition-colors ${previewStyle === 'classic' ? 'text-primary' : 'text-muted-foreground'}`}>
                                            Classic
                                        </span>
                                    </div>

                                    {/* Preview Content */}
                                    {previewStyle === 'modern' ? (
                                        <div ref={modernPrintRef}>
                                            <QuotationPreview data={quotationData} />
                                        </div>
                                    ) : (
                                        <div ref={classicPrintRef}>
                                            <ClassicQuotationPreview data={quotationData} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Hidden previews for PDF generation when not currently visible */}
                    {quotationData && previewStyle !== 'modern' && (
                        <div className="fixed -left-[9999px] top-0">
                            <div ref={modernPrintRef}>
                                <QuotationPreview data={quotationData} />
                            </div>
                        </div>
                    )}
                    {quotationData && previewStyle !== 'classic' && (
                        <div className="fixed -left-[9999px] top-0">
                            <div ref={classicPrintRef}>
                                <ClassicQuotationPreview data={quotationData} />
                            </div>
                        </div>
                    )}

                    {quotationData && (
                        <div className="hidden print:block">
                            <QuotationPreview data={quotationData} />
                        </div>
                    )}
                </div>

            </ScrollArea>



        </div >
    )
}
