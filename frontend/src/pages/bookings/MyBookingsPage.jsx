import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import BookingCard from '../../components/bookings/BookingCard';
import BookingTable from '../../components/bookings/BookingTable';
import BookingDetailModal from '../../components/bookings/BookingDetailModal';
import CancelConfirmModal from '../../components/bookings/CancelConfirmModal';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import { bookingService } from '../../services/bookingService';
import {
  Calendar, PlusCircle, CheckCircle2, AlertCircle,
  Loader2, LayoutGrid, LayoutList, RefreshCw, Inbox
} from 'lucide-react';

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-fade-in max-w-sm
      ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
      {type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
      {message}
    </div>
  );
};

// ── Skeleton cards ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse space-y-3">
    <div className="flex justify-between">
      <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
      <div className="h-5 bg-slate-100 rounded-full w-20" />
    </div>
    <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
    <div className="grid grid-cols-2 gap-3">
      <div className="h-8 bg-slate-50 rounded-lg" />
      <div className="h-8 bg-slate-50 rounded-lg" />
    </div>
    <div className="h-10 bg-slate-50 rounded-xl" />
  </div>
);

// ── Stats pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ label, count, color }) => (
  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${color}`}>
    <span>{count}</span>
    <span className="font-normal opacity-70">{label}</span>
  </div>
);

const STATUS_FILTER_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const MyBookingsPage = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [toast, setToast] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setToast({ message: 'Failed to load bookings.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleCancelConfirm = async (id) => {
    setCancelLoading(true);
    try {
      await bookingService.cancelBooking(id);
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, status: 'CANCELLED' } : b)
      );
      setToast({ message: 'Booking cancelled successfully.', type: 'success' });
      setCancelTarget(null);
    } catch {
      setToast({ message: 'Failed to cancel booking.', type: 'error' });
    } finally {
      setCancelLoading(false);
    }
  };

  // Stats
  const stats = {
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    APPROVED: bookings.filter((b) => b.status === 'APPROVED').length,
    REJECTED: bookings.filter((b) => b.status === 'REJECTED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  const filtered = statusFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

  return (
    <Layout>
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

      {detailTarget && (
        <BookingDetailModal booking={detailTarget} onClose={() => setDetailTarget(null)} />
      )}
      {cancelTarget && (
        <CancelConfirmModal
          booking={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
          isLoading={cancelLoading}
        />
      )}

      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
            <p className="text-slate-500 mt-1 text-sm">Track and manage all your resource reservations.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="p-2.5 text-slate-500 hover:text-primary hover:bg-primary/5 border border-slate-200 rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => navigate('/bookings/new')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              <PlusCircle size={16} />
              New Booking
            </button>
          </div>
        </div>

        {/* Stats row */}
        {!loading && bookings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <StatPill label="Pending" count={stats.PENDING} color="bg-amber-50 text-amber-700 border-amber-200" />
            <StatPill label="Approved" count={stats.APPROVED} color="bg-emerald-50 text-emerald-700 border-emerald-200" />
            <StatPill label="Rejected" count={stats.REJECTED} color="bg-rose-50 text-rose-700 border-rose-200" />
            <StatPill label="Cancelled" count={stats.CANCELLED} color="bg-slate-100 text-slate-500 border-slate-200" />
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
            {STATUS_FILTER_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  statusFilter === s
                    ? 'bg-white shadow-sm text-primary'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s === 'ALL' ? `All (${bookings.length})` : s}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutList size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : bookings.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
              <Inbox size={36} className="text-primary/40" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No bookings yet</h3>
            <p className="text-slate-400 text-sm mb-6">Reserve a campus resource to get started.</p>
            <button
              onClick={() => navigate('/bookings/new')}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-lg shadow-primary/20 transition-all"
            >
              <PlusCircle size={16} />
              Create Your First Booking
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Calendar size={32} className="text-slate-300 mb-3" />
            <p className="text-slate-400 text-sm">No bookings with status <strong>{statusFilter}</strong>.</p>
            <button onClick={() => setStatusFilter('ALL')} className="mt-3 text-xs text-primary hover:underline">Clear filter</button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={setCancelTarget}
                onViewDetail={setDetailTarget}
              />
            ))}
          </div>
        ) : (
          <BookingTable
            bookings={filtered}
            isAdmin={false}
            onCancel={setCancelTarget}
            onViewDetail={setDetailTarget}
          />
        )}
      </div>
    </Layout>
  );
};

export default MyBookingsPage;
