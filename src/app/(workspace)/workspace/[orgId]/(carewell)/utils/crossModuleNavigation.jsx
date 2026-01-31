import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  User, Calendar, Pill, FlaskConical, Bed, Receipt, 
  Package, Stethoscope, MoreHorizontal, ExternalLink,
  CreditCard, Activity
} from 'lucide-react';

// Module routes configuration
export const MODULE_ROUTES = {
  patients: '/patients',
  appointments: '/appointments',
  prescriptions: '/prescriptions',
  laboratory: '/laboratory',
  accommodation: '/accommodation',
  pharmacy: '/pharmacy',
  invoice: '/invoice',
  inventory: '/inventory',
  workflow: '/workflow',
  services: '/services',
};

// Quick action definitions for each module
export const QUICK_ACTIONS = {
  viewPatient: {
    label: 'View Patient',
    icon: User,
    route: MODULE_ROUTES.patients,
    color: 'text-blue-600',
  },
  scheduleAppointment: {
    label: 'Schedule Appointment',
    icon: Calendar,
    route: MODULE_ROUTES.appointments,
    color: 'text-emerald-600',
  },
  viewPrescriptions: {
    label: 'View Prescriptions',
    icon: Pill,
    route: MODULE_ROUTES.prescriptions,
    color: 'text-purple-600',
  },
  orderLabTest: {
    label: 'Order Lab Test',
    icon: FlaskConical,
    route: MODULE_ROUTES.laboratory,
    color: 'text-amber-600',
  },
  viewBedAssignment: {
    label: 'View Bed Assignment',
    icon: Bed,
    route: MODULE_ROUTES.accommodation,
    color: 'text-teal-600',
  },
  viewInvoices: {
    label: 'View Invoices',
    icon: Receipt,
    route: MODULE_ROUTES.invoice,
    color: 'text-rose-600',
  },
  goToPharmacy: {
    label: 'Go to Pharmacy',
    icon: Package,
    route: MODULE_ROUTES.pharmacy,
    color: 'text-indigo-600',
  },
  viewServices: {
    label: 'View Services',
    icon: Stethoscope,
    route: MODULE_ROUTES.services,
    color: 'text-cyan-600',
  },
  checkInventory: {
    label: 'Check Inventory',
    icon: Package,
    route: MODULE_ROUTES.inventory,
    color: 'text-orange-600',
  },
};

/**
 * QuickActionsMenu - Dropdown menu with cross-module navigation options
 */
export function QuickActionsMenu({ patientId, patientName, actions = [], className = '' }) {
  const navigate = useNavigate();

  const handleNavigate = (action) => {
    // Navigate to the module with optional state
    navigate(action.route, { 
      state: { 
        patientId, 
        patientName,
        fromModule: window.location.pathname 
      } 
    });
  };

  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <MoreHorizontal className="w-4 h-4 mr-1" />
          Quick Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Navigate to Module
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((actionKey) => {
          const action = QUICK_ACTIONS[actionKey];
          if (!action) return null;
          const Icon = action.icon;
          return (
            <DropdownMenuItem 
              key={actionKey}
              onClick={() => handleNavigate(action)}
              className="cursor-pointer"
            >
              <Icon className={`w-4 h-4 mr-2 ${action.color}`} />
              {action.label}
              <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground" />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * QuickActionButtons - Individual action buttons for cross-module navigation
 */
export function QuickActionButtons({ patientId, patientName, actions = [], size = 'sm', variant = 'outline' }) {
  const navigate = useNavigate();

  const handleNavigate = (action) => {
    navigate(action.route, { 
      state: { 
        patientId, 
        patientName,
        fromModule: window.location.pathname 
      } 
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((actionKey) => {
        const action = QUICK_ACTIONS[actionKey];
        if (!action) return null;
        const Icon = action.icon;
        return (
          <Button
            key={actionKey}
            variant={variant}
            size={size}
            onClick={() => handleNavigate(action)}
            className="gap-1.5"
          >
            <Icon className={`w-4 h-4 ${action.color}`} />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * ModuleLinkBadge - Clickable badge that navigates to another module
 */
export function ModuleLinkBadge({ moduleKey, label, patientId, patientName }) {
  const navigate = useNavigate();
  const route = MODULE_ROUTES[moduleKey];

  if (!route) return null;

  const handleClick = () => {
    navigate(route, { 
      state: { 
        patientId, 
        patientName,
        fromModule: window.location.pathname 
      } 
    });
  };

  const iconMap = {
    patients: User,
    appointments: Calendar,
    prescriptions: Pill,
    laboratory: FlaskConical,
    accommodation: Bed,
    invoice: Receipt,
    pharmacy: Package,
    inventory: Package,
    workflow: Activity,
    services: Stethoscope,
  };

  const Icon = iconMap[moduleKey] || ExternalLink;

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
    >
      <Icon className="w-3 h-3" />
      {label}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

/**
 * CrossModuleHeader - Reusable header section showing patient context with navigation
 */
export function CrossModuleHeader({ patient, showActions = true, actions = [] }) {
  if (!patient) return null;

  const defaultActions = ['viewPatient', 'scheduleAppointment', 'viewPrescriptions', 'orderLabTest'];
  const actionsToShow = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm">{patient.name}</p>
          <p className="text-xs text-muted-foreground">{patient.mrn || patient.id}</p>
        </div>
      </div>
      {showActions && (
        <QuickActionsMenu 
          patientId={patient.id || patient.mrn}
          patientName={patient.name}
          actions={actionsToShow}
        />
      )}
    </div>
  );
}

export default {
  MODULE_ROUTES,
  QUICK_ACTIONS,
  QuickActionsMenu,
  QuickActionButtons,
  ModuleLinkBadge,
  CrossModuleHeader,
};
