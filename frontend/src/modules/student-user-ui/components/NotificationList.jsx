import React from 'react';
import { Bell, CheckCircle2, ClipboardCheck, Loader2, UserRoundCog } from 'lucide-react';
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

const notificationIcon = (type) => {
  const key = String(type || '').toUpperCase();
  if (key.includes('APPROV')) return <ClipboardCheck size={16} />;
  if (key.includes('ASSIGN')) return <UserRoundCog size={16} />;
  if (key.includes('COMPLETE')) return <CheckCircle2 size={16} />;
  return <Bell size={16} />;
};

const NotificationList = ({ notifications, isLoading }) => {
  return (
    <SurfaceCard className="p-5 sm:p-6" tone="muted">
      <SectionHeader
        eyebrow="Updates"
        icon={<Bell size={14} />}
        title="Notifications"
        description="Recent approvals, assignments, and completion updates."
      />

      {isLoading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            compact
            icon={<Bell size={20} />}
            title="No notifications yet"
            description="Updates from the facilities team will appear here as your tickets move forward."
          />
        </div>
      ) : (
        <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      {notificationIcon(notification.type)}
                    </span>
                    <p className="font-semibold text-slate-800">{notification.message}</p>
                  </div>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">{notification.type || 'Update'}</p>
                </div>
                {notification.relatedStatus && <StatusBadge status={notification.relatedStatus} />}
              </div>
              <p className="mt-3 text-xs text-slate-400">{formatDate(notification.createdAt || notification.updatedAt)}</p>
            </article>
          ))}
        </div>
      )}
    </SurfaceCard>
  );
};

export default NotificationList;
