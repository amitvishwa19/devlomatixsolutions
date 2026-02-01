/**
 * @typedef {Object} KanbanTask
 * @property {string} id
 * @property {string} patientId
 * @property {string} patientName
 * @property {string} age
 * @property {string} gender
 * @property {string} priority - 'critical' | 'high' | 'medium' | 'low'
 * @property {string} taskType - 'consultation' | 'lab' | 'pharmacy' | 'procedure' | 'discharge'
 * @property {string} description
 * @property {string} assignedTo
 * @property {string} assignedDepartment
 * @property {Date} createdAt
 * @property {Date} dueDate
 * @property {string[]} tags
 */

/**
 * @typedef {Object} KanbanColumn
 * @property {string} id
 * @property {string} title
 * @property {string} color
 * @property {string} icon
 * @property {number} limit - WIP limit
 * @property {KanbanTask[]} tasks
 */

export const PRIORITY_CONFIG = {
  critical: { label: 'Critical', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' },
  high: { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-100' },
  medium: { label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-100' },
  low: { label: 'Low', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100' },
};

export const TASK_TYPE_CONFIG = {
  consultation: { label: 'Consultation', icon: 'Stethoscope', color: 'text-blue-600' },
  lab: { label: 'Lab Test', icon: 'TestTube', color: 'text-purple-600' },
  pharmacy: { label: 'Pharmacy', icon: 'Pill', color: 'text-green-600' },
  procedure: { label: 'Procedure', icon: 'Syringe', color: 'text-red-600' },
  discharge: { label: 'Discharge', icon: 'LogOut', color: 'text-gray-600' },
  imaging: { label: 'Imaging', icon: 'Scan', color: 'text-cyan-600' },
};

export const COLUMN_CONFIG = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-500', icon: 'Inbox', limit: 0 },
  { id: 'triage', title: 'Triage', color: 'bg-amber-500', icon: 'ClipboardList', limit: 10 },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500', icon: 'Activity', limit: 8 },
  { id: 'waiting', title: 'Waiting', color: 'bg-purple-500', icon: 'Clock', limit: 0 },
  { id: 'review', title: 'Review', color: 'bg-orange-500', icon: 'Eye', limit: 5 },
  { id: 'completed', title: 'Completed', color: 'bg-green-500', icon: 'CheckCircle', limit: 0 },
];
