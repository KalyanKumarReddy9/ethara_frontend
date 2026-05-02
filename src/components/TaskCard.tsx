'use client';

import { Calendar, User, AlertCircle } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo?: { _id: string; name: string };
}

interface TaskCardProps {
  task: Task;
  onStatusChange?: (id: string, status: 'todo' | 'in-progress' | 'completed') => void;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700'
};

export default function TaskCard({ task, onStatusChange, onDelete, canEdit = false }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
        <div className="flex gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
            {task.status}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="mb-3 text-sm text-slate-600">{task.description}</p>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{task.assignedTo.name}</span>
          </div>
        )}
        {task.dueDate && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
            <Calendar className="h-4 w-4" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            {isOverdue && <AlertCircle className="h-4 w-4" />}
          </div>
        )}
      </div>

      {(onStatusChange || onDelete) && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {onStatusChange && canEdit && (
            <select
              value={task.status}
              onChange={(e) =>
                onStatusChange(
                  task._id,
                  e.target.value as 'todo' | 'in-progress' | 'completed'
                )
              }
              className="rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          )}
          {onDelete && canEdit && (
            <button
              onClick={() => onDelete(task._id)}
              className="ml-auto rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
