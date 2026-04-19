import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { resourceService } from '../../services/resourceService';
import { bookingService } from '../../services/bookingService';
import {
  Calendar, Clock, MapPin, Users, FileText, Layers,
  CheckCircle2, AlertCircle, Loader2, PlusCircle, ChevronRight
} from 'lucide-react';

// ── Toast component ──────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-fade-in max-w-sm
      ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
      {type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
      {message}
    </div>
  );
};

// ── Loading skeleton ─────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
);

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, children, required }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-rose-500">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];

const validate = (form, resources) => {
  const errors = {};
  if (!form.resourceId) errors.resourceId = 'Please select a resource.';
  if (!form.date) errors.date = 'Please pick a date.';
  else if (form.date < today()) errors.date = 'Date cannot be in the past.';
  if (!form.startTime) errors.startTime = 'Start time is required.';
  if (!form.endTime) errors.endTime = 'End time is required.';
  else if (form.startTime && form.endTime && form.endTime <= form.startTime)
    errors.endTime = 'End time must be after start time.';
  if (!form.purpose.trim()) errors.purpose = 'Purpose is required.';

  const selected = resources.find((r) => r.id === form.resourceId);
  if (selected && selected.type !== 'EQUIPMENT' && form.expectedAttendees !== '' && Number(form.expectedAttendees) < 1)
    errors.expectedAttendees = 'Attendees must be at least 1.';

  return errors;
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const CreateBookingPage = () => {
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');

  const [form, setForm] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  });

  useEffect(() => {
    resourceService.getAllResources()
      .then(setResources)
      .catch(() => setToast({ message: 'Failed to load resources.', type: 'error' }))
      .finally(() => setLoadingResources(false));
  }, []);

  const selectedResource = resources.find((r) => r.id === form.resourceId);
  const isEquipment = selectedResource?.type === 'EQUIPMENT';

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setConflictError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(form, resources);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setConflictError('');

    const payload = {
      resourceId: form.resourceId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose.trim(),
      ...((!isEquipment && form.expectedAttendees !== '') && { expectedAttendees: Number(form.expectedAttendees) }),
    };

    try {
      await bookingService.createBooking(payload);
      setToast({ message: 'Booking created successfully!', type: 'success' });
      setTimeout(() => navigate('/bookings/my'), 1500);
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError('This resource is already booked for the selected time slot. Please choose a different time.');
      } else {
        setToast({ message: err.response?.data?.message || 'Failed to create booking.', type: 'error' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resourceTypeColors = {
    LAB: 'text-violet-600 bg-violet-50',
    ROOM: 'text-sky-600 bg-sky-50',
    EQUIPMENT: 'text-orange-600 bg-orange-50',
  };

  return (
    <Layout>
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <span className="hover:text-primary cursor-pointer" onClick={() => navigate('/bookings/my')}>My Bookings</span>
            <ChevronRight size={14} />
            <span className="text-slate-600 font-medium">New Booking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
            Create a Booking
          </h1>
          <p className="text-slate-500">Reserve a campus resource for your needs.</p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Section: Resource */}
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layers size={14} /> Select Resource
              </h2>

              {loadingResources ? (
                <div className="space-y-2">
                  <SkeletonRow /><SkeletonRow />
                </div>
              ) : (
                <Field label="Resource" error={errors.resourceId} required>
                  <div className="relative">
                    <select
                      value={form.resourceId}
                      onChange={(e) => handleChange('resourceId', e.target.value)}
                      className={`w-full text-sm px-4 py-3 pr-10 rounded-xl border bg-white outline-none transition-all appearance-none
                        focus:ring-4 focus:ring-primary/10 focus:border-primary/40
                        ${errors.resourceId ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                    >
                      <option value="">— Choose a resource —</option>
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.type}) · {r.location}
                        </option>
                      ))}
                    </select>
                    <Layers size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>

                  {/* Selected resource details pill */}
                  {selectedResource && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${resourceTypeColors[selectedResource.type] || 'bg-slate-100 text-slate-600'}`}>
                        {selectedResource.type}
                      </span>
                      {selectedResource.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin size={11} /> {selectedResource.location}
                        </span>
                      )}
                    </div>
                  )}
                </Field>
              )}
            </div>

            {/* Section: Date & Time */}
            <div className="p-6 border-b border-slate-50">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar size={14} /> Date & Time
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Date" error={errors.date} required>
                  <div className="relative">
                    <input
                      type="date"
                      min={today()}
                      value={form.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className={`w-full text-sm px-4 py-3 rounded-xl border bg-white outline-none transition-all
                        focus:ring-4 focus:ring-primary/10 focus:border-primary/40
                        ${errors.date ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                    />
                  </div>
                </Field>

                <Field label="Start Time" error={errors.startTime} required>
                  <div className="relative">
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      className={`w-full text-sm px-4 py-3 rounded-xl border bg-white outline-none transition-all
                        focus:ring-4 focus:ring-primary/10 focus:border-primary/40
                        ${errors.startTime ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                    />
                  </div>
                </Field>

                <Field label="End Time" error={errors.endTime} required>
                  <div className="relative">
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      min={form.startTime || undefined}
                      className={`w-full text-sm px-4 py-3 rounded-xl border bg-white outline-none transition-all
                        focus:ring-4 focus:ring-primary/10 focus:border-primary/40
                        ${errors.endTime ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                    />
                  </div>
                </Field>
              </div>

              {/* Time conflict error */}
              {conflictError && (
                <div className="mt-4 flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl p-4">
                  <AlertCircle size={16} className="text-rose-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-rose-700 font-medium">{conflictError}</p>
                </div>
              )}
            </div>

            {/* Section: Details */}
            <div className="p-6">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FileText size={14} /> Booking Details
              </h2>
              <div className="space-y-4">
                <Field label="Purpose" error={errors.purpose} required>
                  <textarea
                    value={form.purpose}
                    onChange={(e) => handleChange('purpose', e.target.value)}
                    placeholder="Briefly describe the purpose of this booking..."
                    rows={3}
                    className={`w-full text-sm px-4 py-3 rounded-xl border bg-white resize-none outline-none transition-all
                      focus:ring-4 focus:ring-primary/10 focus:border-primary/40
                      ${errors.purpose ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                  />
                </Field>

                {/* expectedAttendees — hidden for EQUIPMENT type */}
                {!isEquipment && (
                  <Field label="Expected Attendees" error={errors.expectedAttendees}>
                    <div className="relative">
                      <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="number"
                        min="1"
                        value={form.expectedAttendees}
                        onChange={(e) => handleChange('expectedAttendees', e.target.value)}
                        placeholder="Optional"
                        className={`w-full text-sm pl-10 pr-4 py-3 rounded-xl border bg-white outline-none transition-all
                          focus:ring-4 focus:ring-primary/10 focus:border-primary/40
                          ${errors.expectedAttendees ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}
                      />
                    </div>
                  </Field>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate('/bookings/my')}
              className="px-6 py-3 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingResources}
              className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
              {submitting ? 'Submitting…' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateBookingPage;
