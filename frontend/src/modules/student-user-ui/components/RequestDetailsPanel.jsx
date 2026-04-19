import React from 'react';
import { Clock3, Loader2, MapPin, Tag, UserCircle2, Wrench } from 'lucide-react';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import StatusBadge from './StatusBadge';
import SurfaceCard from './SurfaceCard';

const timelineSteps = ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const statusStepIndex = (status) => {
  if (status === 'REJECTED') return 0;
  if (status === 'ON_HOLD') return 3; // roughly at In_Progress
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
  const allComments = (request?.comments || []).filter(c => c.visibleToRequester);
  return allComments;
};

const RequestDetailsPanel = ({ request, isLoading, onCancel, isCancelling }) => {
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
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to cancel this ticket?")) onCancel();
              }}
              disabled={request.status !== 'SUBMITTED' || isCancelling}
              title={request.status !== 'SUBMITTED' ? "Cancellation only allowed when status is SUBMITTED" : "Cancel ticket"}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                request.status !== 'SUBMITTED' 
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400' 
                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              {isCancelling ? <Loader2 size={14} className="animate-spin" /> : null}
              Cancel
            </button>
            <StatusBadge status={request.status} />
          </div>
        }
      />

      <p className="mt-6 text-sm leading-7 text-slate-600">{request.description}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
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

        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">SLA Tracker</p>
          <div className="mt-3 inline-block rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
            {request.slaStatus ? request.slaStatus.replace(/_/g, ' ') : 'NOT TRACKED'}
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Due / Resolved</p>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            <span className="text-slate-500 font-normal">Response:</span> {request.actualFirstResponseAt ? formatDate(request.actualFirstResponseAt) : formatDate(request.slaResponseDeadline)}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-700">
            <span className="text-slate-500 font-normal">Resolution:</span> {request.actualResolutionAt ? formatDate(request.actualResolutionAt) : formatDate(request.slaResolutionDeadline)}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-slate-800">
          <Clock3 size={18} />
          <h4 className="text-lg font-bold">Status tracker</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {timelineSteps.map((step, index) => {
            const isComplete = request.status === 'REJECTED' ? index === 0 : index <= activeIndex;
            const label = step.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            return (
              <div
                key={step}
                className={`rounded-xl border px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider transition ${
                  isComplete
                    ? 'border-blue-200 bg-white text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}
              >
                {label}
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
