import React from 'react';

const statusStyles = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  OPEN: 'border-amber-200 bg-amber-50 text-amber-700',
  PENDING_REVIEW: 'border-amber-200 bg-amber-50 text-amber-700',
  APPROVED: 'border-sky-200 bg-sky-50 text-sky-700',
  IN_PROGRESS: 'border-orange-200 bg-orange-50 text-orange-700',
  COMPLETED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  BLOCKED: 'border-red-200 bg-red-50 text-red-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-700',
};

const statusLabels = {
  PENDING: 'Pending',
  OPEN: 'Pending',
  PENDING_REVIEW: 'Pending Review',
  APPROVED: 'Approved',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  BLOCKED: 'Blocked',
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
