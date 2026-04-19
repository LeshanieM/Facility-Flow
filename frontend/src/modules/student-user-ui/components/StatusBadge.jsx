import React from 'react';

const statusStyles = {
  SUBMITTED: 'border-slate-200 bg-slate-50 text-slate-700',
  UNDER_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700',
  ASSIGNED: 'border-sky-200 bg-sky-50 text-sky-700',
  IN_PROGRESS: 'border-orange-200 bg-orange-50 text-orange-700',
  ON_HOLD: 'border-purple-200 bg-purple-50 text-purple-700',
  RESOLVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  CLOSED: 'border-slate-300 bg-slate-100 text-slate-500',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
};

const statusLabels = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REJECTED: 'Rejected',
};

const StatusBadge = ({ status }) => {
  const key = status || 'PENDING';

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        statusStyles[key] || 'border-slate-200 bg-slate-100 text-slate-700'
      }`}
    >
      {statusLabels[key] || key}
    </span>
  );
};

export default StatusBadge;
