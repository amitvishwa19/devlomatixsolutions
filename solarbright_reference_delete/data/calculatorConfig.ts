// Modify this config to update the calculator options and plan logic

export interface PropertyOption {
  value: string;
  label: string;
  panelMultiplier: number; // suggested panel count multiplier
}

export interface CalculatorConfig {
  propertyTypes: PropertyOption[];
  towerOptions: { value: number; label: string }[];
  panelRange: { min: number; max: number; step: number; default: number };
  cleaningFrequency: { value: string; label: string; multiplier: number }[];
  plans: PlanRule[];
}

export interface PlanRule {
  id: string;
  name: string;
  pricePerPanel: number;
  minPanels: number;
  recommended: boolean;
  description: string;
  bestFor: string;
}

const calculatorConfig: CalculatorConfig = {
  propertyTypes: [
    { value: "house", label: "Residential House", panelMultiplier: 1 },
    { value: "villa", label: "Villa / Bungalow", panelMultiplier: 1.2 },
    { value: "apartment", label: "Apartment Complex", panelMultiplier: 1.5 },
    { value: "commercial", label: "Commercial Building", panelMultiplier: 2 },
    { value: "tower", label: "High-Rise Tower", panelMultiplier: 3 },
    { value: "industrial", label: "Industrial / Factory", panelMultiplier: 4 },
    { value: "farm", label: "Solar Farm", panelMultiplier: 5 },
  ],
  towerOptions: [
    { value: 1, label: "1 Building" },
    { value: 2, label: "2 Buildings" },
    { value: 3, label: "3 Buildings" },
    { value: 4, label: "4 Buildings" },
    { value: 5, label: "5+ Buildings" },
  ],
  panelRange: { min: 5, max: 500, step: 5, default: 20 },
  cleaningFrequency: [
    { value: "once", label: "One-time", multiplier: 1 },
    { value: "quarterly", label: "Quarterly (4x/year)", multiplier: 4 },
    { value: "bimonthly", label: "Every 2 months (6x/year)", multiplier: 6 },
    { value: "monthly", label: "Monthly (12x/year)", multiplier: 12 },
  ],
  plans: [
    {
      id: "basic",
      name: "Basic Clean",
      pricePerPanel: 18,
      minPanels: 0,
      recommended: false,
      description: "Professional dry & wet cleaning with visual inspection",
      bestFor: "One-time or occasional cleaning",
    },
    {
      id: "standard",
      name: "Standard Clean",
      pricePerPanel: 16,
      minPanels: 10,
      recommended: false,
      description: "Includes chemical cleaning, performance check & photo proof",
      bestFor: "Regular quarterly or bi-monthly maintenance",
    },
    {
      id: "amc",
      name: "AMC Plan",
      pricePerPanel: 14,
      minPanels: 20,
      recommended: false,
      description: "Full annual contract with dashboard monitoring & dedicated manager",
      bestFor: "Large setups needing year-round care",
    },
  ],
};

export default calculatorConfig;
