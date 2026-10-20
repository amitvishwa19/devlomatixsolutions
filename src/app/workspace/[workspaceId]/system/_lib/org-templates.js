/**
 * Organization Builder Default Hierarchy Templates
 */

export const DEFAULT_ORG_TEMPLATES = {
  tech_startup: {
    version: 1,
    rootNodeId: 'node_ceo',
    nodes: {
      node_ceo: {
        id: 'node_ceo',
        title: 'Chief Executive Officer (CEO)',
        department: 'Executive',
        color: '#8b5cf6',
        parentId: null,
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Company vision, strategy, capital allocation, and executive leadership.'
      },
      node_cto: {
        id: 'node_cto',
        title: 'Chief Technology Officer (CTO)',
        department: 'Engineering',
        color: '#3b82f6',
        parentId: 'node_ceo',
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Engineering leadership, tech roadmap, system scalability, and security.'
      },
      node_hr: {
        id: 'node_hr',
        title: 'Head of Human Resources (HR)',
        department: 'Human Resources',
        color: '#ec4899',
        parentId: 'node_ceo',
        order: 1,
        assignedUserIds: [],
        responsibilities: 'Talent acquisition, employee retention, organizational culture, and compliance.'
      },
      node_vp_sales: {
        id: 'node_vp_sales',
        title: 'VP of Sales & Growth',
        department: 'Sales',
        color: '#10b981',
        parentId: 'node_ceo',
        order: 2,
        assignedUserIds: [],
        responsibilities: 'Revenue targets, enterprise partnerships, and sales pipeline expansion.'
      },
      node_cfo: {
        id: 'node_cfo',
        title: 'Chief Financial Officer (CFO)',
        department: 'Finance',
        color: '#f59e0b',
        parentId: 'node_ceo',
        order: 3,
        assignedUserIds: [],
        responsibilities: 'Financial planning, accounting, investor reporting, and cash flow governance.'
      },
      node_eng_lead: {
        id: 'node_eng_lead',
        title: 'Engineering Team Lead',
        department: 'Engineering',
        color: '#3b82f6',
        parentId: 'node_cto',
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Sprint management, code review standards, and engineer mentorship.'
      },
      node_hr_spec: {
        id: 'node_hr_spec',
        title: 'Senior HR Specialist',
        department: 'Human Resources',
        color: '#ec4899',
        parentId: 'node_hr',
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Recruiting coordination, employee benefits, and onboarding.'
      },
      node_ae: {
        id: 'node_ae',
        title: 'Senior Account Executive',
        department: 'Sales',
        color: '#10b981',
        parentId: 'node_vp_sales',
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Prospect qualification, software demonstrations, and closing enterprise contracts.'
      }
    }
  },

  corporate_agency: {
    version: 1,
    rootNodeId: 'node_md',
    nodes: {
      node_md: {
        id: 'node_md',
        title: 'Managing Director',
        department: 'Executive',
        color: '#8b5cf6',
        parentId: null,
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Agency direction, client success, and operational excellence.'
      },
      node_creative_dir: {
        id: 'node_creative_dir',
        title: 'Creative Director',
        department: 'Design',
        color: '#06b6d4',
        parentId: 'node_md',
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Brand direction, creative output, and UI/UX design quality.'
      },
      node_ops_dir: {
        id: 'node_ops_dir',
        title: 'Operations Director',
        department: 'Operations',
        color: '#f97316',
        parentId: 'node_md',
        order: 1,
        assignedUserIds: [],
        responsibilities: 'Project delivery, resource allocation, and team efficiency.'
      },
      node_hr_mgr: {
        id: 'node_hr_mgr',
        title: 'HR & People Manager',
        department: 'Human Resources',
        color: '#ec4899',
        parentId: 'node_md',
        order: 2,
        assignedUserIds: [],
        responsibilities: 'Recruitment, team welfare, and agency talent programs.'
      }
    }
  },

  blank: {
    version: 1,
    rootNodeId: 'node_root',
    nodes: {
      node_root: {
        id: 'node_root',
        title: 'Executive Leader / Founder',
        department: 'Executive',
        color: '#8b5cf6',
        parentId: null,
        order: 0,
        assignedUserIds: [],
        responsibilities: 'Strategic direction and organizational leadership.'
      }
    }
  }
};
