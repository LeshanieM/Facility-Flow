import React from 'react';
import { AlertCircle, FileText, Loader2, Paperclip, Send, Sparkles } from 'lucide-react';
import FieldControl, { fieldInputClass } from './FieldControl';
import SectionHeader from './SectionHeader';
import SurfaceCard from './SurfaceCard';

const categoryOptions = [
  'Electrical',
  'Plumbing',
  'HVAC',
  'Furniture',
  'Cleaning',
  'Safety',
  'Network',
  'Other',
];

const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

const RequestForm = ({ values, errors, onChange, onSubmit, isSubmitting, submitMessage, submitError }) => {
  return (
    <SurfaceCard className="p-6 sm:p-8">
      <SectionHeader
        eyebrow="Submit Request"
        icon={<Sparkles size={14} />}
        title="Create a new incident or maintenance ticket"
        description="Use clear details so the facilities team can understand the issue quickly and respond with less back-and-forth."
      />

      <form className="mt-8 space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FieldControl label="Title" required error={errors.title}>
            <input
              value={values.title}
              onChange={(event) => onChange('title', event.target.value)}
              className={fieldInputClass(Boolean(errors.title))}
              placeholder="Water leak near Library staircase"
              maxLength={120}
            />
          </FieldControl>

          <FieldControl label="Location" required error={errors.location}>
            <input
              value={values.location}
              onChange={(event) => onChange('location', event.target.value)}
              className={fieldInputClass(Boolean(errors.location))}
              placeholder="Science Block, Floor 2, Room 211"
              maxLength={140}
            />
          </FieldControl>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <FieldControl label="Category" required error={errors.category}>
            <select
              value={values.category}
              onChange={(event) => onChange('category', event.target.value)}
              className={fieldInputClass(Boolean(errors.category))}
            >
              <option value="">Select a category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldControl>

          <FieldControl label="Priority" required error={errors.priority}>
            <select
              value={values.priority}
              onChange={(event) => onChange('priority', event.target.value)}
              className={fieldInputClass(Boolean(errors.priority))}
            >
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldControl>
        </div>

        <FieldControl
          label="Description"
          required
          error={errors.description}
          hint="Explain what happened, when you noticed it, and whether it affects safety, access, or teaching."
        >
          <textarea
            value={values.description}
            onChange={(event) => onChange('description', event.target.value)}
            className={`${fieldInputClass(Boolean(errors.description))} min-h-[160px] resize-y`}
            placeholder="Describe the issue, when you noticed it, and whether it affects teaching, safety, or student access."
            maxLength={800}
          />
          <div className="flex items-center justify-end">
            <p className="text-xs text-slate-400">{values.description.length}/800</p>
          </div>
        </FieldControl>

        <FieldControl label="Optional attachment" hint="Attach a photo or document if it helps explain the issue.">
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:border-blue-300 hover:bg-blue-50/40">
            <div className="flex items-center gap-3">
              <Paperclip size={18} />
              <span className="truncate">{values.attachment ? values.attachment.name : 'Add an image or supporting file'}</span>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">Browse</span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(event) => onChange('attachment', event.target.files?.[0] || null)}
            />
          </label>
        </FieldControl>

        {submitMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <FileText className="mt-0.5 shrink-0" size={16} />
            <span>{submitMessage}</span>
          </div>
        )}

        {submitError && (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{submitError}</span>
          </div>
        )}

        <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Required fields are marked with <span className="font-semibold text-rose-500">*</span>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
            {isSubmitting ? 'Submitting request...' : 'Submit request'}
          </button>
        </div>
      </form>
    </SurfaceCard>
  );
};

export default RequestForm;
