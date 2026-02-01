import { SERVICE_STATUSES, SERVICE_CATEGORIES, TAX_CATEGORIES } from '../types';

// Format currency in INR
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Get status configuration
export function getStatusConfig(statusId) {
  return SERVICE_STATUSES.find(s => s.id === statusId) || SERVICE_STATUSES[0];
}

// Get category configuration
export function getCategoryConfig(categoryId) {
  return SERVICE_CATEGORIES.find(c => c.id === categoryId) || { id: categoryId, name: categoryId, icon: 'Package' };
}

// Get tax rate by category
export function getTaxRate(taxCategoryId) {
  const category = TAX_CATEGORIES.find(t => t.id === taxCategoryId);
  return category ? category.rate : 0;
}

// Calculate service price with tax
export function calculatePriceWithTax(basePrice, taxCategoryId) {
  const taxRate = getTaxRate(taxCategoryId);
  const taxAmount = basePrice * taxRate;
  return {
    basePrice,
    taxAmount,
    taxRate,
    totalPrice: basePrice + taxAmount,
  };
}

// Generate service code
export function generateServiceCode(category, index) {
  const prefix = category.substring(0, 3).toUpperCase();
  const num = String(index).padStart(4, '0');
  return `${prefix}-${num}`;
}

// Calculate service statistics
export function calculateServiceStats(services) {
  const total = services.length;
  const active = services.filter(s => s.status === 'active').length;
  const inactive = services.filter(s => s.status === 'inactive').length;
  const discontinued = services.filter(s => s.status === 'discontinued').length;

  const categoryCounts = {};
  services.forEach(s => {
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
  });

  const avgPrice = services.length > 0
    ? services.reduce((sum, s) => sum + s.basePrice, 0) / services.length
    : 0;

  const totalRevenuePotential = services
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.basePrice * (s.usageCount || 0)), 0);

  const topCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    active,
    inactive,
    discontinued,
    categoryCounts,
    avgPrice,
    totalRevenuePotential,
    topCategory: topCategory ? topCategory[0] : null,
    topCategoryCount: topCategory ? topCategory[1] : 0,
  };
}

// Filter services
export function filterServices(services, filters) {
  let filtered = [...services];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(searchLower) ||
      s.code.toLowerCase().includes(searchLower) ||
      s.description?.toLowerCase().includes(searchLower) ||
      s.category.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(s => s.status === filters.status);
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(s => s.category === filters.category);
  }

  // Department filter
  if (filters.department && filters.department !== 'all') {
    filtered = filtered.filter(s => s.department === filters.department);
  }

  // Service type filter (OPD/IPD)
  if (filters.serviceType && filters.serviceType !== 'all') {
    filtered = filtered.filter(s =>
      s.serviceType === filters.serviceType || s.serviceType === 'both'
    );
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(s => s.basePrice >= filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(s => s.basePrice <= filters.maxPrice);
  }

  // Sort
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'price_asc':
          return a.basePrice - b.basePrice;
        case 'price_desc':
          return b.basePrice - a.basePrice;
        case 'usage_desc':
          return (b.usageCount || 0) - (a.usageCount || 0);
        case 'recent':
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        default:
          return 0;
      }
    });
  }

  return filtered;
}

// Format duration
export function formatDuration(value, unit) {
  if (!value) return 'N/A';
  return `${value} ${unit}`;
}

// Format date
export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Validate HSN code format
export function isValidHSNCode(code) {
  // HSN codes are typically 4, 6, or 8 digits
  return /^\d{4,8}$/.test(code);
}

// Calculate package discount
export function calculatePackageDiscount(includedServices, packagePrice) {
  const totalIndividualPrice = includedServices.reduce((sum, s) => sum + s.basePrice, 0);
  const discount = totalIndividualPrice - packagePrice;
  const discountPercentage = totalIndividualPrice > 0
    ? (discount / totalIndividualPrice) * 100
    : 0;

  return {
    totalIndividualPrice,
    packagePrice,
    discount,
    discountPercentage: discountPercentage.toFixed(1),
  };
}
