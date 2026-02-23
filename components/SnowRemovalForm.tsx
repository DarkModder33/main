'use client';

import emailjs from '@emailjs/browser';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

type PreferredContact = 'phone' | 'email' | 'text';

type SnowRemovalLeadForm = {
  name: string;
  phone: string;
  email: string;
  preferredContact: PreferredContact;
  sqFt: string;
  address: string;
  notes: string;
  photos: FileList;
};

type StatusState = {
  type: 'success' | 'error';
  message: string;
} | null;

export default function SnowRemovalForm() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [status, setStatus] = useState<StatusState>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SnowRemovalLeadForm>({
    defaultValues: {
      preferredContact: 'phone',
      phone: '',
      email: '',
      sqFt: '',
      address: '',
      notes: '',
      name: '',
    },
  });

  const onSubmit = async (values: SnowRemovalLeadForm) => {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setStatus({
        type: 'error',
        message:
          'Form is not configured yet. Please add EmailJS environment variables and redeploy.',
      });
      return;
    }

    if (!values.phone?.trim() && !values.email?.trim()) {
      setStatus({
        type: 'error',
        message: 'Please include at least a phone number or an email address.',
      });
      return;
    }

    if (!formRef.current) {
      setStatus({
        type: 'error',
        message: 'Unable to send right now. Please refresh and try again.',
      });
      return;
    }

    try {
      await emailjs.sendForm(serviceId, templateId, formRef.current, { publicKey });
      setStatus({
        type: 'success',
        message: 'Request sent! We\'ll contact you shortly.',
      });
      reset({
        preferredContact: 'phone',
        phone: '',
        email: '',
        sqFt: '',
        address: '',
        notes: '',
        name: '',
      });
    } catch {
      setStatus({
        type: 'error',
        message:
          'Error sending request. Please try again or call (856) 320-8570 directly.',
      });
    }
  };

  return (
    <section className="rounded-3xl border border-white/15 bg-slate-900/70 p-5 shadow-2xl backdrop-blur-xl md:p-8">
      <h2 className="text-2xl font-black uppercase italic tracking-tight text-white md:text-3xl">
        Request Snow Removal
      </h2>
      <p className="mt-2 text-sm text-slate-200">
        Share your details below. Upload a photo of the area and/or provide a square footage estimate for faster quoting.
      </p>

      <form
        id="snow-removal-form"
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid gap-4 md:grid-cols-2"
        encType="multipart/form-data"
      >
        <div className="md:col-span-2">
          <label htmlFor="name" className="mb-1 block text-sm font-semibold text-sky-100">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
            placeholder="Your full name"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-sky-100">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone')}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
            placeholder="(856) 320-8570"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-sky-100">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="preferredContact" className="mb-1 block text-sm font-semibold text-sky-100">
            Preferred Contact
          </label>
          <select
            id="preferredContact"
            {...register('preferredContact')}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
          >
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="text">Text</option>
          </select>
        </div>

        <div>
          <label htmlFor="sqFt" className="mb-1 block text-sm font-semibold text-sky-100">
            Square Footage Estimate
          </label>
          <input
            id="sqFt"
            type="text"
            {...register('sqFt')}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
            placeholder="e.g., 500 sq ft driveway"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="mb-1 block text-sm font-semibold text-sky-100">
            Service Address
          </label>
          <input
            id="address"
            type="text"
            {...register('address')}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
            placeholder="Street, City"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="photos" className="mb-1 block text-sm font-semibold text-sky-100">
            Upload Photo of Area (optional)
          </label>
          <input
            id="photos"
            type="file"
            accept="image/*"
            {...register('photos')}
            className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-500/70 bg-slate-950/40 px-3 py-3 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-500/20 file:px-3 file:py-2 file:font-semibold file:text-sky-100 hover:file:bg-sky-500/30"
          />
          <p className="mt-1 text-xs text-slate-300">
            In EmailJS template settings, configure a dynamic Form File Attachment with parameter name: <span className="font-semibold text-sky-200">photos</span>
          </p>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="mb-1 block text-sm font-semibold text-sky-100">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={4}
            {...register('notes')}
            className="w-full rounded-xl border border-slate-600/70 bg-slate-950/70 px-3 py-2 text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40"
            placeholder="Gate code, timing requests, details about driveway/walkway, etc."
          />
        </div>

        <div className="md:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-500"
          >
            {isSubmitting ? 'Sending...' : 'Submit Request'}
          </button>

          <a
            href="tel:+18563208570"
            className="inline-flex items-center justify-center rounded-xl border border-sky-300/40 bg-sky-500/10 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/20"
          >
            Call (856) 320-8570
          </a>
        </div>

        {status && (
          <p
            className={`md:col-span-2 rounded-xl border px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100'
                : 'border-rose-400/40 bg-rose-500/15 text-rose-100'
            }`}
          >
            {status.message}
          </p>
        )}
      </form>
    </section>
  );
}
