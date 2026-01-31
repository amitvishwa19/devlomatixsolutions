import { Building2, BedDouble } from 'lucide-react';

export function WorkflowTabs({ activeTab, onTabChange, opdCount, ipdCount }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 shadow-sm">
        <button
          onClick={() => onTabChange('opd')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'opd' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Building2 className="w-4 h-4" />
          OPD Workflow
        </button>
        <button
          onClick={() => onTabChange('ipd')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'ipd' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          IPD Workflow
        </button>
      </div>
      
      <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground">
        <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          {activeTab === 'opd' ? 'OPD' : 'IPD'}
        </span>
        <span>{activeTab === 'opd' ? opdCount : ipdCount} patients in workflow</span>
      </div>
    </div>
  );
}
