'use client';

import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';

const GeneratedResults = ({ open, handleClose, results, onRegenerate, onSave, onSchedule, onExport }) => {
    const [loading, setLoading] = useState(false)
    if (!results || results?.length === 0) {
        return null;
    }

    const handleOpenChange = () => {
        handleClose(false)
    }

    useEffect(() => {
        setLoading(false)
    }, [results])


    return (

        <Sheet open={open} onOpenChange={() => { handleOpenChange() }} className='p-0'>

            <SheetContent className='dark:bg-darkPrimaryBackground md:min-w-[520px]'>
                <SheetHeader className='hidden'>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>


                <ScrollArea className=" h-full">
                    <div className='p-2 space-y-2'>
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-semibold text-foreground">Generated Variations</h3>
                            <Button
                                variant={'outline'}
                                disabled={loading}
                                onClick={() => {
                                    onRegenerate()
                                    setLoading(true)
                                }}
                                className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-all duration-200"
                            >
                                <Icon name="ArrowPathIcon" size={18} className={`${loading && 'animate-spin'} `} />
                                <span className="text-sm font-medium">Regenerate</span>
                            </Button>
                        </div>


                        <div className="space-y-3">
                            {results?.map((result, index) => (
                                <div key={index} className=" border border-border rounded-lg p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <span className="text-xs font-semibold text-primary">Variation {index + 1}</span>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => onSave(result)}
                                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-all duration-200"
                                                title="Save draft"
                                            >
                                                <Icon name="BookmarkIcon" size={16} />
                                            </button>
                                            <button
                                                onClick={() => onExport(result)}
                                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-all duration-200"
                                                title="Export"
                                            >
                                                <Icon name="ArrowDownTrayIcon" size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-sm text-foreground whitespace-pre-wrap">{result?.content}</p>

                                    {result?.hashtags && (
                                        <div className="flex flex-wrap gap-2">
                                            {result?.hashtags?.split(' ')?.map((tag, tagIndex) => (
                                                <span
                                                    key={tagIndex}
                                                    className="px-2 py-1 bg-accent/40   text-xs font-medium rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                            <span>{result?.charCount} characters</span>
                                            <span>•</span>
                                            <span>{result?.wordCount} words</span>
                                        </div>
                                        <button
                                            onClick={() => onSchedule(result)}
                                            className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200"
                                        >
                                            <Icon name="ClockIcon" size={14} />
                                            <span className="text-xs font-medium">Schedule</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </ScrollArea>

            </SheetContent>
        </Sheet>
    );
};



export default GeneratedResults;