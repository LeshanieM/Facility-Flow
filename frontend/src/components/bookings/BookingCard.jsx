import React from 'react';
import { Calendar, Clock, MapPin, Users, AlertCircle, Trash2, X } from 'lucide-react';
import BookingStatusBadge from './BookingStatusBadge';

const BookingCard = ({ booking, onCancel, onViewDetail }) => {
  const { resourceName, resourceType, resourceLocation, date, startTime, endTime, purpose, status, rejectionReason, expectedAttendees } = booking;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const resourceTypeColors = {
    LAB: 'bg-violet-100 text-violet-700',
    ROOM: 'bg-sky-100 text-sky-700',
    EQUIPMENT: 'bg-orange-100 text-orange-700',
  };
  const typeColor = resourceTypeColors[resourceType] || 'bg-slate-100 text-slate-600';

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={() => onViewDetail && onViewDetail(booking)}
    >
      {/* Top color bar based on status */}
      <div className={`h-1 w-full ${
        status === 'APPROVED' ? 'bg-emerald-400' :
        status === 'REJECTED' ? 'bg-rose-400' :
        status === 'CANCELLED' ? 'bg-slate-300' :
        'bg-amber-400'
      }`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-base font-bold text-slate-800 truncate">{resourceName}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${typeColor}`}>
                {resourceType}
              </span>
            </div>
            {resourceLocation && (
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <MapPin size={11} />
                <span className="truncate">{resourceLocation}</span>
              </div>
            )}
          </div>
          <BookingStatusBadge status={status} size="sm" />
        </div>

        {/* Date/Time info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-primary" />
            </div>
            <span className="text-xs font-medium">{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
              <Clock size={14} className="text-primary" />
            </div>
            <span className="text-xs font-medium">{startTime} – {endTime}</span>
          </div>
        </div>

        {/* Purpose */}
        {purpose && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 bg-slate-50 rounded-lg p-2">{purpose}</p>
        )}

        {/* Attendees */}
        {expectedAttendees != null && resourceType !== 'EQUIPMENT' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <Users size={12} className="text-slate-400" />
            <span>{expectedAttendees} attendees expected</span>
          </div>
        )}

        {/* Rejection Reason */}
        {status === 'REJECTED' && rejectionReason && (
          <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-xl p-3 mb-3">
            <AlertCircle size={14} className="text-rose-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-0.5">Rejection Reason</p>
              <p className="text-xs text-rose-700">{rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Cancel action */}
        {status === 'APPROVED' && onCancel && (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(booking); }}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 rounded-xl transition-all duration-200"
          >
            <X size={15} />
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
