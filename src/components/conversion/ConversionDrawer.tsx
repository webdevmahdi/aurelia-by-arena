import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  closeConversionModal,
  switchConversionMode,
  type ConversionMode,
} from '@/components/conversion/conversionSlice';
import {
  useCreateBrochureRequestMutation,
  useLazyGetProjectBrochureQuery,
} from '@/features/brochures/brochuresApi';
import { useCreateLeadMutation } from '@/features/leads/leadsApi';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import { useCreateSiteVisitMutation } from '@/features/visits/visitsApi';
import type {
  ApiError,
  BrochureCreateRequest,
  LeadCreateRequest,
  LeadType,
  PreferredContactMethod,
  SiteVisitCreateRequest,
} from '@/types/api';

const siteVisitSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please provide a valid email address.'),
  phone: z.string().trim().min(6, 'Please provide a contact telephone number.'),
  projectId: z.string().min(1, 'Please select a development.'),
  unitId: z.string().optional(),
  preferredDate: z.string().min(1, 'Please select a preferred date.'),
  preferredTime: z.string().min(1, 'Please select a preferred time window.'),
  message: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Please confirm consent to proceed.',
  }),
});

const brochureSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please provide a valid email address.'),
  phone: z.string().optional(),
  projectId: z.string().min(1, 'Please select a development.'),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Please confirm consent to receive portfolio documentation.',
  }),
});

const leadSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name.'),
  email: z.string().trim().email('Please provide a valid email address.'),
  phone: z.string().trim().min(6, 'Please provide a reachable telephone number.'),
  country: z.string().optional(),
  preferredContactMethod: z.enum(['PHONE', 'EMAIL', 'WHATSAPP']).optional(),
  projectId: z.string().optional(),
  unitId: z.string().optional(),
  budgetRange: z.string().optional(),
  preferredVisitDate: z.string().optional(),
  preferredVisitTime: z.string().optional(),
  message: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Please confirm consent so an advisor may contact you.',
  }),
});

function extractApiError(err: unknown): ApiError['error'] | null {
  if (err && typeof err === 'object' && 'error' in err) {
    return (err as ApiError).error;
  }
  return null;
}

export function ConversionDrawer() {
  const dispatch = useAppDispatch();
  const {
    isOpen,
    mode,
    projectId,
    projectName,
    unitId,
    unitNumber,
    defaultBudget,
  } = useAppSelector((s) => s.conversion);

  const { data: projectsData } = useGetProjectsQuery({ limit: 50 });
  const projects = projectsData?.items ?? [];

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unlockedBrochureUrl, setUnlockedBrochureUrl] = useState<string | null>(null);
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);

  const [createSiteVisit, { isLoading: isVisitSubmitting }] =
    useCreateSiteVisitMutation();
  const [createBrochure, { isLoading: isBrochureSubmitting }] =
    useCreateBrochureRequestMutation();
  const [triggerGetBrochure] = useLazyGetProjectBrochureQuery();
  const [createLead, { isLoading: isLeadSubmitting }] = useCreateLeadMutation();

  useEffect(() => {
    setSuccessMessage(null);
    setUnlockedBrochureUrl(null);
    setServerErrorMessage(null);
  }, [isOpen, mode, projectId, unitId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(closeConversionModal());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, dispatch]);

  const titles: Record<ConversionMode, { kicker: string; title: string }> = {
    SITE_VISIT: {
      kicker: 'Private Gallery Appointment',
      title: 'Schedule a Site Visit',
    },
    BROCHURE: {
      kicker: 'Architectural Monograph',
      title: 'Request Development Brochure',
    },
    PRICING: {
      kicker: 'Private Acquisition Schedule',
      title: 'Request Guide Pricing',
    },
    UNIT_INQUIRY: {
      kicker: unitNumber ? `Residence ${unitNumber}` : 'Residence Dossier',
      title: 'Enquire About This Residence',
    },
    GENERAL_INQUIRY: {
      kicker: 'Aurelia Private Advisory',
      title: 'Speak With Senior Sales',
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="conversion-drawer-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="fixed inset-0 z-50 bg-[#171614]/72 backdrop-blur-[2px] flex justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) dispatch(closeConversionModal());
          }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-xl h-full bg-canvas border-l border-[var(--border-strong)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 sm:px-9 py-6 border-b border-[var(--border-hairline)] bg-elevated flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-bronze">
                  {titles[mode].kicker}
                </span>
                <h2
                  id="conversion-drawer-title"
                  className="font-serif text-3xl text-ink mt-1"
                >
                  {titles[mode].title}
                </h2>
                {(projectName || unitNumber) && (
                  <p className="text-xs text-ink-secondary mt-1">
                    {projectName}
                    {unitNumber ? ` · Residence ${unitNumber}` : ''}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch(closeConversionModal())}
                aria-label="Close panel"
                className="p-2 border border-[var(--border-strong)] text-ink hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Mode Switch Tabs */}
            <div className="px-6 sm:px-9 py-3 bg-stone/60 border-b border-[var(--border-hairline)] flex flex-wrap gap-2">
              {(
                [
                  { id: 'SITE_VISIT', label: 'Site Visit' },
                  { id: 'PRICING', label: 'Request Pricing' },
                  { id: 'BROCHURE', label: 'Brochure' },
                  { id: 'GENERAL_INQUIRY', label: 'Sales Advisory' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => dispatch(switchConversionMode(tab.id))}
                  className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] border transition-colors cursor-pointer ${
                    mode === tab.id || (mode === 'UNIT_INQUIRY' && tab.id === 'PRICING')
                      ? 'bg-ink text-ivory border-ink'
                      : 'bg-elevated text-ink-secondary border-[var(--border-hairline)] hover:border-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-9 py-8">
              {successMessage ? (
                <div className="p-8 border border-[var(--status-available-border)] bg-[var(--status-available-bg)]/50 space-y-5">
                  <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--status-available-fg)]">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>Request Logged</span>
                  </div>
                  <h3 className="font-serif text-3xl text-ink">
                    Thank You for Your Interest
                  </h3>
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    {successMessage}
                  </p>

                  {unlockedBrochureUrl && (
                    <div className="pt-3">
                      <a
                        href={unlockedBrochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors"
                      >
                        <FileText className="w-4 h-4" strokeWidth={1.5} />
                        <span>Access Architectural Monograph</span>
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </a>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[var(--border-hairline)]">
                    <button
                      type="button"
                      onClick={() => dispatch(closeConversionModal())}
                      className="px-5 py-2.5 border border-ink text-ink text-xs uppercase tracking-[0.16em] hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
                    >
                      Return to Portfolio
                    </button>
                  </div>
                </div>
              ) : mode === 'SITE_VISIT' ? (
                <SiteVisitForm
                  projects={projects}
                  defaultProjectId={projectId ?? projects[0]?.id ?? ''}
                  defaultUnitId={unitId}
                  isSubmitting={isVisitSubmitting}
                  serverError={serverErrorMessage}
                  onSubmit={async (payload, setFieldError) => {
                    setServerErrorMessage(null);
                    try {
                      const res = await createSiteVisit(payload).unwrap();
                      setSuccessMessage(
                        res.message ??
                          'Your site-visit request has been received and is pending schedule confirmation by our Private Sales Office.'
                      );
                    } catch (err) {
                      const apiErr = extractApiError(err);
                      if (apiErr?.fields) {
                        Object.entries(apiErr.fields).forEach(([k, msg]) =>
                          setFieldError(k, msg)
                        );
                      }
                      setServerErrorMessage(
                        apiErr?.message ?? 'Unable to submit site-visit request.'
                      );
                    }
                  }}
                />
              ) : mode === 'BROCHURE' ? (
                <BrochureForm
                  projects={projects}
                  defaultProjectId={projectId ?? projects[0]?.id ?? ''}
                  isSubmitting={isBrochureSubmitting}
                  serverError={serverErrorMessage}
                  onSubmit={async (payload, setFieldError) => {
                    setServerErrorMessage(null);
                    try {
                      const res = await createBrochure(payload).unwrap();
                      // Query GET /api/v1/projects/:projectId/brochure if authorized by backend
                      try {
                        const brochureDoc = await triggerGetBrochure(
                          payload.projectId
                        ).unwrap();
                        if (brochureDoc?.data?.url) {
                          setUnlockedBrochureUrl(brochureDoc.data.url);
                        }
                      } catch {
                        // Backend controls whether brochure delivery is immediate or sent via advisor email
                      }
                      setSuccessMessage(
                        res.message ??
                          'Your brochure request has been registered with the Aurelia Private Sales Office.'
                      );
                    } catch (err) {
                      const apiErr = extractApiError(err);
                      if (apiErr?.fields) {
                        Object.entries(apiErr.fields).forEach(([k, msg]) =>
                          setFieldError(k, msg)
                        );
                      }
                      setServerErrorMessage(
                        apiErr?.message ?? 'Unable to submit brochure request.'
                      );
                    }
                  }}
                />
              ) : (
                <LeadInquiryForm
                  leadType={
                    mode === 'PRICING'
                      ? 'PRICING_REQUEST'
                      : mode === 'UNIT_INQUIRY'
                        ? 'UNIT_INQUIRY'
                        : 'GENERAL_INQUIRY'
                  }
                  projects={projects}
                  defaultProjectId={projectId}
                  defaultUnitId={unitId}
                  defaultBudget={defaultBudget}
                  isSubmitting={isLeadSubmitting}
                  serverError={serverErrorMessage}
                  onSubmit={async (payload, setFieldError) => {
                    setServerErrorMessage(null);
                    try {
                      const res = await createLead(payload).unwrap();
                      setSuccessMessage(
                        res.message ??
                          'Your inquiry has been logged. A senior advisor will contact you via your preferred channel.'
                      );
                    } catch (err) {
                      const apiErr = extractApiError(err);
                      if (apiErr?.fields) {
                        Object.entries(apiErr.fields).forEach(([k, msg]) =>
                          setFieldError(k, msg)
                        );
                      }
                      setServerErrorMessage(
                        apiErr?.message ?? 'Unable to submit inquiry.'
                      );
                    }
                  }}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SiteVisitForm({
  projects,
  defaultProjectId,
  defaultUnitId,
  isSubmitting,
  serverError,
  onSubmit,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId: string;
  defaultUnitId?: string;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (
    payload: SiteVisitCreateRequest,
    setFieldError: (field: string, msg: string) => void
  ) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof siteVisitSchema>>({
    resolver: zodResolver(siteVisitSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      projectId: defaultProjectId,
      unitId: defaultUnitId ?? '',
      preferredDate: '',
      preferredTime: '10:00 – 12:00 (Morning Private Viewing)',
      message: '',
      consent: false,
    },
  });

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        const payload: SiteVisitCreateRequest = {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          projectId: values.projectId,
          ...(values.unitId ? { unitId: values.unitId } : {}),
          preferredDate: values.preferredDate,
          preferredTime: values.preferredTime,
          ...(values.message ? { message: values.message } : {}),
          consent: values.consent,
        };
        return onSubmit(payload, (field, message) =>
          setError(field as keyof z.infer<typeof siteVisitSchema>, { message })
        );
      })}
      className="space-y-5"
    >
      <p className="text-xs text-ink-secondary leading-relaxed">
        Request a private presentation at our sales gallery or on-site residence viewing.
        Requested dates remain pending until confirmed by our advisory team.
      </p>

      {serverError && (
        <div role="alert" className="p-3.5 border border-[var(--status-sold-border)] bg-[var(--status-sold-bg)] text-xs text-[var(--status-sold-fg)]">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="sv-project" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Development *
        </label>
        <select
          id="sv-project"
          {...register('projectId')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        >
          <option value="">Select development…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.projectId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="sv-name" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Full Name *
        </label>
        <input
          id="sv-name"
          type="text"
          autoComplete="name"
          {...register('fullName')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        />
        {errors.fullName && (
          <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sv-email" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Email Address *
          </label>
          <input
            id="sv-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          />
          {errors.email && (
            <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="sv-phone" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Telephone *
          </label>
          <input
            id="sv-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+44 20 7946 0821"
            {...register('phone')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          />
          {errors.phone && (
            <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sv-date" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Preferred Date *
          </label>
          <input
            id="sv-date"
            type="date"
            min={minDate}
            {...register('preferredDate')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          />
          {errors.preferredDate && (
            <p className="text-xs text-[var(--status-sold-fg)] mt-1">
              {errors.preferredDate.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sv-time" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Preferred Window *
          </label>
          <select
            id="sv-time"
            {...register('preferredTime')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          >
            <option value="10:00 – 12:00 (Morning Private Viewing)">
              10:00 – 12:00 (Morning)
            </option>
            <option value="13:00 – 15:30 (Afternoon Gallery Presentation)">
              13:00 – 15:30 (Afternoon)
            </option>
            <option value="16:00 – 18:30 (Dusk Light Inspection)">
              16:00 – 18:30 (Dusk Light)
            </option>
          </select>
          {errors.preferredTime && (
            <p className="text-xs text-[var(--status-sold-fg)] mt-1">
              {errors.preferredTime.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="sv-message" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Notes / Specific Requirements
        </label>
        <textarea
          id="sv-message"
          rows={3}
          placeholder="Optional: chauffeur arrival details, virtual video walkthrough preference, or specific floor plates…"
          {...register('message')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        />
      </div>

      <div className="space-y-1">
        <label className="flex items-start gap-3 text-xs text-ink-secondary cursor-pointer">
          <input
            type="checkbox"
            {...register('consent')}
            className="mt-0.5 accent-[#8C6D46]"
          />
          <span>
            I consent to Aurelia Developments processing my details to coordinate this
            appointment in accordance with the{' '}
            <Link to="/privacy" className="underline text-ink">
              Privacy Notice
            </Link>
            . *
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-[var(--status-sold-fg)]">{errors.consent.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Submitting Request…' : 'Request Private Site Visit'}
      </button>
    </form>
  );
}

function BrochureForm({
  projects,
  defaultProjectId,
  isSubmitting,
  serverError,
  onSubmit,
}: {
  projects: { id: string; name: string }[];
  defaultProjectId: string;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (
    payload: BrochureCreateRequest,
    setFieldError: (field: string, msg: string) => void
  ) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof brochureSchema>>({
    resolver: zodResolver(brochureSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      projectId: defaultProjectId,
      consent: false,
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        const payload: BrochureCreateRequest = {
          fullName: values.fullName,
          email: values.email,
          ...(values.phone ? { phone: values.phone } : {}),
          projectId: values.projectId,
          consent: values.consent,
        };
        return onSubmit(payload, (field, message) =>
          setError(field as keyof z.infer<typeof brochureSchema>, { message })
        );
      })}
      className="space-y-5"
    >
      <p className="text-xs text-ink-secondary leading-relaxed">
        Register below to access the complete architectural monograph, material specification
        schedule, and dimensioned floor plates.
      </p>

      {serverError && (
        <div role="alert" className="p-3.5 border border-[var(--status-sold-border)] bg-[var(--status-sold-bg)] text-xs text-[var(--status-sold-fg)]">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="br-project" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Development *
        </label>
        <select
          id="br-project"
          {...register('projectId')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        >
          <option value="">Select development…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.projectId && (
          <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.projectId.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="br-name" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Full Name *
        </label>
        <input
          id="br-name"
          type="text"
          autoComplete="name"
          {...register('fullName')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        />
        {errors.fullName && (
          <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="br-email" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Email Address *
        </label>
        <input
          id="br-email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        />
        {errors.email && (
          <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="br-phone" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Telephone (Optional)
        </label>
        <input
          id="br-phone"
          type="tel"
          autoComplete="tel"
          {...register('phone')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        />
      </div>

      <div className="space-y-1">
        <label className="flex items-start gap-3 text-xs text-ink-secondary cursor-pointer">
          <input
            type="checkbox"
            {...register('consent')}
            className="mt-0.5 accent-[#8C6D46]"
          />
          <span>
            I consent to receive the requested architectural dossier and advisory follow-up
            per the{' '}
            <Link to="/privacy" className="underline text-ink">
              Privacy Notice
            </Link>
            . *
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-[var(--status-sold-fg)]">{errors.consent.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting ? 'Authorizing Dossier…' : 'Request Brochure'}
      </button>
    </form>
  );
}

function LeadInquiryForm({
  leadType,
  projects,
  defaultProjectId,
  defaultUnitId,
  defaultBudget,
  isSubmitting,
  serverError,
  onSubmit,
}: {
  leadType: LeadType;
  projects: { id: string; name: string }[];
  defaultProjectId?: string;
  defaultUnitId?: string;
  defaultBudget?: string;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (
    payload: LeadCreateRequest,
    setFieldError: (field: string, msg: string) => void
  ) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      country: '',
      preferredContactMethod: 'EMAIL',
      projectId: defaultProjectId ?? '',
      unitId: defaultUnitId ?? '',
      budgetRange: defaultBudget ?? '$4M – $8M USD',
      message: '',
      consent: false,
    },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => {
        const payload: LeadCreateRequest = {
          type: leadType,
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
          ...(values.unitId ? { unitId: values.unitId } : {}),
          ...(values.budgetRange ? { budgetRange: values.budgetRange } : {}),
          ...(values.message ? { message: values.message } : {}),
          consent: values.consent,
        };
        return onSubmit(payload, (field, message) =>
          setError(field as keyof z.infer<typeof leadSchema>, { message })
        );
      })}
      className="space-y-5"
    >
      {serverError && (
        <div role="alert" className="p-3.5 border border-[var(--status-sold-border)] bg-[var(--status-sold-bg)] text-xs text-[var(--status-sold-fg)]">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="ld-name" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Full Name *
        </label>
        <input
          id="ld-name"
          type="text"
          autoComplete="name"
          {...register('fullName')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        />
        {errors.fullName && (
          <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ld-email" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Email Address *
          </label>
          <input
            id="ld-email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          />
          {errors.email && (
            <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="ld-phone" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Telephone *
          </label>
          <input
            id="ld-phone"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          />
          {errors.phone && (
            <p className="text-xs text-[var(--status-sold-fg)] mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ld-country" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Country of Residence
          </label>
          <input
            id="ld-country"
            type="text"
            placeholder="e.g., United Kingdom, UAE, Switzerland"
            {...register('country')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          />
        </div>
        <div>
          <label htmlFor="ld-method" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Preferred Contact Method
          </label>
          <select
            id="ld-method"
            {...register('preferredContactMethod')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          >
            <option value="EMAIL">Email</option>
            <option value="PHONE">Direct Telephone</option>
            <option value="WHATSAPP">WhatsApp Concierge</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ld-project" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Development of Interest
          </label>
          <select
            id="ld-project"
            {...register('projectId')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          >
            <option value="">Entire Portfolio</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ld-budget" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
            Indicative Budget Range
          </label>
          <select
            id="ld-budget"
            {...register('budgetRange')}
            className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
          >
            <option value="$3M – $5M USD">$3M – $5M USD</option>
            <option value="$4M – $8M USD">$4M – $8M USD</option>
            <option value="$8M – $15M USD">$8M – $15M USD</option>
            <option value="$15M+ USD">$15M+ USD (Penthouse / Sky Villa)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="ld-message" className="block text-xs uppercase tracking-[0.15em] text-ink-secondary mb-1.5">
          Message
        </label>
        <textarea
          id="ld-message"
          rows={3}
          placeholder="Share preferred bedroom configuration, timeline, or financing inquiries…"
          {...register('message')}
          className="w-full px-3.5 py-3 bg-elevated border border-[var(--border-strong)] text-sm text-ink"
        />
      </div>

      <div className="space-y-1">
        <label className="flex items-start gap-3 text-xs text-ink-secondary cursor-pointer">
          <input
            type="checkbox"
            {...register('consent')}
            className="mt-0.5 accent-[#8C6D46]"
          />
          <span>
            I agree to Aurelia Developments contacting me regarding this inquiry in accordance
            with the{' '}
            <Link to="/privacy" className="underline text-ink">
              Privacy Notice
            </Link>
            . *
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs text-[var(--status-sold-fg)]">{errors.consent.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isSubmitting
          ? 'Transmitting Inquiry…'
          : leadType === 'PRICING_REQUEST'
            ? 'Request Confidential Pricing'
            : 'Submit Private Inquiry'}
      </button>
    </form>
  );
}
