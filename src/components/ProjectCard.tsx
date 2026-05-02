'use client';

import Link from 'next/link';
import { Users, FolderOpen } from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  description?: string;
  members: Array<{ _id: string; name: string }>;
  createdBy: { _id: string; name: string };
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project._id}`}>
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
        <div className="mb-3 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
        </div>

        {project.description && (
          <p className="mb-4 text-sm text-slate-600 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{project.members.length} members</span>
          </div>
          <span>By {project.createdBy.name}</span>
        </div>
      </div>
    </Link>
  );
}
