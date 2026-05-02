import { create } from 'zustand';
import { taskService } from '@/services/taskService';

interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo?: { _id: string; name: string; email: string };
  projectId: { _id: string; name: string };
  createdAt: string;
}

type CreateTaskPayload = {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'completed';
  assignedTo?: string;
  projectId: string;
};

type UpdateTaskPayload = Partial<{
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo: string;
}>;

interface TaskFilters {
  projectId?: string;
  status?: string;
  assignedTo?: string;
}

interface TaskState {
  tasks: Task[];
  filters: TaskFilters;
  loading: boolean;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (data: CreateTaskPayload) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskPayload) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: TaskFilters) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filters: {},
  loading: false,

  fetchTasks: async (filters = {}) => {
    set({ loading: true });
    try {
      const response = await taskService.getTasks(filters);
      set({ tasks: response.data.tasks, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createTask: async (data) => {
    const response = await taskService.createTask(data);
    set({ tasks: [response.data.task, ...get().tasks] });
  },

  updateTask: async (id, data) => {
    const response = await taskService.updateTask(id, data);
    set({
      tasks: get().tasks.map((t) => (t._id === id ? response.data.task : t))
    });
  },

  deleteTask: async (id) => {
    await taskService.deleteTask(id);
    set({ tasks: get().tasks.filter((t) => t._id !== id) });
  },

  setFilters: (filters) => set({ filters })
}));
