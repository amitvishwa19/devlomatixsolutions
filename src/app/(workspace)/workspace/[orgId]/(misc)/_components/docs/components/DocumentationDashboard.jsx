import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
    FileText,
    GitBranch,
    Users,
    Calendar,
    Pill,
    CalendarDays,
    Tags,
    Database,
    FormInput,
    Search,
    CheckCircle2,
    Target,
    TrendingUp,
    Shield,
    BookOpen,
    Printer,
    Download,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DOCUMENTATION_SECTIONS } from './documentationData';
import { VideoTutorial, InteractiveWalkthrough } from './components';

const iconMap = {
    FileText,
    GitBranch,
    Users,
    Calendar,
    Pill,
    CalendarDays,
    Tags,
    Database,
    FormInput,
    Target,
    TrendingUp,
    Shield,
    BookOpen,
};

export default function DocumentationDashboard() {
    const [activeSection, setActiveSection] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const mainContentRef = useRef(null);

    const filteredSections = useMemo(() => {
        if (!searchQuery) return DOCUMENTATION_SECTIONS;
        const query = searchQuery.toLowerCase();
        return DOCUMENTATION_SECTIONS.filter(
            (section) =>
                section.title.toLowerCase().includes(query) ||
                section.content.title.toLowerCase().includes(query) ||
                section.content.description.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const currentSection = DOCUMENTATION_SECTIONS.find((s) => s.id === activeSection);
    const currentIndex = DOCUMENTATION_SECTIONS.findIndex((s) => s.id === activeSection);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.target.tagName === 'INPUT') return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const newIndex = currentIndex > 0 ? currentIndex - 1 : DOCUMENTATION_SECTIONS.length - 1;
            setActiveSection(DOCUMENTATION_SECTIONS[newIndex].id);
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const newIndex = currentIndex < DOCUMENTATION_SECTIONS.length - 1 ? currentIndex + 1 : 0;
            setActiveSection(DOCUMENTATION_SECTIONS[newIndex].id);
        }
    }, [currentIndex]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Scroll to top when section changes
    useEffect(() => {
        mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeSection]);

    // Print/Export functionality
    const handlePrint = () => {
        window.print();
    };

    const handleExportPDF = () => {
        // Use print dialog with PDF option
        window.print();
    };

    const renderContent = () => {
        if (!currentSection) return null;
        const { content } = currentSection;

        return (
            <div className="space-y-8 print:space-y-6">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center print:hidden">
                                <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">{content.title}</h1>
                                <Badge variant="secondary" className="mt-1">{content.badge}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                                <Printer className="w-4 h-4" />
                                Print
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                                <Download className="w-4 h-4" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                        {content.description}
                    </p>
                </div>

                {/* Key Features (for overview) */}
                {content.keyFeatures && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-semibold text-foreground">Key Features</h2>
                            </div>
                            <ul className="space-y-3">
                                {content.keyFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <span className="text-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Cards (for overview) */}
                {content.quickCards && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
                        {content.quickCards.map((card, index) => {
                            const CardIcon = iconMap[card.icon] || Target;
                            return (
                                <Card key={index} className="border-border hover:border-primary/50 transition-colors">
                                    <CardContent className="p-5">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                            <CardIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                                        <p className="text-sm text-muted-foreground">{card.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Interactive Walkthrough */}
                {content.walkthrough && (
                    <div className="print:hidden">
                        <InteractiveWalkthrough walkthrough={content.walkthrough} />
                    </div>
                )}

                {/* Sections */}
                {content.sections && (
                    <div className="space-y-6">
                        {content.sections.map((section, index) => (
                            <Card key={index}>
                                <CardContent className="p-6">
                                    <h2 className="text-lg font-semibold text-foreground mb-4">{section.title}</h2>
                                    <ul className="space-y-2">
                                        {section.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                <span className="text-muted-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Video Tutorials */}
                {content.tutorials && (
                    <div className="print:hidden">
                        <VideoTutorial tutorials={content.tutorials} />
                    </div>
                )}

                {/* Navigation hint */}
                <div className="print:hidden">
                    <Separator className="my-6" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">↑</kbd>
                            <kbd className="px-2 py-1 rounded bg-secondary text-xs font-mono">↓</kbd>
                            <span>Navigate sections</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {currentIndex > 0 && (
                                <button
                                    onClick={() => setActiveSection(DOCUMENTATION_SECTIONS[currentIndex - 1].id)}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                    {DOCUMENTATION_SECTIONS[currentIndex - 1].title}
                                </button>
                            )}
                            {currentIndex < DOCUMENTATION_SECTIONS.length - 1 && (
                                <button
                                    onClick={() => setActiveSection(DOCUMENTATION_SECTIONS[currentIndex + 1].id)}
                                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                                >
                                    {DOCUMENTATION_SECTIONS[currentIndex + 1].title}
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background flex print:block">
            {/* Sidebar - hidden when printing */}
            <aside className="w-72 border-r border-border bg-card shrink-0 sticky top-0 h-screen print:hidden">
                <div className="p-4 border-b border-border">
                    <h2 className="font-bold text-foreground">Documentation</h2>
                    <p className="text-xs text-muted-foreground">HMS User Guide • Use ↑↓ to navigate</p>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search docs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-secondary/50"
                        />
                    </div>
                </div>

                <ScrollArea className="h-[calc(100vh-140px)]">
                    <nav className="p-2 space-y-1">
                        {filteredSections.map((section, index) => {
                            const Icon = iconMap[section.icon] || FileText;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="flex-1">{section.title}</span>
                                    <span className="text-xs opacity-60">{index + 1}</span>
                                </button>
                            );
                        })}
                    </nav>
                </ScrollArea>
            </aside>

            {/* Main Content */}
            <main ref={mainContentRef} className="flex-1 p-8 overflow-auto print:p-0 print:overflow-visible">
                <div className="max-w-4xl print:max-w-none">
                    {renderContent()}
                </div>
            </main>

            {/* Print Styles */}
            <style>{`
        @media print {
          body { 
            print-color-adjust: exact; 
            -webkit-print-color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .print\\:p-0 { padding: 0 !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:overflow-visible { overflow: visible !important; }
          .print\\:space-y-6 > * + * { margin-top: 1.5rem !important; }
          .print\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }
      `}</style>
        </div>
    );
}
