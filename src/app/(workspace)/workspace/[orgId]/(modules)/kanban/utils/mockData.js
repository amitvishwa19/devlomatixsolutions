import { COLUMN_CONFIG } from './types';

// Indian doctor names
const doctors = ['Dr. Sharma', 'Dr. Patel', 'Dr. Gupta', 'Dr. Reddy', 'Dr. Nair'];
const departments = ['Emergency', 'Cardiology', 'Orthopedics', 'Neurology', 'General Medicine'];

// Common Indian first and last names
const firstNames = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rajesh', 'Kavita', 'Suresh', 'Meena'];
const lastNames = ['Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Verma', 'Reddy', 'Iyer', 'Nair', 'Joshi'];

const generateRandomPatient = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

const generateRandomAge = () => `${Math.floor(Math.random() * 70) + 10}`;

const priorities = ['critical', 'high', 'medium', 'low'];
const taskTypes = ['consultation', 'lab', 'pharmacy', 'procedure', 'discharge', 'imaging'];

const taskDescriptions = {
  consultation: ['Initial assessment needed', 'Follow-up consultation', 'Specialist referral', 'Post-op check'],
  lab: ['Blood work pending', 'Urine analysis required', 'Culture test needed', 'Biopsy results review'],
  pharmacy: ['Medication dispensing', 'Prescription refill', 'Drug interaction check', 'IV medication setup'],
  procedure: ['Minor surgery scheduled', 'Wound dressing change', 'Catheter insertion', 'Biopsy procedure'],
  discharge: ['Discharge planning', 'Home care instructions', 'Follow-up scheduling', 'Insurance clearance'],
  imaging: ['X-ray required', 'MRI scheduled', 'CT scan pending', 'Ultrasound needed'],
};

const tags = ['Urgent', 'Follow-up', 'New Patient', 'Insurance Pending', 'VIP', 'Elderly', 'Pediatric'];

const generateTask = (id, columnId) => {
  const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
  const descriptions = taskDescriptions[taskType];
  const priority = priorities[Math.floor(Math.random() * priorities.length)];
  
  const randomTags = [];
  const tagCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < tagCount; i++) {
    const tag = tags[Math.floor(Math.random() * tags.length)];
    if (!randomTags.includes(tag)) randomTags.push(tag);
  }

  const createdAt = new Date();
  createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 48));
  
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + Math.floor(Math.random() * 24));

  return {
    id: `task-${id}`,
    patientId: `P${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`,
    patientName: generateRandomPatient(),
    age: generateRandomAge(),
    gender: Math.random() > 0.5 ? 'Male' : 'Female',
    priority,
    taskType,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    assignedTo: doctors[Math.floor(Math.random() * doctors.length)],
    assignedDepartment: departments[Math.floor(Math.random() * departments.length)],
    createdAt,
    dueDate,
    tags: randomTags,
    columnId,
  };
};

export const generateMockColumns = () => {
  let taskId = 1;
  const tasksPerColumn = {
    'backlog': 4,
    'triage': 6,
    'in-progress': 5,
    'waiting': 3,
    'review': 4,
    'completed': 8,
  };

  return COLUMN_CONFIG.map(column => ({
    ...column,
    tasks: Array.from({ length: tasksPerColumn[column.id] || 3 }, () => generateTask(taskId++, column.id)),
  }));
};

export const mockColumns = generateMockColumns();
