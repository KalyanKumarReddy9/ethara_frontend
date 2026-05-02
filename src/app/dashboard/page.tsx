'use client';

import { useEffect, useRef, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardStats from '@/components/DashboardStats';
import ProjectCard from '@/components/ProjectCard';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Plus, FolderOpen } from 'lucide-react';
import { authService } from '@/services/authService';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { projects, fetchProjects, createProject } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [assignableUsers, setAssignableUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const createLockRef = useRef(false);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  useEffect(() => {
    if (!showModal || user?.role !== 'admin') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authService.getUsers();
        if (!cancelled) setAssignableUsers(res.data.users);
      } catch {
        if (!cancelled) setAssignableUsers([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showModal, user?.role]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status !== 'completed').length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length
  };

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createLockRef.current || creatingProject) return;
    createLockRef.current = true;
    setCreatingProject(true);
    try {
      await createProject({
        name: projectName,
        description: projectDesc,
        members: selectedMemberIds.length ? selectedMemberIds : undefined
      });
      setShowModal(false);
      setProjectName('');
      setProjectDesc('');
      setSelectedMemberIds([]);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err && err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
          ? String((err.response.data as { message?: string }).message)
          : 'Could not create project';
      alert(msg);
    } finally {
      createLockRef.current = false;
      setCreatingProject(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <DashboardStats stats={stats} />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Projects</h2>
            {user?.role === 'admin' && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                New Project
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-12">
              <FolderOpen className="mb-2 h-10 w-10 text-slate-400" />
              <p className="text-sm text-slate-500">No projects yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              {user?.role === 'admin' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Assign team members</label>
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3 text-sm">
                    {assignableUsers.length === 0 ? (
                      <p className="text-slate-500">No member accounts yet. Register users with role &quot;member&quot; first.</p>
                    ) : (
                      assignableUsers.map((u) => (
                        <label key={u._id} className="flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedMemberIds.includes(u._id)}
                            onChange={() => toggleMember(u._id)}
                            className="rounded border-slate-300"
                          />
                          <span>
                            {u.name} <span className="text-slate-400">({u.email})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedMemberIds([]);
                  }}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingProject ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
