import React from 'react';
import { Clock, Wrench, CheckCircle, ShieldCheck, AlertCircle } from 'lucide-react';

const statusConfigs = {
  OPEN: {
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <Clock size={12} />,
    label: 'Open',
  },
  IN_PROGRESS: {
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: <Wrench size={12} />,
    label: 'In Progress',
  },
  RESOLVED: {
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: <CheckCircle size={12} />,
    label: 'Resolved',
  },
  CLOSED: {
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: <ShieldCheck size={12} />,
    label: 'Closed',
  },
  REJECTED: {
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: <AlertCircle size={12} />,
    label: 'Rejected',
  },
};

const StatusBadge = ({ status }) => {
  const config = statusConfigs[status] || {
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: null,
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
