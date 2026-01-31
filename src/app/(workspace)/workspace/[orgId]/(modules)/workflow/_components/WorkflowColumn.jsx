import { PatientCard } from './PatientCard';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  ClipboardList, 
  HeartPulse, 
  Clock, 
  Stethoscope, 
  TestTube, 
  Pill, 
  CalendarCheck,
  DoorOpen,
  BedDouble,
  Syringe,
  Activity,
  FileText,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const iconMap = {
  ClipboardList,
  HeartPulse,
  Clock,
  Stethoscope,
  TestTube,
  Pill,
  CalendarCheck,
  DoorOpen,
  BedDouble,
  Syringe,
  Activity,
  FileText,
  LogOut,
};

export function WorkflowColumn({ 
  stage, 
  patients, 
  index, 
  viewMode = 'grid', 
  onPatientClick, 
  isCollapsed, 
  onToggleCollapse,
  nextStageName,
  onMoveToNextStage,
  isLastStage
}) {
  const Icon = iconMap[stage.icon] || ClipboardList;

  if (viewMode === 'list') {
    return (
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div 
          className="px-4 py-3 border-b border-border flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
          onClick={onToggleCollapse}
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <div className="w-2 h-2 rounded-full" style={{
              backgroundColor: `hsl(var(--${stage.color.replace('workflow-', 'workflow-')}))`
            }} />
            <span className="font-medium text-card-foreground">{stage.name}</span>
            <span className="ml-1 px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
              {patients.length}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{stage.estimatedTime}</span>
          </div>
        </div>

        {!isCollapsed && (
          <Droppable droppableId={stage.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`p-2 space-y-2 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-accent/50' : ''
                }`}
              >
                {patients.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-4">No patients</p>
                ) : (
                  patients.map((patient, patientIndex) => (
                    <Draggable key={patient.id} draggableId={patient.id} index={patientIndex}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <PatientCard 
                            patient={patient} 
                            isDragging={snapshot.isDragging} 
                            viewMode="list" 
                            onClick={() => onPatientClick?.(patient, stage.name)}
                            nextStageName={nextStageName}
                            onMoveToNextStage={onMoveToNextStage}
                            isLastStage={isLastStage}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}

        {isCollapsed && (
          <Droppable droppableId={stage.id}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="hidden">
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    );
  }

  // Grid view - collapsed state shows narrow column
  if (isCollapsed) {
    return (
      <div 
        className="bg-card rounded-lg border border-border flex flex-col w-12 min-h-[calc(100vh-380px)] shadow-sm cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="p-2 flex flex-col items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="w-2 h-2 rounded-full" style={{
            backgroundColor: `hsl(var(--${stage.color.replace('workflow-', 'workflow-')}))`
          }} />
          <span className="px-1.5 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
            {patients.length}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <span 
            className="text-xs font-medium text-muted-foreground whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            {stage.name}
          </span>
        </div>
        <Droppable droppableId={stage.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="hidden">
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border flex flex-col min-w-[280px] w-[280px] min-h-[calc(100vh-380px)] shadow-sm">
      <div 
        className="px-4 py-3 border-b border-border flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <ChevronDown className="w-4 h-4" />
          </Button>
          <div className="w-2 h-2 rounded-full" style={{
            backgroundColor: `hsl(var(--${stage.color.replace('workflow-', 'workflow-')}))`
          }} />
          <span className="font-medium text-card-foreground">{stage.name}</span>
          <span className="ml-1 px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
            {patients.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{stage.estimatedTime}</span>
        </div>
      </div>

      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-3 transition-colors ${
              snapshot.isDraggingOver ? 'bg-accent/50' : ''
            }`}
          >
            {patients.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No patients</p>
            ) : (
              patients.map((patient, patientIndex) => (
                <Draggable key={patient.id} draggableId={patient.id} index={patientIndex}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <PatientCard 
                        patient={patient} 
                        isDragging={snapshot.isDragging} 
                        viewMode="grid" 
                        onClick={() => onPatientClick?.(patient, stage.name)}
                        nextStageName={nextStageName}
                        onMoveToNextStage={onMoveToNextStage}
                        isLastStage={isLastStage}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
