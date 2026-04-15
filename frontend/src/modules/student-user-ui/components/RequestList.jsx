import React from 'react';
import { ClipboardList, Loader2, MapPin } from 'lucide-react';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import StatusBadge from './StatusBadge';
import SurfaceCard from './SurfaceCard';

const formatDate = (value) => {
  if (!value) return 'Just now';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const RequestList = ({ requests, selectedRequestId, onSelect, isLoading }) => {
  return (
    <SurfaceCard className="p-6 sm:p-7">
      <SectionHeader
        eyebrow="Your Tickets"
        icon={<ClipboardList size={14} />}
        title="Submitted requests"
        description="Choose a ticket to review its full details, current status, and technician updates."
      />

      {isLoading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading your requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            compact
            icon={<ClipboardList size={20} />}
            title="No tickets submitted yet"
            description="Start by submitting your first request and it will appear here for tracking."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {requests.map((request) => {
            const isActive = selectedRequestId === request.id;

            return (
              <button
                key={request.id}
                type="button"
                onClick={() => onSelect(request.id)}
                className={`group w-full rounded-[26px] border p-5 text-left transition duration-200 ${
                  isActive
                    ? 'border-blue-200 bg-blue-50/70 shadow-[0_12px_28px_rgba(59,130,246,0.08)]'
                    : 'border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.05)]'
                }`}
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="text-lg font-bold text-slate-900">{request.title}</h4>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600">
                        {request.category}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 font-medium text-slate-600">
                        {request.priority}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium text-slate-600">
                        <MapPin size={14} />
                        {request.location}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{request.description}</p>
                  </div>
                  <div className="shrink-0 text-sm text-slate-400 transition group-hover:text-slate-500">
                    Updated {formatDate(request.updatedAt || request.createdAt)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </SurfaceCard>
  );
};

export default RequestList;
