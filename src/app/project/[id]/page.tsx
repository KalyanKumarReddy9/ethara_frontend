'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { projectService } from '@/services/projectService';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { ArrowLeft, ClipboardList, MessageSquare, Users } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  members: Array<{ _id: string; name: string; email: string }>;
  createdBy: { _id: string; name: string };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignableUsers, setAssignableUsers] = useState<Array<{ _id: string; name: string; email: string }>>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [savingMembers, setSavingMembers] = useState(false);
  const projectId = params.id as string;
  const isAdmin = user?.role === 'admin';

  const loadProject = async () => {
    try {
      const res = await projectService.getProjectById(projectId);
      setProject(res.data.project);
      const ids = (res.data.project.members || []).map((m: { _id: string }) => String(m._id));
      setSelectedMemberIds(ids);
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId, router]);

  useEffect(() => {
    if (!isAdmin || !project) return;
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
  }, [isAdmin, project]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) return null;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="flex items-center gap-1 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          {project.description && <p className="mt-2 text-slate-600">{project.description}</p>}
          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{project.members.length} members</span>
            </div>
            <span>Created by {project.createdBy.name}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Team members</h2>
            <p className="mb-3 text-sm text-slate-500">
              Select who can access this project and appear in task assignment.
            </p>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3 text-sm">
              {assignableUsers.length === 0 ? (
                <p className="text-slate-500">No member accounts available.</p>
              ) : (
                assignableUsers.map((u) => (
                  <label key={u._id} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(u._id)}
                      onChange={() =>
                        setSelectedMemberIds((prev) =>
                          prev.includes(u._id) ? prev.filter((x) => x !== u._id) : [...prev, u._id]
                        )
                      }
                      className="rounded border-slate-300"
                    />
                    <span>
                      {u.name} <span className="text-slate-400">({u.email})</span>
                    </span>
                  </label>
                ))
              )}
            </div>
            <button
              type="button"
              disabled={savingMembers}
              onClick={async () => {
                setSavingMembers(true);
                try {
                  const res = await projectService.updateProject(projectId, { members: selectedMemberIds });
                  setProject(res.data.project);
                  const ids = (res.data.project.members || []).map((m: { _id: string }) => String(m._id));
                  setSelectedMemberIds(ids);
                  await fetchProjects();
                } catch {
                  alert('Could not update team');
                } finally {
                  setSavingMembers(false);
                }
              }}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {savingMembers ? 'Saving…' : 'Save team'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href={`/project/${projectId}/tasks`}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
              <ClipboardList className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
              <p className="text-sm text-slate-500">Manage project tasks</p>
            </div>
          </Link>

          <Link
            href={`/project/${projectId}/chat`}
            className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Chat</h3>
              <p className="text-sm text-slate-500">Project discussions</p>
            </div>
          </Link>
        </div>
      </div>
    </ProtectedRoute>
  );
}
