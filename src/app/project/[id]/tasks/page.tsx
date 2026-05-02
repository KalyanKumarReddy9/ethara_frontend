'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import TaskCard from '@/components/TaskCard';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { ArrowLeft, Plus, Filter } from 'lucide-react';

export default function TasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuthStore();
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
  }>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: ''
  });

  const isAdmin = user?.role === 'admin';
  const currentProject = projects.find((p) => String(p._id) === String(projectId));

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchTasks({ projectId, status: statusFilter || undefined });
  }, [projectId, statusFilter, fetchTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({
        title: newTask.title,
        description: newTask.description || undefined,
        dueDate: newTask.dueDate || undefined,
        priority: newTask.priority,
        assignedTo: newTask.assignedTo || undefined,
        projectId,
        status: 'todo'
      });
      setShowModal(false);
      setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
      await fetchTasks({ projectId, status: statusFilter || undefined });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'response' in err && err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
          ? String((err.response.data as { message?: string }).message)
          : 'Could not create task';
      alert(msg);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    status: 'todo' | 'in-progress' | 'completed'
  ) => {
    await updateTask(taskId, { status });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href={`/project/${projectId}`} className="flex items-center gap-1 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Project
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {currentProject?.name} - Tasks
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-sm focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            )}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
            <p className="text-slate-500">No tasks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={isAdmin ? handleDeleteTask : undefined}
                canEdit={true}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        priority: e.target.value as 'low' | 'medium' | 'high'
                      })
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Assign To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {currentProject?.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
