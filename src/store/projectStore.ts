import { create } from 'zustand';
import { projectService } from '@/services/projectService';

interface Project {
  _id: string;
  name: string;
  description?: string;
  members: Array<{ _id: string; name: string; email: string }>;
  createdBy: { _id: string; name: string; email: string };
  createdAt: string;
}

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: { name: string; description?: string; members?: string[] }) => Promise<void>;
  updateProject: (
    id: string,
    data: Partial<{ name: string; description: string; members: string[] }>
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const response = await projectService.getProjects();
      set({ projects: response.data.projects, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createProject: async (data) => {
    const response = await projectService.createProject(data);
    set({ projects: [response.data.project, ...get().projects] });
  },

  updateProject: async (id, data) => {
    const response = await projectService.updateProject(id, data);
    set({
      projects: get().projects.map((p) => (p._id === id ? response.data.project : p)),
      selectedProject: get().selectedProject?._id === id ? response.data.project : get().selectedProject
    });
  },

  deleteProject: async (id) => {
    await projectService.deleteProject(id);
    set({
      projects: get().projects.filter((p) => p._id !== id),
      selectedProject: get().selectedProject?._id === id ? null : get().selectedProject
    });
  },

  setSelectedProject: (project) => set({ selectedProject: project })
}));
