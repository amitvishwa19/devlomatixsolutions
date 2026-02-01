// Inventory Item Statuses
export const INVENTORY_STATUSES = [
  { id: 'in_stock', name: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' },
  { id: 'low_stock', name: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'out_of_stock', name: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' },
  { id: 'expired', name: 'Expired', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  { id: 'discontinued', name: 'Discontinued', color: 'bg-slate-100 text-slate-800 border-slate-200' },
];

// Inventory Categories
export const INVENTORY_CATEGORIES = [
  { id: 'medical_supplies', name: 'Medical Supplies', icon: 'Stethoscope' },
  { id: 'equipment', name: 'Equipment', icon: 'Monitor' },
  { id: 'consumables', name: 'Consumables', icon: 'Package' },
  { id: 'pharmaceuticals', name: 'Pharmaceuticals', icon: 'Pill' },
  { id: 'surgical', name: 'Surgical Instruments', icon: 'Scissors' },
  { id: 'laboratory', name: 'Laboratory Supplies', icon: 'FlaskConical' },
  { id: 'office', name: 'Office Supplies', icon: 'FileText' },
  { id: 'cleaning', name: 'Cleaning & Hygiene', icon: 'Sparkles' },
  { id: 'ppe', name: 'PPE', icon: 'Shield' },
  { id: 'furniture', name: 'Furniture', icon: 'Armchair' },
];

// Stock Movement Types
export const MOVEMENT_TYPES = [
  { id: 'purchase', name: 'Purchase', color: 'text-green-600' },
  { id: 'sale', name: 'Sale/Dispense', color: 'text-blue-600' },
  { id: 'adjustment_add', name: 'Stock Addition', color: 'text-emerald-600' },
  { id: 'adjustment_remove', name: 'Stock Removal', color: 'text-red-600' },
  { id: 'transfer_in', name: 'Transfer In', color: 'text-purple-600' },
  { id: 'transfer_out', name: 'Transfer Out', color: 'text-orange-600' },
  { id: 'return', name: 'Return', color: 'text-cyan-600' },
  { id: 'damage', name: 'Damage/Loss', color: 'text-rose-600' },
  { id: 'expired', name: 'Expired', color: 'text-gray-600' },
];

// Storage Locations
export const STORAGE_LOCATIONS = [
  { id: 'main_store', name: 'Main Store' },
  { id: 'pharmacy_store', name: 'Pharmacy Store' },
  { id: 'emergency_store', name: 'Emergency Store' },
  { id: 'ot_store', name: 'OT Store' },
  { id: 'icu_store', name: 'ICU Store' },
  { id: 'lab_store', name: 'Laboratory Store' },
  { id: 'ward_a', name: 'Ward A' },
  { id: 'ward_b', name: 'Ward B' },
  { id: 'ward_c', name: 'Ward C' },
];

// Units of Measurement
export const UNITS = [
  { id: 'piece', name: 'Piece(s)' },
  { id: 'box', name: 'Box(es)' },
  { id: 'pack', name: 'Pack(s)' },
  { id: 'bottle', name: 'Bottle(s)' },
  { id: 'roll', name: 'Roll(s)' },
  { id: 'set', name: 'Set(s)' },
  { id: 'pair', name: 'Pair(s)' },
  { id: 'kg', name: 'Kilogram(s)' },
  { id: 'liter', name: 'Liter(s)' },
  { id: 'meter', name: 'Meter(s)' },
];

// Suppliers (for reference)
export const SUPPLIERS = [
  { id: 'sup_001', name: 'MedSupply Corp', contact: '+91 98765 43210', email: 'sales@medsupply.com' },
  { id: 'sup_002', name: 'Healthcare Distributors', contact: '+91 98765 43211', email: 'orders@healthcaredist.com' },
  { id: 'sup_003', name: 'Surgical Instruments Ltd', contact: '+91 98765 43212', email: 'info@surgicalinst.com' },
  { id: 'sup_004', name: 'Lab Equipment Co', contact: '+91 98765 43213', email: 'supply@labequip.com' },
  { id: 'sup_005', name: 'General Medical Supplies', contact: '+91 98765 43214', email: 'sales@generalmed.com' },
];
