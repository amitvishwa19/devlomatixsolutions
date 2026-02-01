// Documentation content for CareWell HMS User Guide

export const DOCUMENTATION_SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    icon: 'FileText',
    content: {
      title: 'Welcome to CareWell HMS',
      badge: 'Overview',
      description: 'CareWell HMS is a comprehensive Hospital Management System designed to streamline every aspect of healthcare operations—from patient registration to discharge, billing, pharmacy, laboratory, and beyond.',
      keyFeatures: [
        'Complete patient workflow management (OPD/IPD)',
        'Kanban-style task boards with drag-and-drop',
        'Accommodation & bed management with floor plans',
        'Pharmacy with drug interaction checking',
        'Laboratory test ordering and results',
        'Invoice generation with print/PDF export',
        'Comprehensive reporting and analytics',
        'Cross-module navigation for seamless patient context',
      ],
      quickCards: [
        {
          icon: 'Target',
          title: 'Get Started',
          description: 'Begin by adding patients and tracking them through workflow stages.',
        },
        {
          icon: 'TrendingUp',
          title: 'Track Progress',
          description: 'Use Kanban boards and workflow dashboards to visualize patient journeys.',
        },
        {
          icon: 'Shield',
          title: 'Clinical Safety',
          description: 'Built-in drug interaction checking, allergy alerts, and audit trails.',
        },
        {
          icon: 'Building2',
          title: 'Operations',
          description: 'Manage beds, inventory, services, and billing from one platform.',
        },
      ],
      tutorials: [
        {
          title: 'Getting Started with CareWell HMS',
          description: 'Learn the basics of navigating the system and setting up your first patient.',
          duration: '5:30',
        },
        {
          title: 'Complete System Overview',
          description: 'A comprehensive walkthrough of all modules and features.',
          duration: '15:00',
        },
      ],
      walkthrough: {
        title: 'Quick Start Guide',
        steps: [
          {
            title: 'Navigate to Dashboard',
            description: 'The Dashboard provides an overview of key metrics and quick actions.',
            tip: 'Use the navigation tabs at the top to access different modules.',
          },
          {
            title: 'Register a Patient',
            description: 'Go to Patients module and click "Add Patient" to register new patients.',
            tip: 'Patient MRN is auto-generated for easy tracking.',
          },
          {
            title: 'Schedule Appointments',
            description: 'Use the Appointments module to book and manage patient visits.',
            tip: 'Multiple view modes available: List, Table, Calendar, and Scheduler.',
          },
          {
            title: 'Track with Workflow',
            description: 'Use Workflow or Kanban to track patients through care stages.',
            tip: 'Drag-and-drop cards to move patients between stages.',
          },
        ],
      },
    },
  },
  {
    id: 'workflow',
    title: 'Workflow',
    icon: 'GitBranch',
    content: {
      title: 'Workflow Management',
      badge: 'Core Module',
      description: 'The Workflow module provides a Kanban-style dashboard for tracking patient journeys through care stages. It supports both OPD (Outpatient) and IPD (Inpatient) workflows with drag-and-drop functionality.',
      sections: [
        {
          title: 'OPD Workflow Stages',
          items: [
            'Registration - Initial patient check-in (5 min)',
            'Triage - Preliminary assessment (10 min)',
            'Waiting - Queue management (variable)',
            'Consultation - Doctor examination (15-30 min)',
            'Investigation - Lab tests and imaging (30-60 min)',
            'Pharmacy - Medication dispensing (10 min)',
            'Follow-up - Scheduling return visits (5 min)',
          ],
        },
        {
          title: 'IPD Workflow Stages',
          items: [
            'Admission - Inpatient registration (30 min)',
            'Ward Assignment - Bed allocation (15 min)',
            'Treatment - Active care (varies)',
            'Monitoring - Ongoing observation (ongoing)',
            'Discharge Planning - Exit preparation (1-2 hours)',
            'Discharge - Final checkout (30 min)',
          ],
        },
        {
          title: 'Key Features',
          items: [
            'Drag-and-drop patient cards between stages',
            'Quick "Move to Next Stage" button on each card',
            'Collapsible columns to focus on specific stages',
            'Grid and List view modes',
            'Patient status indicators (Pending, In Progress, Critical)',
            'Time tracking for each stage',
            'Sticky header with filters while scrolling',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Mastering the Workflow Dashboard',
          description: 'Learn how to efficiently manage patient flow using drag-and-drop.',
          duration: '8:15',
        },
      ],
      walkthrough: {
        title: 'Workflow Walkthrough',
        steps: [
          {
            title: 'Switch Between OPD and IPD',
            description: 'Use the tabs at the top to switch between Outpatient and Inpatient workflows.',
            tip: 'Each workflow has its own set of stages optimized for that care type.',
          },
          {
            title: 'Collapse Columns',
            description: 'Click the collapse button on any column to minimize it.',
            tip: 'Collapsed columns still show the patient count.',
          },
          {
            title: 'Quick Move Patients',
            description: 'Use the arrow button on each card to move patients to the next stage.',
            tip: 'You can also drag and drop cards between columns.',
          },
        ],
      },
    },
  },
  {
    id: 'kanban',
    title: 'Kanban Board',
    icon: 'Columns3',
    content: {
      title: 'Kanban Task Management',
      badge: 'Core Module',
      description: 'The Kanban module provides a flexible task board for managing hospital tasks and patient-related activities with work-in-progress limits and priority tracking.',
      sections: [
        {
          title: 'Task Management',
          items: [
            'Create tasks with patient context',
            'Assign priorities: Critical, High, Medium, Low',
            'Task types: Consultation, Lab, Radiology, Procedure, Follow-up, Administrative',
            'Department assignment for task routing',
            'Due date and time tracking',
          ],
        },
        {
          title: 'Board Features',
          items: [
            'Drag-and-drop between columns',
            'Work-in-progress (WIP) limits per column',
            'Column collapse/expand',
            'Task search and filtering',
            'Priority and department filters',
            'Task statistics dashboard',
          ],
        },
        {
          title: 'Cross-Module Integration',
          items: [
            'Jump to patient records from task cards',
            'Link tasks to clinical records',
            'Navigation maintains patient context',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Using the Kanban Board',
          description: 'Master task management with the drag-and-drop Kanban interface.',
          duration: '6:30',
        },
      ],
      walkthrough: {
        title: 'Kanban Guide',
        steps: [
          {
            title: 'Create a Task',
            description: 'Click "Add Task" to create a new task with patient and priority info.',
            tip: 'Tasks open in a slide-out sheet for easy editing.',
          },
          {
            title: 'Move Tasks',
            description: 'Drag tasks between columns or use quick actions.',
            tip: 'WIP limits help prevent overloading any stage.',
          },
          {
            title: 'View Task Details',
            description: 'Click any task card to open the detail sheet.',
            tip: 'Use cross-module links to jump to related records.',
          },
        ],
      },
    },
  },
  {
    id: 'patients',
    title: 'Patients',
    icon: 'Users',
    content: {
      title: 'Patient Management',
      badge: 'Core Module',
      description: 'The Patient module provides comprehensive patient record management including demographics, vitals, medical history, prescriptions, allergies, and document storage.',
      sections: [
        {
          title: 'Patient Registration',
          items: [
            'Add new patients with demographics (name, age, gender, contact)',
            'Auto-generated MRN (Medical Record Number)',
            'Blood type and emergency contact capture',
            'Insurance information tracking',
          ],
        },
        {
          title: 'Clinical Tabs',
          items: [
            'Demographics - Basic patient information with inline editing',
            'Vitals - Track BP, heart rate, temperature, SpO2, weight, height with trend charts',
            'Medical History - Timeline of diagnoses, surgeries, and conditions',
            'Prescriptions - View and manage patient medications',
            'Allergies - Document drug, food, and environmental allergies with severity',
            'Documents - Upload and manage lab reports, radiology, and other files',
          ],
        },
        {
          title: 'Views & Filters',
          items: [
            'Grid view with patient cards',
            'Table view for data-dense display',
            'Search by name or MRN',
            'Filter by status (Critical, Admitted, etc.)',
            'Tag-based filtering using taxonomy',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Managing Patient Records',
          description: 'Complete guide to patient registration, vitals tracking, and medical history.',
          duration: '10:20',
        },
        {
          title: 'Working with Patient Documents',
          description: 'Learn how to upload, organize, and manage patient documents.',
          duration: '6:45',
        },
      ],
      walkthrough: {
        title: 'Patient Management Guide',
        steps: [
          {
            title: 'Register a New Patient',
            description: 'Click "Add Patient" and fill in the required demographics.',
            tip: 'The MRN is auto-generated but can be customized.',
          },
          {
            title: 'Record Vitals',
            description: 'Navigate to the Vitals tab and enter current measurements.',
            tip: 'Vitals history is shown as a trend chart.',
          },
          {
            title: 'Document Allergies',
            description: 'Add known allergies with severity levels in the Allergies tab.',
            tip: 'Allergies are cross-referenced during prescription creation.',
          },
          {
            title: 'Upload Documents',
            description: 'Use the Documents tab to upload lab reports and other files.',
            tip: 'Supports PDF, images, and common document formats.',
          },
        ],
      },
    },
  },
  {
    id: 'appointments',
    title: 'Appointments',
    icon: 'Calendar',
    content: {
      title: 'Appointment Management',
      badge: 'Scheduling',
      description: 'The Appointments module handles patient scheduling with multiple view modes, doctor availability management, drag-and-drop scheduling, and waitlist functionality.',
      sections: [
        {
          title: 'Booking Features',
          items: [
            'Schedule appointments with preferred time slots (Morning, Noon, Evening, Night)',
            '15-minute interval time selection',
            'Multiple appointment types (Consultation, Follow-up, Checkup, Lab Test, Procedure)',
            'Appointment modes (In-Person, Video, Chat, Phone)',
            'Recurring appointments (Daily, Weekly, Bi-weekly, Monthly)',
          ],
        },
        {
          title: 'View Modes',
          items: [
            'List View - Compact card layout',
            'Table View - Spreadsheet-style with sorting',
            'Calendar View - Day/Week/Month visualization',
            'Scheduler View - Drag-and-drop calendar with rescheduling',
            'Analytics View - Appointment statistics and trends',
          ],
        },
        {
          title: 'Management Tools',
          items: [
            'Doctor availability configuration',
            'Blocked time slots for breaks/meetings',
            'Waitlist management for overbooking',
            'Drag-and-drop rescheduling in scheduler view',
            'Status tracking (Scheduled, Confirmed, In-Progress, Completed, Cancelled, No-Show)',
            'Department and doctor filtering',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Scheduling Appointments',
          description: 'Master the appointment booking process and time slot management.',
          duration: '7:30',
        },
        {
          title: 'Managing Doctor Availability',
          description: 'Configure doctor schedules and blocked time slots.',
          duration: '5:15',
        },
      ],
      walkthrough: {
        title: 'Appointment Booking Guide',
        steps: [
          {
            title: 'Select a Patient',
            description: 'Choose an existing patient or register a new one.',
            tip: 'Search patients by name or MRN.',
          },
          {
            title: 'Choose Date and Time',
            description: 'Select the preferred date and available time slot.',
            tip: 'Time slots are color-coded by period.',
          },
          {
            title: 'Assign a Doctor',
            description: 'Select the doctor and department for the appointment.',
            tip: 'Only doctors with available slots are shown.',
          },
          {
            title: 'Confirm Booking',
            description: 'Review details and confirm the appointment.',
            tip: 'The appointment appears in calendar and list views.',
          },
        ],
      },
    },
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions',
    icon: 'Pill',
    content: {
      title: 'Prescription Management',
      badge: 'Clinical',
      description: 'The Prescription module enables medication management with clinical safety features, e-prescribing capabilities, and refill tracking.',
      sections: [
        {
          title: 'Prescription Creation',
          items: [
            'Add multiple medications per prescription',
            'Dosage, frequency, and duration configuration',
            'Route of administration (Oral, IV, IM, Topical, etc.)',
            'Special instructions and notes',
            'Doctor assignment and patient linking',
          ],
        },
        {
          title: 'Clinical Safety',
          items: [
            'Drug Interaction Checker - Alerts for dangerous combinations',
            'Severity levels (Critical, Major, Moderate, Minor)',
            'Clinical recommendations for interactions',
            'Allergy cross-referencing with patient records',
          ],
        },
        {
          title: 'Advanced Features',
          items: [
            'E-Prescribing - Digital transmission to pharmacies',
            'Pharmacy network integration',
            'Refill Management - Track and approve refill requests',
            'Prescription Analytics - Trends and patterns',
            'Status tracking (Active, Completed, Cancelled, Expired)',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Creating Safe Prescriptions',
          description: 'Learn to use the drug interaction checker and create safe prescriptions.',
          duration: '9:00',
        },
        {
          title: 'E-Prescribing Workflow',
          description: 'Send prescriptions electronically to pharmacies.',
          duration: '4:30',
        },
      ],
      walkthrough: {
        title: 'Prescription Creation Guide',
        steps: [
          {
            title: 'Select Patient',
            description: 'Choose the patient who needs the prescription.',
            tip: 'Patient allergies are automatically loaded.',
          },
          {
            title: 'Add Medications',
            description: 'Search and add medications with dosage and frequency.',
            tip: 'Drug interactions are checked automatically.',
          },
          {
            title: 'Review Interactions',
            description: 'Check the interaction panel for any warnings.',
            tip: 'Critical interactions must be acknowledged before saving.',
          },
          {
            title: 'Send to Pharmacy',
            description: 'Use e-prescribing to send directly to the pharmacy.',
            tip: 'You can also print the prescription.',
          },
        ],
      },
    },
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    icon: 'Syringe',
    content: {
      title: 'Pharmacy Management',
      badge: 'Operations',
      description: 'The Pharmacy module provides complete medication inventory management with dispensing, batch tracking, supplier management, and clinical safety features.',
      sections: [
        {
          title: 'Inventory Management',
          items: [
            'Medicine catalog with categories and formulations',
            'Stock level tracking with low stock alerts',
            'Batch management with FIFO dispensing',
            'Expiry date tracking and alerts',
            'Barcode/QR code scanning support',
          ],
        },
        {
          title: 'Dispensing',
          items: [
            'Dispense medications linked to prescriptions',
            'Automatic stock deduction',
            'Drug interaction warnings during dispensing',
            'Patient allergy alerts',
            'Dispensing history and audit trail',
          ],
        },
        {
          title: 'Advanced Features',
          items: [
            'Supplier management with contact info',
            'Purchase order creation and tracking',
            'Return and adjustment workflows',
            'Batch expiry tracker dashboard',
            'Pharmacy analytics and reports',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Managing Pharmacy Inventory',
          description: 'Learn to manage medicine stock, batches, and suppliers.',
          duration: '10:00',
        },
        {
          title: 'Safe Medication Dispensing',
          description: 'Dispense medications with drug interaction and allergy checks.',
          duration: '7:30',
        },
      ],
      walkthrough: {
        title: 'Pharmacy Guide',
        steps: [
          {
            title: 'Add Medicine',
            description: 'Click "Add Medicine" to add new items to inventory.',
            tip: 'Include batch numbers and expiry dates.',
          },
          {
            title: 'Dispense Medication',
            description: 'Use the Dispensing panel to fulfill prescriptions.',
            tip: 'System checks for interactions and allergies automatically.',
          },
          {
            title: 'Track Expiries',
            description: 'Monitor the Batch Expiry Tracker for upcoming expirations.',
            tip: 'FIFO ensures oldest stock is dispensed first.',
          },
          {
            title: 'Manage Suppliers',
            description: 'Use Supplier Management to track vendor relationships.',
            tip: 'Create purchase orders when stock is low.',
          },
        ],
      },
    },
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    icon: 'FlaskConical',
    content: {
      title: 'Laboratory Management',
      badge: 'Clinical',
      description: 'The Laboratory module handles test ordering, sample collection, result entry, and lab analytics for comprehensive diagnostic management.',
      sections: [
        {
          title: 'Test Ordering',
          items: [
            'Order lab tests for patients',
            'Multiple test types (Blood, Urine, Imaging, etc.)',
            'Priority levels (Routine, Urgent, STAT)',
            'Sample collection tracking',
            'Expected turnaround times',
          ],
        },
        {
          title: 'Results Management',
          items: [
            'Enter and review test results',
            'Normal range indicators',
            'Result status tracking (Pending, In Progress, Completed)',
            'Result verification workflow',
            'Historical result comparison',
          ],
        },
        {
          title: 'Views & Analytics',
          items: [
            'List and Table view modes',
            'Filter by status, priority, and date',
            'Lab workload analytics',
            'Turnaround time tracking',
            'Test volume trends',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Ordering Lab Tests',
          description: 'Learn to order tests and track samples through the lab workflow.',
          duration: '7:00',
        },
        {
          title: 'Managing Lab Results',
          description: 'Enter, verify, and share lab results with clinicians.',
          duration: '6:15',
        },
      ],
      walkthrough: {
        title: 'Laboratory Guide',
        steps: [
          {
            title: 'Create Test Order',
            description: 'Click "New Test Order" to request lab tests for a patient.',
            tip: 'Select priority based on clinical urgency.',
          },
          {
            title: 'Track Sample',
            description: 'Monitor sample collection and processing status.',
            tip: 'Status updates as the sample moves through the lab.',
          },
          {
            title: 'Enter Results',
            description: 'Enter test results with normal range comparisons.',
            tip: 'Abnormal values are highlighted automatically.',
          },
          {
            title: 'View Analytics',
            description: 'Check Lab Analytics for workload and performance metrics.',
            tip: 'Track turnaround times to improve efficiency.',
          },
        ],
      },
    },
  },
  {
    id: 'accommodation',
    title: 'Accommodation',
    icon: 'Building2',
    content: {
      title: 'Bed & Room Management',
      badge: 'Operations',
      description: 'The Accommodation module provides comprehensive bed management with floor plans, patient admissions, housekeeping, and capacity planning.',
      sections: [
        {
          title: 'Room Management',
          items: [
            'Add, edit, and delete rooms',
            'Room types: Private, Semi-Private, Ward, ICU, NICU, Isolation',
            'Per-room amenities (TV, AC, Bathroom, WiFi, etc.)',
            'Floor and wing assignment',
            'Daily rate configuration',
          ],
        },
        {
          title: 'Bed Management',
          items: [
            'Add/remove beds within rooms',
            'Auto-labeling (e.g., 101-A, 101-B)',
            'Individual bed amenities',
            'Bed status tracking (Available, Occupied, Reserved, Maintenance)',
            'Safety checks prevent removing occupied beds',
          ],
        },
        {
          title: 'Patient Operations',
          items: [
            'Admit patients to beds',
            'Transfer between beds/rooms',
            'Discharge with billing integration',
            'Bed reservation for upcoming admissions',
            'Waiting list management',
          ],
        },
        {
          title: 'Advanced Features',
          items: [
            'Floor plan visualization',
            'Housekeeping management',
            'Maintenance scheduling',
            'Equipment tracking',
            'Ward rounds panel',
            'Shift handover notes',
            'Capacity planning dashboard',
            'Occupancy analytics',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Managing Rooms and Beds',
          description: 'Learn to configure rooms, add beds, and manage capacity.',
          duration: '8:30',
        },
        {
          title: 'Patient Admissions',
          description: 'Admit, transfer, and discharge patients from beds.',
          duration: '7:00',
        },
      ],
      walkthrough: {
        title: 'Accommodation Guide',
        steps: [
          {
            title: 'Add a Room',
            description: 'Click "Add Room" to create a new room with type and amenities.',
            tip: 'Set daily rate for billing integration.',
          },
          {
            title: 'Manage Beds',
            description: 'Open the Bed Management dialog to add or configure beds.',
            tip: 'Beds are auto-labeled based on room number.',
          },
          {
            title: 'Admit a Patient',
            description: 'Click an available bed to admit a patient.',
            tip: 'Select from existing patients or register new ones.',
          },
          {
            title: 'Discharge Patient',
            description: 'Use the discharge action to free up the bed.',
            tip: 'Discharge triggers billing calculation.',
          },
        ],
      },
    },
  },
  {
    id: 'invoice',
    title: 'Invoice & Billing',
    icon: 'Receipt',
    content: {
      title: 'Invoice Management',
      badge: 'Finance',
      description: 'The Invoice module handles patient billing with itemized charges, payment tracking, and professional invoice generation with print/PDF export.',
      sections: [
        {
          title: 'Invoice Creation',
          items: [
            'Generate invoices from patient encounters',
            'Itemized line items (services, medications, room charges)',
            'Tax calculation',
            'Discount application',
            'Notes and terms',
          ],
        },
        {
          title: 'Payment Management',
          items: [
            'Record partial or full payments',
            'Payment methods (Cash, Card, Insurance, UPI)',
            'Payment history tracking',
            'Outstanding balance calculation',
            'Overdue invoice alerts',
          ],
        },
        {
          title: 'Export & Print',
          items: [
            'Professional print template with hospital letterhead',
            'PDF download/export',
            'Invoice status (Draft, Sent, Paid, Overdue, Cancelled)',
            'Batch invoice generation',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Creating and Managing Invoices',
          description: 'Generate invoices and track payments effectively.',
          duration: '8:00',
        },
        {
          title: 'Printing and Exporting',
          description: 'Create professional PDF invoices for patients.',
          duration: '4:00',
        },
      ],
      walkthrough: {
        title: 'Invoice Guide',
        steps: [
          {
            title: 'Generate Invoice',
            description: 'Click "Generate Invoice" to create a new patient bill.',
            tip: 'Select a patient to auto-populate their details.',
          },
          {
            title: 'Add Line Items',
            description: 'Add services, medications, and other charges.',
            tip: 'Items from services module can be selected.',
          },
          {
            title: 'Record Payment',
            description: 'Use "Record Payment" to log payments received.',
            tip: 'Partial payments update the outstanding balance.',
          },
          {
            title: 'Print/Export',
            description: 'Click the print icon to generate a PDF invoice.',
            tip: 'The template includes hospital letterhead.',
          },
        ],
      },
    },
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: 'Package',
    content: {
      title: 'Inventory Management',
      badge: 'Operations',
      description: 'The Inventory module tracks medical supplies and equipment with stock management, reorder alerts, and purchase order integration.',
      sections: [
        {
          title: 'Stock Management',
          items: [
            'Track items with categories and units',
            'Stock level monitoring',
            'Low stock and out-of-stock alerts',
            'Reorder point configuration',
            'Stock adjustment with reasons',
          ],
        },
        {
          title: 'Purchase Orders',
          items: [
            'Create purchase orders for restocking',
            'Supplier assignment',
            'Order status tracking',
            'Receiving and stock updates',
          ],
        },
        {
          title: 'Analytics & Audit',
          items: [
            'Inventory value tracking',
            'Usage analytics',
            'Audit trail for all changes',
            'Expiry tracking for consumables',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Managing Medical Inventory',
          description: 'Track supplies, set reorder points, and manage stock.',
          duration: '7:30',
        },
      ],
      walkthrough: {
        title: 'Inventory Guide',
        steps: [
          {
            title: 'Add Item',
            description: 'Click "Add Item" to add new inventory items.',
            tip: 'Set category and reorder point for alerts.',
          },
          {
            title: 'Adjust Stock',
            description: 'Use stock adjustment to update quantities.',
            tip: 'Provide a reason for audit purposes.',
          },
          {
            title: 'Create Reorder',
            description: 'Use Reorder Manager when stock is low.',
            tip: 'Purchase orders can be sent to suppliers.',
          },
        ],
      },
    },
  },
  {
    id: 'services',
    title: 'Services',
    icon: 'Stethoscope',
    content: {
      title: 'Service Catalog',
      badge: 'Configuration',
      description: 'The Services module manages the hospital service catalog with pricing, categories, and analytics for billing integration.',
      sections: [
        {
          title: 'Service Management',
          items: [
            'Add and edit hospital services',
            'Categories: Consultation, Procedure, Laboratory, Radiology, Therapy, Surgery',
            'Base price and duration',
            'Active/Inactive status',
            'Service descriptions',
          ],
        },
        {
          title: 'Integration',
          items: [
            'Services appear in invoice line items',
            'Price lookup during billing',
            'Service usage tracking',
          ],
        },
        {
          title: 'Analytics',
          items: [
            'Service utilization reports',
            'Revenue by service category',
            'Popular services dashboard',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Managing the Service Catalog',
          description: 'Configure hospital services for billing and scheduling.',
          duration: '5:00',
        },
      ],
      walkthrough: {
        title: 'Services Guide',
        steps: [
          {
            title: 'Add Service',
            description: 'Click "Add Service" to create a new service offering.',
            tip: 'Set category for organized billing.',
          },
          {
            title: 'Set Pricing',
            description: 'Configure base price and any variations.',
            tip: 'Prices are used in invoice generation.',
          },
          {
            title: 'View Analytics',
            description: 'Check service utilization and revenue.',
            tip: 'Identify popular and underused services.',
          },
        ],
      },
    },
  },
  {
    id: 'calendar',
    title: 'Calendar',
    icon: 'CalendarDays',
    content: {
      title: 'Calendar System',
      badge: 'Scheduling',
      description: 'The Calendar module provides a comprehensive scheduling interface with multiple view modes and appointment visualization.',
      sections: [
        {
          title: 'View Modes',
          items: [
            'Month View - Full month overview with appointment dots',
            'Week View - Detailed weekly schedule',
            'Day View - Hourly breakdown for a single day',
          ],
        },
        {
          title: 'Features',
          items: [
            'Quick date navigation with sidebar calendar',
            'Click appointments to view details',
            'Today button for quick navigation',
            'Previous/Next navigation controls',
            'Appointment type color coding',
            'Integration with Appointments module',
          ],
        },
      ],
    },
  },
  {
    id: 'taxonomy',
    title: 'Taxonomy',
    icon: 'Tags',
    content: {
      title: 'Taxonomy System',
      badge: 'Organization',
      description: 'The Taxonomy module provides a flexible categorization system for organizing patients, appointments, and prescriptions with tags and hierarchical categories.',
      sections: [
        {
          title: 'Tags',
          items: [
            'Color-coded labels for quick identification',
            '10 color options (Blue, Green, Red, Yellow, Purple, Pink, Orange, Teal, Indigo, Gray)',
            'Entity type assignment (Patient, Appointment, Prescription)',
            'Usage count tracking',
            'Searchable tag filter in list views',
          ],
        },
        {
          title: 'Categories',
          items: [
            'Hierarchical organization with parent-child relationships',
            'Color-coded for visual distinction',
            'Entity type scoping',
            'Nested category support',
          ],
        },
        {
          title: 'Integration',
          items: [
            'Tag selector in patient, appointment, and prescription forms',
            'Filter by tags in all list views',
            'Display assigned tags on cards and detail sheets',
            'Bulk tag assignment capabilities',
          ],
        },
      ],
    },
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: 'BarChart3',
    content: {
      title: 'Reporting Dashboard',
      badge: 'Analytics',
      description: 'The Reports module provides comprehensive analytics and visualizations for hospital operations, patient demographics, revenue, and clinical metrics.',
      sections: [
        {
          title: 'Dashboard Charts',
          items: [
            'Patient trends over time',
            'Age distribution demographics',
            'Department workload pie charts',
            'Appointment volume trends',
            'Revenue charts and projections',
            'Top medications prescribed',
          ],
        },
        {
          title: 'Summary Cards',
          items: [
            'Total patients and growth',
            'Appointment counts',
            'Revenue metrics',
            'Prescription statistics',
          ],
        },
        {
          title: 'Features',
          items: [
            'Date range filtering',
            'Export capabilities',
            'Refresh data on demand',
            'Responsive chart layouts',
          ],
        },
      ],
      tutorials: [
        {
          title: 'Understanding Analytics',
          description: 'Learn to interpret charts and make data-driven decisions.',
          duration: '6:00',
        },
      ],
    },
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: 'Bell',
    content: {
      title: 'Notification Center',
      badge: 'System',
      description: 'The Notifications module provides a centralized hub for system alerts, reminders, and important updates.',
      sections: [
        {
          title: 'Notification Types',
          items: [
            'Critical alerts (emergencies, critical patients)',
            'Reminders (appointments, medication refills)',
            'System updates and announcements',
            'Task assignments and completions',
          ],
        },
        {
          title: 'Features',
          items: [
            'Read/unread status tracking',
            'Priority-based sorting',
            'Filter by type',
            'Mark all as read',
            'Notification history',
          ],
        },
      ],
    },
  },
  {
    id: 'cross-module',
    title: 'Cross-Module Navigation',
    icon: 'Link',
    content: {
      title: 'Cross-Module Navigation',
      badge: 'System',
      description: 'The system supports seamless navigation between modules while maintaining patient context, allowing quick jumps from one area to related records in another.',
      sections: [
        {
          title: 'Navigation Features',
          items: [
            'Patient context passed between modules',
            'Quick actions menu for related modules',
            'Cross-module header with navigation links',
            'Jump from Kanban tasks to clinical records',
            'Navigate from patient to appointments, prescriptions, lab orders',
          ],
        },
        {
          title: 'Use Cases',
          items: [
            'View patient from appointment details',
            'Jump to prescriptions from patient record',
            'Access lab orders from workflow cards',
            'Open billing from accommodation discharge',
          ],
        },
      ],
    },
  },
  {
    id: 'data-persistence',
    title: 'Data Storage',
    icon: 'Database',
    content: {
      title: 'Data Persistence',
      badge: 'Technical',
      description: 'The system uses browser localStorage for data persistence, ensuring your data is saved across sessions and browser refreshes.',
      sections: [
        {
          title: 'Storage Keys',
          items: [
            'hms_patients - Patient records',
            'hms_appointments - Appointment data',
            'hms_prescriptions - Prescription records',
            'hms_categories - Taxonomy categories',
            'hms_tags - Taxonomy tags',
            'hms_opd_patients - OPD workflow patients',
            'hms_ipd_patients - IPD workflow patients',
            'hms_waitlist - Appointment waitlist',
            'hms_doctor_schedules - Doctor availability',
            'hms_invoices - Invoice data',
            'hms_inventory - Inventory items',
            'hms_pharmacy - Pharmacy inventory',
            'hms_lab_orders - Laboratory orders',
            'hms_rooms - Accommodation rooms',
            'hms_kanban_tasks - Kanban board tasks',
          ],
        },
        {
          title: 'Features',
          items: [
            'Automatic save on all CRUD operations',
            'Cross-tab synchronization',
            'Date object preservation (ISO string parsing)',
            'Initial demo data population',
          ],
        },
      ],
    },
  },
  {
    id: 'forms',
    title: 'Forms & Validation',
    icon: 'FormInput',
    content: {
      title: 'Forms & Validation',
      badge: 'Technical',
      description: 'All forms across the system use React Hook Form with Zod validation for reliable data entry and error handling. All modals use the Sheet (slide-out drawer) pattern for consistency.',
      sections: [
        {
          title: 'Form Features',
          items: [
            'Real-time field validation',
            'Clear error messages',
            'Required field indicators',
            'Maximum length constraints',
            'Pattern validation (email, phone)',
            'Custom validation rules',
          ],
        },
        {
          title: 'UI Patterns',
          items: [
            'Sheet (slide-out drawer) modals throughout',
            'Consistent form layouts',
            'Sticky footer with action buttons',
            'ScrollArea for long forms',
            'Card-within-sheet design pattern',
          ],
        },
        {
          title: 'Validated Forms',
          items: [
            'New Patient Registration',
            'New Appointment Booking',
            'New Prescription Creation',
            'Vitals Entry',
            'Allergy Recording',
            'Category/Tag Creation',
            'Workflow Patient Addition',
            'Kanban Task Creation',
            'Invoice Generation',
            'Room/Bed Management',
            'Lab Test Ordering',
          ],
        },
      ],
    },
  },
];

export const DOCUMENTATION_NAV = DOCUMENTATION_SECTIONS.map((section) => ({
  id: section.id,
  title: section.title,
  icon: section.icon,
}));
