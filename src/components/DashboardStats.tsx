'use client';

import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

interface DashboardStatsProps {
  stats: Stats;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'bg-green-50 text-green-700 border-green-200'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-700 border-red-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`flex items-center gap-4 rounded-lg border p-4 ${card.color}`}
        >
          <card.icon className="h-8 w-8 opacity-80" />
          <div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm font-medium opacity-80">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
