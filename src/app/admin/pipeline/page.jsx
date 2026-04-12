"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAts } from "@/app/admin/_context/AtsContext";
import { stages } from "@/app/admin/_utils/mockData";
import StageBadge from "@/app/admin/_component/StageBadge";
import StarRating from "@/app/admin/_component/StarRating";
import Link from "next/link";
import { toast } from "sonner";

export default function PipelinePage() {
  const { candidates, updateCandidateStage } = useAts();
  const pipelineStages = stages.filter((s) => s.key !== "rejected");
  const [draggedId, setDraggedId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const handleDragStart = (e, candidateId) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", candidateId);
    setDraggedId(candidateId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTarget(null);
  };

  const handleDragOver = (e, stageKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(stageKey);
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e, stageKey) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData("text/plain");
    const candidate = candidates.find((c) => c.id === candidateId);
    if (candidate && candidate.stage !== stageKey) {
      updateCandidateStage(candidateId, stageKey);
      toast.success(`${candidate.name} moved to ${stages.find((s) => s.key === stageKey)?.label}`);
    }
    setDraggedId(null);
    setDropTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
        <p className="text-muted-foreground">Drag candidates between columns to update their stage</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => {
          const stageCandidates = candidates.filter((c) => c.stage === stage.key);
          const isOver = dropTarget === stage.key;
          return (
            <div
              key={stage.key}
              className={`w-72 flex-shrink-0 rounded-xl transition-colors duration-200 p-1 ${isOver ? "bg-primary/10 ring-2 ring-primary/30" : ""}`}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <div className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 p-2.5">
                <div className="flex items-center gap-2">
                  <StageBadge stage={stage.key} />
                </div>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-background px-2 text-xs font-semibold text-foreground shadow-sm">
                  {stageCandidates.length}
                </span>
              </div>
              <div className="space-y-3 min-h-[100px]">
                {stageCandidates.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all duration-200 ${draggedId === c.id ? "opacity-40 scale-95" : ""}`}
                  >
                    <Link href={`/admin/candidates/${c.id}`}>
                      <Card className="cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:-translate-y-0.5">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary flex-shrink-0">
                              {c.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-foreground">{c.name}</div>
                              <div className="truncate text-xs text-muted-foreground">{c.jobTitle}</div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <StarRating rating={c.rating} />
                            <span className="text-xs text-muted-foreground">{c.appliedDate}</span>
                          </div>
                          {c.skills.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {c.skills.slice(0, 3).map((s) => (
                                <span key={s} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{s}</span>
                              ))}
                              {c.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{c.skills.length - 3}</span>}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
                {stageCandidates.length === 0 && (
                  <div className={`rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground ${isOver ? "border-primary/50" : ""}`}>
                    Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
