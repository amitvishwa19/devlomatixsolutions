// Room Types
export const ROOM_TYPES = [
  { id: 'icu', name: 'ICU', icon: 'HeartPulse', color: 'bg-red-100 text-red-800 border-red-200', priority: 1 },
  { id: 'private', name: 'Private Room', icon: 'Crown', color: 'bg-purple-100 text-purple-800 border-purple-200', priority: 2 },
  { id: 'semi_private', name: 'Semi-Private', icon: 'Users', color: 'bg-blue-100 text-blue-800 border-blue-200', priority: 3 },
  { id: 'general_ward', name: 'General Ward', icon: 'Bed', color: 'bg-green-100 text-green-800 border-green-200', priority: 4 },
  { id: 'pediatric', name: 'Pediatric', icon: 'Baby', color: 'bg-pink-100 text-pink-800 border-pink-200', priority: 5 },
  { id: 'maternity', name: 'Maternity', icon: 'Heart', color: 'bg-rose-100 text-rose-800 border-rose-200', priority: 6 },
  { id: 'emergency', name: 'Emergency', icon: 'Siren', color: 'bg-orange-100 text-orange-800 border-orange-200', priority: 7 },
  { id: 'isolation', name: 'Isolation', icon: 'ShieldAlert', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', priority: 8 },
  { id: 'operation_theater', name: 'Operation Theater', icon: 'Scissors', color: 'bg-slate-100 text-slate-800 border-slate-200', priority: 9 },
  { id: 'recovery', name: 'Recovery Room', icon: 'Activity', color: 'bg-teal-100 text-teal-800 border-teal-200', priority: 10 },
];

// Bed Statuses
export const BED_STATUSES = [
  { id: 'available', name: 'Available', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50 border-green-200' },
  { id: 'occupied', name: 'Occupied', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50 border-blue-200' },
  { id: 'reserved', name: 'Reserved', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50 border-amber-200' },
  { id: 'maintenance', name: 'Maintenance', color: 'bg-gray-500', textColor: 'text-gray-700', bgLight: 'bg-gray-50 border-gray-200' },
  { id: 'cleaning', name: 'Cleaning', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50 border-purple-200' },
  { id: 'discharge_pending', name: 'Discharge Pending', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50 border-orange-200' },
];

// Floor/Wing Configuration
export const FLOORS = [
  { id: 'ground', name: 'Ground Floor', shortName: 'G' },
  { id: 'first', name: '1st Floor', shortName: '1' },
  { id: 'second', name: '2nd Floor', shortName: '2' },
  { id: 'third', name: '3rd Floor', shortName: '3' },
  { id: 'fourth', name: '4th Floor', shortName: '4' },
];

export const WINGS = [
  { id: 'east', name: 'East Wing', shortName: 'E' },
  { id: 'west', name: 'West Wing', shortName: 'W' },
  { id: 'north', name: 'North Wing', shortName: 'N' },
  { id: 'south', name: 'South Wing', shortName: 'S' },
  { id: 'central', name: 'Central Block', shortName: 'C' },
];

// Housekeeping Status
export const HOUSEKEEPING_STATUS = [
  { id: 'clean', name: 'Clean', color: 'text-green-600', icon: 'CheckCircle' },
  { id: 'needs_cleaning', name: 'Needs Cleaning', color: 'text-amber-600', icon: 'AlertTriangle' },
  { id: 'in_progress', name: 'Cleaning In Progress', color: 'text-blue-600', icon: 'Loader' },
  { id: 'deep_clean', name: 'Deep Clean Required', color: 'text-red-600', icon: 'AlertCircle' },
];

// Bed Features/Amenities
export const BED_FEATURES = [
  { id: 'electric', name: 'Electric Adjustable', icon: 'Zap' },
  { id: 'oxygen', name: 'Oxygen Supply', icon: 'Wind' },
  { id: 'suction', name: 'Suction Unit', icon: 'Droplet' },
  { id: 'monitor', name: 'Patient Monitor', icon: 'Monitor' },
  { id: 'ventilator', name: 'Ventilator Ready', icon: 'Heart' },
  { id: 'iv_stand', name: 'IV Stand', icon: 'Grip' },
  { id: 'call_bell', name: 'Call Bell', icon: 'Bell' },
  { id: 'bathroom', name: 'Attached Bathroom', icon: 'Bath' },
  { id: 'tv', name: 'Television', icon: 'Tv' },
  { id: 'ac', name: 'Air Conditioning', icon: 'Snowflake' },
];

// Admission Types
export const ADMISSION_TYPES = [
  { id: 'emergency', name: 'Emergency' },
  { id: 'elective', name: 'Elective' },
  { id: 'transfer', name: 'Transfer' },
  { id: 'observation', name: 'Observation' },
];

// Discharge Types
export const DISCHARGE_TYPES = [
  { id: 'normal', name: 'Normal Discharge' },
  { id: 'transfer', name: 'Transfer to Another Facility' },
  { id: 'against_advice', name: 'Against Medical Advice' },
  { id: 'deceased', name: 'Deceased' },
];
