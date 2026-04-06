// @ts-nocheck
"use client";
import { Search, MapPin, Filter, History, X } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAllCountries, getStatesByCountry, getCitiesByState, categories } from '../data/mockLeads';
import { getSearchHistory, getDisplayLabel, type SearchHistoryEntry } from '../lib/searchHistory';

interface FilterPanelProps {
  keyword: string;
  setKeyword: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  pincode: string;
  setPincode: (v: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  historyVersion?: number;
}

const FilterPanel = ({
  keyword, setKeyword,
  category, setCategory,
  country, setCountry,
  state, setState,
  city, setCity,
  pincode, setPincode,
  onSearch,
  isLoading,
  historyVersion = 0,
}: FilterPanelProps) => {
  const countries = useMemo(() => getAllCountries(), []);
  const states = useMemo(() => (country ? getStatesByCountry(country) : []), [country]);
  const cities = useMemo(() => (country && state ? getCitiesByState(country, state) : []), [country, state]);

  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, [historyVersion]);

  const applyHistory = (entry: SearchHistoryEntry) => {
    setKeyword(entry.keyword);
    setCategory(entry.category);
    setCountry(entry.country);
    // Small delay to let country trigger state list update
    setTimeout(() => {
      setState(entry.state);
      setTimeout(() => {
        setCity(entry.city);
        setPincode(entry.pincode);
      }, 500);
    }, 500);
  };

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in space-y-4">
      {/* Search History Tag Cloud */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            <span>Recent searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((entry, i) => (
              <Badge
                key={`${entry.timestamp}-${i}`}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all text-xs px-3 py-1 border border-border"
                onClick={() => applyHistory(entry)}
              >
                {getDisplayLabel(entry)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Search Filters</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Keyword</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g. Restaurant, Dentist..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Category</label>
          <Select value={category} onValueChange={setCategory}>
            {/* @ts-ignore */}
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            {/* @ts-ignore */}
            <SelectContent>
              {categories.map((c) => (
                // @ts-ignore
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Country</label>
          <Select value={country} onValueChange={(v) => { setCountry(v); setState(''); setCity(''); }}>
            {/* @ts-ignore */}
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            {/* @ts-ignore */}
            <SelectContent>
              {countries.map((c) => (
                // @ts-ignore
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">State</label>
          <Select value={state} onValueChange={(v) => { setState(v); setCity(''); }} disabled={!country}>
            {/* @ts-ignore */}
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            {/* @ts-ignore */}
            <SelectContent>
              {states.map((s) => (
                // @ts-ignore
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">City</label>
          <Select value={city} onValueChange={setCity} disabled={!state}>
            {/* @ts-ignore */}
            <SelectTrigger className="bg-secondary/50 border-border">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            {/* @ts-ignore */}
            <SelectContent>
              {cities.map((c) => (
                // @ts-ignore
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">Pincode</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g. 94102"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="pl-9 bg-secondary/50 border-border"
            />
          </div>
        </div>

        <div className="flex items-end col-span-1 md:col-span-2 lg:col-span-1">
          <Button
            onClick={onSearch}
            disabled={isLoading}
            className="w-full gradient-primary text-primary-foreground font-semibold shadow-glow hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Searching...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Find Leads
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
