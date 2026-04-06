"use client";
import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Copy, Star, Phone, Mail, Globe, MapPin, ExternalLink, Search, LayoutGrid, LayoutList, Check, TrendingUp } from 'lucide-react';
import { scoreLead, gradeColors } from '../lib/leadScoring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import LeadDetailSheet from '../components/LeadDetailSheet';
import type { Lead } from '../data/mockLeads';

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange?: (id: string, status: Lead['status']) => void;
  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
}

type SortKey = 'businessName' | 'category' | 'rating' | 'reviews' | 'city' | 'status' | 'score';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const statusStyles: Record<Lead['status'], string> = {
  new: 'bg-primary/20 text-primary border-primary/30',
  contacted: 'bg-warning/20 text-warning border-warning/30',
  qualified: 'bg-success/20 text-success border-success/30',
  converted: 'bg-success/30 text-success border-success/40',
};

const LeadsTable = ({ leads, onStatusChange, selectedIds: externalSelectedIds, onSelectedIdsChange }: LeadsTableProps) => {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [tableFilter, setTableFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  const selectedIds = externalSelectedIds ?? internalSelectedIds;
  const setSelectedIds = onSelectedIdsChange ?? setInternalSelectedIds;

  // Filter
  const filtered = useMemo(() => {
    if (!tableFilter) return leads;
    const q = tableFilter.toLowerCase();
    return leads.filter(
      (l) =>
        l.businessName.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.state.toLowerCase().includes(q) ||
        l.website.toLowerCase().includes(q)
    );
  }, [leads, tableFilter]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'score') {
        const aScore = scoreLead(a).total;
        const bScore = scoreLead(b).total;
        return sortDir === 'asc' ? aScore - bScore : bScore - aScore;
      }
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = sorted.slice(startIndex, startIndex + pageSize);

  // Reset page on filter/sort/pageSize change
  const handlePageSize = (v: string) => {
    setPageSize(Number(v));
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3.5 w-3.5 ml-1" /> : <ArrowDown className="h-3.5 w-3.5 ml-1" />;
  };

  // Selection
  const allOnPageSelected = paginated.length > 0 && paginated.every((l) => selectedIds.has(l.id));
  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paginated.forEach((l) => next.delete(l.id));
      } else {
        paginated.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
  };

  const handleExportSelected = () => {
    const selectedLeads = leads.filter((l) => selectedIds.has(l.id));
    if (selectedLeads.length === 0) return;
    const csv = [
      ['Business Name', 'Category', 'Phone', 'Email', 'Address', 'City', 'State', 'Country', 'Pincode', 'Rating', 'Reviews', 'Website'].join(','),
      ...selectedLeads.map((l) =>
        [l.businessName, l.category, l.phone, l.email, l.address, l.city, l.state, l.country, l.pincode, l.rating, l.reviews, l.website]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  if (leads.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center animate-fade-in">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No leads found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search a different location.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter results..."
            value={tableFilter}
            onChange={(e) => { setTableFilter(e.target.value); setCurrentPage(1); }}
            className="pl-9 bg-secondary/50 border-border"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportSelected}>
              <Check className="h-3.5 w-3.5 mr-1.5" />
              Export {selectedIds.size} selected
            </Button>
          )}
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('table')}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Select value={String(pageSize)} onValueChange={handlePageSize}>
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
          {paginated.map((lead) => (
            <div
              key={lead.id}
              className="glass-card rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => setDetailLead(lead)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{lead.businessName}</h3>
                  <Badge variant="secondary" className="mt-1 text-xs">{lead.category}</Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="text-sm font-bold">{lead.rating}</span>
                  <span className="text-xs text-muted-foreground">({lead.reviews})</span>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                {lead.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{lead.phone}</span>
                  </div>
                )}
                {lead.address && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{lead.address}</span>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{lead.website}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <Badge variant="outline" className={statusStyles[lead.status]}>
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">{lead.city}, {lead.state}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-xl overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('businessName')}>
                    <span className="flex items-center text-muted-foreground font-semibold">Business <SortIcon col="businessName" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('category')}>
                    <span className="flex items-center text-muted-foreground font-semibold">Category <SortIcon col="category" /></span>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-semibold">Contact</TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('city')}>
                    <span className="flex items-center text-muted-foreground font-semibold">Location <SortIcon col="city" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('rating')}>
                    <span className="flex items-center text-muted-foreground font-semibold">Rating <SortIcon col="rating" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('score')}>
                    <span className="flex items-center text-muted-foreground font-semibold">Score <SortIcon col="score" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <span className="flex items-center text-muted-foreground font-semibold">Status <SortIcon col="status" /></span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className={`border-border hover:bg-secondary/30 transition-colors cursor-pointer ${selectedIds.has(lead.id) ? 'bg-primary/5' : ''}`}
                    onClick={() => setDetailLead(lead)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.has(lead.id)} onCheckedChange={() => toggleOne(lead.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{lead.businessName}</div>
                      {lead.website && (
                        <a
                          href={`https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center gap-1 mt-0.5 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Globe className="h-3 w-3" />
                          {lead.website.length > 30 ? lead.website.slice(0, 30) + '…' : lead.website}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">{lead.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-foreground group/copy">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{lead.phone}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(lead.phone, 'Phone'); }}
                              className="opacity-0 group-hover/copy:opacity-100 transition-opacity"
                            >
                              <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-sm text-foreground group/copy">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{lead.email}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); copyToClipboard(lead.email, 'Email'); }}
                              className="opacity-0 group-hover/copy:opacity-100 transition-opacity"
                            >
                              <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1.5 text-sm text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <div>{lead.address}</div>
                          <div className="text-muted-foreground">{lead.city}, {lead.state} {lead.pincode}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-warning fill-warning" />
                        <span className="font-semibold text-foreground">{lead.rating}</span>
                        <span className="text-xs text-muted-foreground">({lead.reviews})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const score = scoreLead(lead);
                        return (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className={`${gradeColors[score.grade]} font-bold text-xs`}>
                              {score.grade}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{score.total}</span>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[lead.status]}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, sorted.length)} of {sorted.length} leads
            {tableFilter && sorted.length !== leads.length && ` (filtered from ${leads.length})`}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {getPageNumbers().map((page, i) =>
                page === 'ellipsis' ? (
                  <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                ) : (
                  <PaginationItem key={page}>
                    <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)} className="cursor-pointer">
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Detail Sheet */}
      <LeadDetailSheet
        lead={detailLead}
        open={!!detailLead}
        onOpenChange={(open) => { if (!open) setDetailLead(null); }}
        onStatusChange={onStatusChange}
      />
    </div>
  );
};

export default LeadsTable;
