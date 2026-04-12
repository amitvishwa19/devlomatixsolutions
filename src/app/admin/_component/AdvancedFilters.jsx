"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal, X } from "lucide-react";
import { stages, sources } from "../_utils/mockData";

export const defaultFilters = {
  search: "",
  stage: "All",
  source: "All",
  skills: [],
  minRating: 0,
  minExperience: 0,
  maxExperience: 20,
  dateFrom: "",
  dateTo: "",
};

const allSkills = ["React", "TypeScript", "Node.js", "Python", "Java", "GraphQL", "Docker", "Kubernetes", "AWS", "Figma", "Sketch", "CSS", "Vue", "Testing", "PostgreSQL", "Redis", "Django", "Spring Boot", "MySQL", "User Research", "CRM", "Terraform"];

const AdvancedFilters = ({ filters, onChange }) => {
  const [skillInput, setSkillInput] = useState("");

  const activeFilterCount = [
    filters.stage !== "All",
    filters.source !== "All",
    filters.skills.length > 0,
    filters.minRating > 0,
    filters.minExperience > 0 || filters.maxExperience < 20,
    filters.dateFrom || filters.dateTo,
  ].filter(Boolean).length;

  const addSkill = (skill) => {
    if (!filters.skills.includes(skill)) {
      onChange({ ...filters, skills: [...filters.skills, skill] });
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    onChange({ ...filters, skills: filters.skills.filter((s) => s !== skill) });
  };

  const clearAll = () => onChange(defaultFilters);

  const filteredSkillSuggestions = allSkills.filter(
    (s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !filters.skills.includes(s)
  ).slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Advanced Filters</span>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs h-7">Clear All</Button>
            )}
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <Label className="text-xs">Stage</Label>
            <Select value={filters.stage} onValueChange={(v) => onChange({ ...filters, stage: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Stages</SelectItem>
                {stages.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <Label className="text-xs">Source</Label>
            <Select value={filters.source} onValueChange={(v) => onChange({ ...filters, source: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {sources.map((s) => <SelectItem key={s} value={s}>{s === "All" ? "All Sources" : s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Skills */}
          <div className="space-y-1.5">
            <Label className="text-xs">Skills</Label>
            <div className="relative">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Type to add skills..."
                className="h-8 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredSkillSuggestions[0]) {
                    addSkill(filteredSkillSuggestions[0]);
                  }
                }}
              />
              {skillInput && filteredSkillSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                  {filteredSkillSuggestions.map((s) => (
                    <button key={s} onClick={() => addSkill(s)} className="w-full px-3 py-1.5 text-xs text-left hover:bg-muted">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => removeSkill(s)}>
                    {s} <X className="h-2.5 w-2.5" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Min Rating */}
          <div className="space-y-1.5">
            <Label className="text-xs">Minimum Rating: {filters.minRating > 0 ? `${filters.minRating}+` : "Any"}</Label>
            <Slider
              value={[filters.minRating]}
              onValueChange={([v]) => onChange({ ...filters, minRating: v })}
              min={0}
              max={5}
              step={1}
              className="py-1"
            />
          </div>

          {/* Experience Range */}
          <div className="space-y-1.5">
            <Label className="text-xs">Experience: {filters.minExperience}-{filters.maxExperience} years</Label>
            <Slider
              value={[filters.minExperience, filters.maxExperience]}
              onValueChange={([min, max]) => onChange({ ...filters, minExperience: min, maxExperience: max })}
              min={0}
              max={20}
              step={1}
              className="py-1"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Applied From</Label>
              <Input type="date" value={filters.dateFrom} onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })} className="h-8 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Applied To</Label>
              <Input type="date" value={filters.dateTo} onChange={(e) => onChange({ ...filters, dateTo: e.target.value })} className="h-8 text-xs" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default AdvancedFilters;
