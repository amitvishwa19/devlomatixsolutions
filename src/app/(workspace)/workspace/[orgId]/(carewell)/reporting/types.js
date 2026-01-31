/**
 * Reporting Types
 */

export const REPORT_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
};

export const REPORT_PERIOD_LABELS = {
  [REPORT_PERIODS.WEEK]: 'This Week',
  [REPORT_PERIODS.MONTH]: 'This Month',
  [REPORT_PERIODS.QUARTER]: 'This Quarter',
  [REPORT_PERIODS.YEAR]: 'This Year',
};

export const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  emerald: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};
