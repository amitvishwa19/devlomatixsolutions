import { useState, useCallback, useMemo } from 'react';
import { saveSearchEntry } from '../lib/searchHistory';
import { Download, Zap, RotateCcw, BarChart3, Map, List, Tag, Mail, FileSpreadsheet, FileText, Kanban } from 'lucide-react';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import FilterPanel from '../components/FilterPanel';
import LeadsTable from '../components/LeadsTable';
import StatsBar from '../components/StatsBar';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import LeadMapView from '../components/LeadMapView';
import BulkActionsBar from '../components/BulkActionsBar';
import KanbanBoard from '../components/KanbanBoard';
import LeadDetailSheet from '../components/LeadDetailSheet';
import { supabase } from '@/integrations/supabase/client';
import { Country, State } from 'country-state-city';
import { exportCSV, exportExcel } from '../lib/exportLeads';
import type { Lead } from '../data/mockLeads';

type ViewTab = 'leads' | 'dashboard' | 'map' | 'pipeline';

const Index = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('leads');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const { toast } = useToast();

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    leads.forEach((l) => l.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags);
  }, [leads]);

  const handleSearch = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const countryName = country ? Country.getCountryByCode(country)?.name || country : '';
      const stateName = state ? State.getStateByCodeAndCountry(state, country)?.name || state : '';

      const { data, error } = await supabase.functions.invoke('google-places-search', {
        body: { keyword, category, country: countryName, state: stateName, city, pincode },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setLeads(data.leads || []);
      setSelectedIds(new Set());
      saveSearchEntry({ keyword, category, country, state, city, pincode });
      setHistoryVersion((v) => v + 1);
      toast({ title: 'Search complete', description: `Found ${data.leads?.length || 0} leads` });
    } catch (err: any) {
      console.error('Search error:', err);
      toast({ title: 'Search failed', description: err.message || 'Failed to fetch leads.', variant: 'destructive' });
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, category, country, state, city, pincode, toast]);

  const handleClearFilters = () => {
    setKeyword('');
    setCategory('');
    setCountry('');
    setState('');
    setCity('');
    setPincode('');
  };

  const handleStatusChange = (id: string, status: Lead['status']) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast({ title: 'Status updated', description: `Lead status changed to ${status}` });
  };

  const handleBulkStatusChange = (status: Lead['status']) => {
    setLeads((prev) => prev.map((l) => (selectedIds.has(l.id) ? { ...l, status } : l)));
    toast({ title: 'Bulk update', description: `${selectedIds.size} leads updated to ${status}` });
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    setLeads((prev) => prev.filter((l) => !selectedIds.has(l.id)));
    toast({ title: 'Deleted', description: `${selectedIds.size} leads removed` });
    setSelectedIds(new Set());
  };

  const handleBulkTag = (tag: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (!selectedIds.has(l.id)) return l;
        const existing = l.tags || [];
        if (existing.includes(tag)) return l;
        return { ...l, tags: [...existing, tag] };
      })
    );
    toast({ title: 'Tagged', description: `Added "${tag}" to ${selectedIds.size} leads` });
  };

  const handleEnrichEmails = useCallback(async () => {
    const leadsWithWebsites = leads.filter((l) => l.website && !l.email);
    if (leadsWithWebsites.length === 0) {
      toast({ title: 'No leads to enrich', description: 'All leads with websites already have emails, or no websites found.' });
      return;
    }

    setIsEnriching(true);
    toast({ title: 'Enriching emails...', description: `Scanning ${leadsWithWebsites.length} websites for contact emails.` });

    try {
      // Process in batches of 10
      const batches = [];
      for (let i = 0; i < leadsWithWebsites.length; i += 10) {
        batches.push(leadsWithWebsites.slice(i, i + 10));
      }

      let enriched = 0;
      for (const batch of batches) {
        const websites = batch.map((l) => l.website);
        const { data, error } = await supabase.functions.invoke('extract-emails', {
          body: { websites },
        });

        if (error) {
          console.error('Email enrichment error:', error);
          continue;
        }

        const results = data?.results || {};
        setLeads((prev) =>
          prev.map((l) => {
            const emails = results[l.website];
            if (emails && emails.length > 0 && !l.email) {
              enriched++;
              return { ...l, email: emails[0] };
            }
            return l;
          })
        );
      }

      toast({
        title: 'Email enrichment complete',
        description: `Found emails for ${enriched} leads.`,
      });
    } catch (err: any) {
      console.error('Enrichment error:', err);
      toast({ title: 'Enrichment failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsEnriching(false);
    }
  }, [leads, toast]);

  const handleUpdateLead = (updated: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    setDetailLead(updated);
  };

  const hasFilters = keyword || category || country || state || city || pincode;

  const tabs: { id: ViewTab; label: string; icon: React.ElementType }[] = [
    { id: 'leads', label: 'Leads', icon: List },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'map', label: 'Map', icon: Map },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary shadow-glow">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">LeadFinder</h1>
              <p className="text-xs text-muted-foreground">Google & Maps Lead Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground">
                <RotateCcw className="h-4 w-4 mr-1.5" />
                Clear
              </Button>
            )}
            {leads.length > 0 && hasSearched && (
              <>
                <Button
                  variant="outline"
                  onClick={handleEnrichEmails}
                  disabled={isEnriching}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isEnriching ? 'Enriching...' : 'Find Emails'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => exportCSV(leads)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportExcel(leads)}>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export as Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <FilterPanel
          keyword={keyword} setKeyword={setKeyword}
          category={category} setCategory={setCategory}
          country={country} setCountry={setCountry}
          state={state} setState={setState}
          city={city} setCity={setCity}
          pincode={pincode} setPincode={setPincode}
          onSearch={handleSearch} isLoading={isLoading}
          historyVersion={historyVersion}
        />

        {hasSearched && (
          <>
            <StatsBar leads={leads} />

            {/* View Tabs */}
            <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Bulk Actions */}
            {activeTab === 'leads' && (
              <BulkActionsBar
                selectedCount={selectedIds.size}
                onBulkStatusChange={handleBulkStatusChange}
                onBulkDelete={handleBulkDelete}
                onBulkTag={handleBulkTag}
                existingTags={allTags}
              />
            )}

            {/* Tab Content */}
            {activeTab === 'leads' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">
                    Results <span className="text-muted-foreground font-normal">({leads.length} leads found)</span>
                  </h2>
                </div>
                <LeadsTable
                  leads={leads}
                  onStatusChange={handleStatusChange}
                  selectedIds={selectedIds}
                  onSelectedIdsChange={setSelectedIds}
                />
              </>
            )}

            {activeTab === 'pipeline' && (
              <KanbanBoard
                leads={leads}
                onStatusChange={handleStatusChange}
                onSelectLead={(lead) => setDetailLead(lead)}
              />
            )}

            {activeTab === 'dashboard' && <AnalyticsDashboard leads={leads} />}

            {activeTab === 'map' && (
              <LeadMapView
                leads={leads}
                onSelectLead={(lead) => setDetailLead(lead)}
              />
            )}
          </>
        )}

        {!hasSearched && (
          <div className="text-center py-20 animate-fade-in">
            <div className="p-4 rounded-2xl gradient-primary shadow-glow inline-block mb-6">
              <Zap className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Find Business Leads Instantly</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Select a location and category above to discover businesses from Google and Google Maps. Export leads with contact info in one click.
            </p>
          </div>
        )}
      </main>

      <LeadDetailSheet
        lead={detailLead}
        open={!!detailLead}
        onOpenChange={(open) => !open && setDetailLead(null)}
        onStatusChange={handleStatusChange}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
};

export default Index;
