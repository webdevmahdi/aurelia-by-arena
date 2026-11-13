import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, CheckCircle2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAppDispatch } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { useCreateContactInquiryMutation } from '@/features/leads/leadsApi';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { useSeo } from '@/hooks/useSeo';
import { buildWhatsAppConciergeUrl } from '@/lib/format';
import type {
  ApiError,
  LeadCreateRequest,
  PreferredContactMethod,
} from '@/types/api';

const contactFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z.string().trim().min(6, 'Please enter a reachable telephone number.'),
  country: z.string().optional(),
  preferredContactMethod: z.enum(['PHONE', 'EMAIL', 'WHATSAPP']).optional(),
  projectId: z.string().optional(),
  budgetRange: z.string().optional(),
  message: z.string().trim().min(5, 'Please share a brief note regarding your inquiry.'),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Consent is required so our Private Sales Office may respond.',
  }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const dispatch = useAppDispatch();
  const { data: projectsData } = useGetProjectsQuery({ limit: 50 });
  const projects = projectsData?.items ?? [];

  const [createContactInquiry, { isLoading }] = useCreateContactInquiryMutation();
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [apiErrorBanner, setApiErrorBanner] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      country: '',
      preferredContactMethod: 'EMAIL',
      projectId: '',
      budgetRange: '$4M – $8M USD',
      message: '',
      consent: false,
    },
  });

  useSeo({
    title: 'Private Sales Galleries & Contact — Aurelia Developments',
    description:
      'Contact Aurelia Developments Private Sales in London, Dubai, Geneva, or New York to arrange a confidential consultation, brochure delivery, or site visit.',
    canonicalPath: '/contact',
  });

  const onSubmit = async (values: ContactFormValues) => {
    setApiErrorBanner(null);
    const payload: LeadCreateRequest = {
      type: 'CONTACT_REQUEST',
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      ...(values.country ? { country: values.country } : {}),
      ...(values.preferredContactMethod
        ? {
            preferredContactMethod:
              values.preferredContactMethod as PreferredContactMethod,
          }
        : {}),
      ...(values.projectId ? { projectId: values.projectId } : {}),
      ...(values.budgetRange ? { budgetRange: values.budgetRange } : {}),
      message: values.message,
      consent: values.consent,
    };

    try {
      const response = await createContactInquiry(payload).unwrap();
      setSubmittedMessage(
        response.message ??
          'Your inquiry has been received by our Private Sales Office. A senior advisor will respond shortly.'
      );
      reset();
    } catch (err) {
      const apiErr =
        err && typeof err === 'object' && 'error' in err
          ? (err as ApiError).error
          : null;
      if (apiErr?.fields) {
        Object.entries(apiErr.fields).forEach(([field, message]) => {
          setError(field as keyof ContactFormValues, { message });
        });
      }
      setApiErrorBanner(
        apiErr?.message ??
          'We were unable to transmit your inquiry. Please try again.'
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="py-16 lg:py-24 border-b border-[var(--border-hairline)] bg-elevated/60">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 space-y-5">
            <p className="text-xs uppercase tracking-[0.24em] text-bronze">
              Private Sales &amp; Advisory
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl text-ink leading-[1.04]">
              Speak With Our Private Sales Galleries
            </h1>
          </div>
          <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
            <button
              type="button"
              onClick={() => dispatch(openConversionModal({ mode: 'SITE_VISIT' }))}
              className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Book Site Visit</span>
            </button>
            <a
              href={buildWhatsAppConciergeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 border border-[var(--border-strong)] bg-canvas text-ink text-xs uppercase tracking-[0.18em] hover:border-ink transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Main Split: Galleries Ledger + Contact Form (`POST /api/v1/contact-inquiries`) */}
      <section className="py-20 lg:py-28">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-12 gap-14 items-start">
          {/* Left: Global Galleries */}
          <div className="lg:col-span-5 space-y-10">
            <div className="space-y-3">
              <h2 className="font-serif text-3xl text-ink">
                International Sales Galleries
              </h2>
              <p className="text-sm text-ink-secondary leading-relaxed">
                Private appointments are available Monday through Saturday, including
                remote architectural walkthroughs for international purchasers.
              </p>
            </div>

            <div className="divide-y divide-[var(--border-hairline)] border-t border-b border-[var(--border-hairline)]">
              {[
                {
                  city: 'London — Mayfair Flagship',
                  address: '14 Carlos Place, Mayfair, London W1K 2AR',
                  phone: '+44 20 7946 0821',
                  hours: 'Mon – Sat · 09:30 – 18:30 GMT',
                },
                {
                  city: 'Dubai — Jumeirah Bay Pavilion',
                  address: 'Peninsula Crescent, Jumeirah Bay Island, Dubai',
                  phone: '+971 4 512 9400',
                  hours: 'Daily · 10:00 – 19:00 GST',
                },
                {
                  city: 'Geneva — Private Client Desk',
                  address: 'Rue du Rhône 42, 1204 Genève, Switzerland',
                  phone: '+41 22 819 0400',
                  hours: 'By Private Appointment',
                },
                {
                  city: 'New York — West Chelsea',
                  address: '529 West 21st Street, New York, NY 10011',
                  phone: '+1 212 555 0194',
                  hours: 'Tue – Sat · 10:00 – 18:00 EST',
                },
              ].map((office) => (
                <div key={office.city} className="py-6 space-y-1.5">
                  <h3 className="font-serif text-2xl text-ink">{office.city}</h3>
                  <p className="text-sm text-ink-secondary">{office.address}</p>
                  <p className="text-xs text-ink font-medium tabular-nums">
                    {office.phone}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-ink-muted">
                    {office.hours}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Authoritative Contact Inquiry Form */}
          <div className="lg:col-span-7 border border-[var(--border-hairline)] bg-elevated p-7 sm:p-12">
            {submittedMessage ? (
              <div className="p-8 border border-[var(--status-available-border)] bg-[var(--status-available-bg)]/50 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--status-available-fg)]">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                  <span>Transmission Confirmed</span>
                </div>
                <h2 className="font-serif text-3xl text-ink">
                  Thank You for Contacting Aurelia
                </h2>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  {submittedMessage}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedMessage(null)}
                  className="px-5 py-2.5 border border-ink text-ink text-xs uppercase tracking-[0.16em] hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="pb-5 border-b border-[var(--border-hairline)]">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-bronze">
                    Direct Advisory Correspondence
                  </span>
                  <h2 className="font-serif text-3xl text-ink mt-1">
                    Private Inquiry Form
                  </h2>
                </div>

                {apiErrorBanner && (
                  <div
                    role="alert"
                    className="p-4 border border-[var(--status-sold-border)] bg-[var(--status-sold-bg)] text-xs text-[var(--status-sold-fg)]"
                  >
                    {apiErrorBanner}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="ct-name"
                      className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="ct-name"
                      type="text"
                      autoComplete="name"
                      {...register('fullName')}
                      className="w-full px-3.5 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-[var(--status-sold-fg)] mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="ct-email"
                      className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="ct-email"
                      type="email"
                      autoComplete="email"
                      {...register('email')}
                      className="w-full px-3.5 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                    />
                    {errors.email && (
                      <p className="text-xs text-[var(--status-sold-fg)] mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="ct-phone"
                      className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                    >
                      Telephone *
                    </label>
                    <input
                      id="ct-phone"
                      type="tel"
                      autoComplete="tel"
                      {...register('phone')}
                      className="w-full px-3.5 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                    />
                    {errors.phone && (
                      <p className="text-xs text-[var(--status-sold-fg)] mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="ct-country"
                      className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                    >
                      Country of Residence
                    </label>
                    <input
                      id="ct-country"
                      type="text"
                      {...register('country')}
                      className="w-full px-3.5 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label
                      htmlFor="ct-method"
                      className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                    >
                      Preferred Channel
                    </label>
                    <select
                      id="ct-method"
                      {...register('preferredContactMethod')}
                      className="w-full px-3 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="PHONE">Telephone</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ct-project"
                      className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                    >
                      Commission
                    </label>
                    <select
                      id="ct-project"
                      {...register('projectId')}
                      className="w-full px-3 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                    >
                      <option value="">General Portfolio</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ct-budget"
                      className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                    >
                      Budget Range
                    </label>
                    <select
                      id="ct-budget"
                      {...register('budgetRange')}
                      className="w-full px-3 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                    >
                      <option value="$3M – $5M USD">$3M – $5M USD</option>
                      <option value="$4M – $8M USD">$4M – $8M USD</option>
                      <option value="$8M – $15M USD">$8M – $15M USD</option>
                      <option value="$15M+ USD">$15M+ USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ct-message"
                    className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5"
                  >
                    Inquiry Details *
                  </label>
                  <textarea
                    id="ct-message"
                    rows={4}
                    placeholder="Please share your preferred location, residence configuration, or timing…"
                    {...register('message')}
                    className="w-full px-3.5 py-3 bg-canvas border border-[var(--border-strong)] text-sm text-ink"
                  />
                  {errors.message && (
                    <p className="text-xs text-[var(--status-sold-fg)] mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="flex items-start gap-3 text-xs text-ink-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('consent')}
                      className="mt-0.5 accent-[#8C6D46]"
                    />
                    <span>
                      I consent to Aurelia Developments processing my contact details to
                      respond to this inquiry in accordance with the{' '}
                      <Link to="/privacy" className="underline text-ink">
                        Privacy Policy
                      </Link>
                      . *
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="text-xs text-[var(--status-sold-fg)]">
                      {errors.consent.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-9 py-4 bg-ink text-ivory text-xs uppercase tracking-[0.2em] hover:bg-bronze transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Sending Inquiry…' : 'Transmit Private Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
