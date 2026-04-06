import { Country, State, City } from 'country-state-city';

export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface LeadReminder {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
}

export interface Lead {
  id: string;
  businessName: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  rating: number;
  reviews: number;
  website: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  tags?: string[];
  notes?: LeadNote[];
  reminders?: LeadReminder[];
}

export const mockLeads: Lead[] = [];

export const getAllCountries = () =>
  Country.getAllCountries().map((c) => ({ label: c.name, value: c.isoCode }));

export const getStatesByCountry = (countryCode: string) =>
  State.getStatesOfCountry(countryCode).map((s) => ({ label: s.name, value: s.isoCode }));

export const getCitiesByState = (countryCode: string, stateCode: string) =>
  City.getCitiesOfState(countryCode, stateCode).map((c) => ({ label: c.name, value: c.name }));

export const categories = [
  'All Categories',
  'IT Services',
  'Marketing',
  'Healthcare',
  'Fitness',
  'Food & Beverage',
  'Insurance',
  'Education',
  'Landscaping',
  'Real Estate',
  'Legal Services',
  'Automotive',
  'Construction',
];
