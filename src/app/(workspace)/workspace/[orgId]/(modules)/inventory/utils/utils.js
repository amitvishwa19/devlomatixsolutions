import { differenceInDays } from 'date-fns';
import { INVENTORY_STATUSES, INVENTORY_CATEGORIES, STORAGE_LOCATIONS, SUPPLIERS, UNITS } from './types';

export const getItemStatus = (item) => {
  if (!item.isActive) {
    return INVENTORY_STATUSES.find(s => s.id === 'discontinued');
  }
  
  if (item.expiryDate) {
    const daysToExpiry = differenceInDays(new Date(item.expiryDate), new Date());
    if (daysToExpiry <= 0) {
      return INVENTORY_STATUSES.find(s => s.id === 'expired');
    }
  }
  
  if (item.quantity === 0) {
    return INVENTORY_STATUSES.find(s => s.id === 'out_of_stock');
  }
  
  if (item.quantity <= item.reorderLevel) {
    return INVENTORY_STATUSES.find(s => s.id === 'low_stock');
  }
  
  return INVENTORY_STATUSES.find(s => s.id === 'in_stock');
};

export const getCategoryById = (categoryId) => {
  return INVENTORY_CATEGORIES.find(c => c.id === categoryId) || { name: categoryId, icon: 'Package' };
};

export const getLocationById = (locationId) => {
  return STORAGE_LOCATIONS.find(l => l.id === locationId) || { name: locationId };
};

export const getSupplierById = (supplierId) => {
  return SUPPLIERS.find(s => s.id === supplierId) || { name: 'Unknown Supplier' };
};

export const getUnitById = (unitId) => {
  return UNITS.find(u => u.id === unitId) || { name: unitId };
};

export const calculateInventoryValue = (items) => {
  return items.reduce((total, item) => total + (item.quantity * item.costPrice), 0);
};

export const calculatePotentialRevenue = (items) => {
  return items.reduce((total, item) => total + (item.quantity * item.sellingPrice), 0);
};

export const getExpiringItems = (items, daysThreshold = 30) => {
  return items.filter(item => {
    if (!item.expiryDate) return false;
    const daysToExpiry = differenceInDays(new Date(item.expiryDate), new Date());
    return daysToExpiry > 0 && daysToExpiry <= daysThreshold;
  });
};

export const getLowStockItems = (items) => {
  return items.filter(item => item.quantity > 0 && item.quantity <= item.reorderLevel);
};

export const getOutOfStockItems = (items) => {
  return items.filter(item => item.quantity === 0 && item.isActive);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateSKU = (category, existingItems) => {
  const prefix = {
    medical_supplies: 'MED',
    equipment: 'EQP',
    consumables: 'CON',
    pharmaceuticals: 'PHR',
    surgical: 'SUR',
    laboratory: 'LAB',
    office: 'OFF',
    cleaning: 'CLN',
    ppe: 'PPE',
    furniture: 'FUR',
  };
  
  const categoryPrefix = prefix[category] || 'GEN';
  const count = existingItems.filter(i => i.category === category).length + 1;
  return `${categoryPrefix}-${String(count).padStart(3, '0')}`;
};
