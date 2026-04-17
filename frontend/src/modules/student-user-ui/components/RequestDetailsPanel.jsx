import React from 'react';
import { Clock3, Loader2, MapPin, Tag, UserCircle2, Wrench } from 'lucide-react';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import StatusBadge from './StatusBadge';
import SurfaceCard from './SurfaceCard';

const timelineSteps = ['PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];

const statusStepIndex = (status) => {
  if (status === 'REJECTED') return 0;
  return Math.max(timelineSteps.indexOf(status), 0);
};

const formatDate = (value) => {
  if (!value) return 'Just now';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const getUpdates = (request) => {
  if (Array.isArray(request?.comments) && request.comments.length > 0) return request.comments;
  if (Array.isArray(request?.updates) && request.updates.length > 0) return request.updates;
  return [];
};

const RequestDetailsPanel = ({ request, isLoading }) => {
  if (isLoading) {
    return (
      <SurfaceCard className="p-6 sm:p-7">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading request details...</span>
        </div>
      </SurfaceCard>
    );
  }

  if (!request) {
    return (
      <SurfaceCard className="p-6 sm:p-7">
        <EmptyState
          icon={<Wrench size={20} />}
          title="Request details will appear here"
          description="Select a ticket from the list to review its description, assignment, and progress timeline."
        />
      </SurfaceCard>
    );
  }

  const activeIndex = statusStepIndex(request.status);
  const updates = getUpdates(request);

  return (
    <SurfaceCard className="p-6 sm:p-7">
      <SectionHeader
        eyebrow="Ticket Details"
        icon={<Wrench size={14} />}
        title={request.title}
        description="Review the latest status, assignment, and timeline for this ticket."
        actions={<StatusBadge status={request.status} />}
      />

      <p className="mt-6 text-sm leading-7 text-slate-600">{request.description}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <MapPin size={14} />
            <span>Location</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">{request.location}</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            <Tag size={14} />
            <span>Category</span>
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">{request.category}</p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Priority</p>
          <p className="mt-3 text-sm font-semibold text-slate-800">{request.priority}</p>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400">Created</p>
          <p className="mt-3 text-sm font-semibold text-slate-800">{formatDate(request.createdAt)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          <Clock3 size={18} />
          <h4 className="text-lg font-bold">Status tracker</h4>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {timelineSteps.map((step, index) => {
            const isComplete = request.status === 'REJECTED' ? index === 0 : index <= activeIndex;

            return (
              <div
                key={step}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  isComplete
                    ? 'border-blue-200 bg-white text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}
              >
                {step === 'IN_PROGRESS' ? 'In Progress' : step.charAt(0) + step.slice(1).toLowerCase()}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-700">
            <UserCircle2 size={18} />
            <p className="text-sm font-semibold">Assigned technician</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {request.assignedTechnicianName || 'Not assigned yet'}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-slate-700">
            <Wrench size={18} />
            <p className="text-sm font-semibold">Latest activity</p>
          </div>
          <p className="mt-3 text-sm text-slate-600">{formatDate(request.updatedAt || request.createdAt)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-[26px] border border-slate-200 bg-white p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          <Clock3 size={18} />
          <h4 className="text-lg font-bold">Comments and updates</h4>
        </div>

        {updates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Updates from technicians or administrators will appear here when available.
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((update, index) => (
              <div key={update.id || `${index}-${update.createdAt || update.updatedAt || 'update'}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {update.author?.name || update.authorName || update.createdBy?.name || 'Facilities team'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {update.message || update.comment || update.text || 'Update added.'}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {formatDate(update.createdAt || update.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
};

export default RequestDetailsPanel;
