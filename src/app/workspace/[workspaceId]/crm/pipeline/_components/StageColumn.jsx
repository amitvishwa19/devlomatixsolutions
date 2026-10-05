'use client';

import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DealCard from './DealCard';

export default function StageColumn({ stage, deals = [], onDealClick, onAddDeal, onQuickWhatsApp }) {
    const totalStageValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);

    const formatCurrency = (val) => {
        return `₹ ${Number(val || 0).toLocaleString('en-IN')}`;
    };

    return (
        <div className="flex flex-col w-[300px] min-w-[300px] max-w-[300px] bg-muted/30 border border-border/70 rounded-2xl p-3 shrink-0 h-full max-h-full">
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-border/60 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color || "#3b82f6" }}
                    />
                    <h3 className="text-xs font-bold text-foreground truncate">
                        {stage.name}
                    </h3>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold text-muted-foreground shrink-0">
                        {deals.length}
                    </span>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted/80 shrink-0"
                    title={`Add deal to ${stage.name}`}
                    onClick={() => onAddDeal && onAddDeal(stage.id)}
                >
                    <Plus className="w-3.5 h-3.5" />
                </Button>
            </div>

            {/* Stage Value Metric */}
            <div className="text-[11px] text-muted-foreground font-semibold px-1 pb-2 flex justify-between items-center shrink-0">
                <span>{stage.probability}% Probability</span>
                <span className="text-foreground font-bold">{formatCurrency(totalStageValue)}</span>
            </div>

            {/* Droppable Deals Container */}
            <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto space-y-2.5 pr-0.5 min-h-[150px] rounded-xl transition-colors ${
                            snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                        }`}
                        style={{ scrollbarWidth: 'thin' }}
                    >
                        {deals.map((deal, index) => (
                            <Draggable key={deal.id} draggableId={deal.id} index={index}>
                                {(dragProvided, dragSnapshot) => (
                                    <DealCard
                                        deal={deal}
                                        provided={dragProvided}
                                        isDragging={dragSnapshot.isDragging}
                                        onClick={() => onDealClick && onDealClick(deal)}
                                        onQuickWhatsApp={onQuickWhatsApp}
                                    />
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}

                        {deals.length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex flex-col items-center justify-center h-28 border border-dashed border-border/60 rounded-xl text-center p-3">
                                <p className="text-[11px] text-muted-foreground/70">No deals in this stage</p>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[10px] text-primary hover:text-primary mt-1 font-semibold"
                                    onClick={() => onAddDeal && onAddDeal(stage.id)}
                                >
                                    + Add Deal
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
