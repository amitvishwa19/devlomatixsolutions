import { useState, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn.jsx';
import { AddTaskSheet } from './AddTaskSheet.jsx';
import { AddColumnSheet } from './AddColumnSheet.jsx';
import { FilterSheet } from './FilterSheet.jsx';
import { toast } from 'sonner';

const initialData = {
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Morning vitals check',
          description: 'Complete vital signs assessment for all patients in Ward A',
          patientName: 'Rajesh Kumar',
          patientAge: 45,
          patientGender: 'Male',
          doctorName: 'Priya Sharma',
          doctorSpecialty: 'General Medicine',
          priority: 'high',
          category: 'patient-care',
          dueTime: '08:00',
          createdAt: new Date(),
        },
        {
          id: '2',
          title: 'Review lab results',
          description: 'Check blood work results from yesterday',
          patientName: 'Anita Desai',
          patientAge: 32,
          patientGender: 'Female',
          doctorName: 'Vikram Patel',
          doctorSpecialty: 'Pathology',
          roomNumber: '204',
          priority: 'medium',
          category: 'lab-work',
          createdAt: new Date(),
        },
        {
          id: '3',
          title: 'Update patient records',
          doctorName: 'Sunita Reddy',
          doctorSpecialty: 'Administration',
          priority: 'low',
          category: 'administrative',
          createdAt: new Date(),
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        {
          id: '4',
          title: 'Post-op monitoring',
          description: 'Monitor recovery progress post appendectomy',
          patientName: 'Arjun Mehta',
          patientAge: 28,
          patientGender: 'Male',
          doctorName: 'Kavita Iyer',
          doctorSpecialty: 'General Surgery',
          roomNumber: '312',
          priority: 'high',
          category: 'surgery',
          dueTime: '14:00',
          createdAt: new Date(),
        },
        {
          id: '5',
          title: 'Physical therapy session',
          patientName: 'Meera Nair',
          patientAge: 55,
          patientGender: 'Female',
          doctorName: 'Rohit Gupta',
          doctorSpecialty: 'Physiotherapy',
          roomNumber: '108',
          priority: 'medium',
          category: 'patient-care',
          createdAt: new Date(),
        },
      ],
    },
    {
      id: 'done',
      title: 'Completed',
      tasks: [
        {
          id: '6',
          title: 'Medication round',
          description: '10am medication distribution complete',
          patientName: 'Suresh Verma',
          patientAge: 62,
          patientGender: 'Male',
          doctorName: 'Anjali Singh',
          doctorSpecialty: 'Internal Medicine',
          priority: 'high',
          category: 'patient-care',
          createdAt: new Date(),
        },
        {
          id: '7',
          title: 'Cardiology consultation',
          patientName: 'Lakshmi Rao',
          patientAge: 48,
          patientGender: 'Female',
          doctorName: 'Amit Joshi',
          doctorSpecialty: 'Cardiology',
          roomNumber: '215',
          priority: 'medium',
          category: 'consultation',
          createdAt: new Date(),
        },
      ],
    },
  ],
};

export const KanbanBoard = () => {
  const [boardState, setBoardState] = useState(initialData);
  const [filters, setFilters] = useState({
    searchQuery: '',
    priorities: [],
    categories: [],
  });

  const filteredColumns = useMemo(() => {
    return boardState.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        // Search filter
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          const matchesSearch =
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.patientName?.toLowerCase().includes(query) ||
            task.doctorName?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Priority filter
        if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
          return false;
        }

        // Category filter
        if (filters.categories.length > 0 && !filters.categories.includes(task.category)) {
          return false;
        }

        return true;
      }),
    }));
  }, [boardState.columns, filters]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newColumns = [...boardState.columns];
    const sourceColumn = newColumns.find((col) => col.id === source.droppableId);
    const destColumn = newColumns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const [movedTask] = sourceColumn.tasks.splice(source.index, 1);
    destColumn.tasks.splice(destination.index, 0, movedTask);

    setBoardState({ columns: newColumns });

    if (source.droppableId !== destination.droppableId) {
      toast.success(`Task moved to ${destColumn.title}`);
    }
  };

  const handleAddTask = (taskData) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    setBoardState((prev) => ({
      columns: prev.columns.map((col) =>
        col.id === 'todo' ? { ...col, tasks: [newTask, ...col.tasks] } : col
      ),
    }));

    toast.success('Task added successfully');
  };

  const handleAddColumn = (title) => {
    const newColumn = {
      id: `column-${Date.now()}`,
      title,
      tasks: [],
    };

    setBoardState((prev) => ({
      columns: [...prev.columns, newColumn],
    }));

    toast.success('Column added successfully');
  };

  const handleDeleteTask = (taskId) => {
    setBoardState((prev) => ({
      columns: prev.columns.map((col) => ({
        ...col,
        tasks: col.tasks.filter((task) => task.id !== taskId),
      })),
    }));

    toast.success('Task deleted');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <FilterSheet filters={filters} onFiltersChange={setFilters} />
        <AddTaskSheet onAddTask={handleAddTask} />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {filteredColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onDeleteTask={handleDeleteTask}
            />
          ))}
          <AddColumnSheet onAddColumn={handleAddColumn} />
        </div>
      </DragDropContext>
    </div>
  );
};
