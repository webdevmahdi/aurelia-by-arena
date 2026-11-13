import { ArrowUpRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { ProjectStatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency } from '@/lib/format';
import type { ProjectDTO } from '@/types/api';

export function ProjectPlateCard({
  project,
  indexNumber,
  featuredLayout = false,
}: {
  project: ProjectDTO;
  indexNumber?: number;
  featuredLayout?: boolean;
}) {
  const dispatch = useAppDispatch();
  const coverUrl =
    project.heroMedia?.url ?? project.gallery[0]?.url ?? '/media/hero-sanctuary.jpg';
  const coverAlt = project.heroMedia?.alt ?? `${project.name} exterior`;

  if (featuredLayout) {
    return (
      <article
        data-reveal
        className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-hairline)] bg-elevated"
      >
        <Link
          to={`/projects/${project.slug}`}
          className="lg:col-span-7 relative group overflow-hidden bg-stone block aspect-[16/11] lg:aspect-auto lg:min-h-[460px]"
        >
          <img
            src={coverUrl}
            alt={coverAlt}
            width={project.heroMedia?.width ?? 1600}
            height={project.heroMedia?.height ?? 1066}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute top-5 left-5">
            <ProjectStatusBadge status={project.status} invert />
          </div>
        </Link>

        <div className="lg:col-span-5 p-7 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-ink-muted">
              <span>
                {project.location.city}, {project.location.country}
              </span>
              {indexNumber !== undefined && (
                <span className="text-bronze tabular-nums">
                  No. {String(indexNumber).padStart(2, '0')}
                </span>
              )}
            </div>

            <Link to={`/projects/${project.slug}`} className="block group">
              <h3 className="font-serif text-3xl sm:text-4xl text-ink group-hover:text-bronze transition-colors">
                {project.name}
              </h3>
            </Link>

            {project.tagline && (
              <p className="font-serif italic text-lg text-ink-secondary leading-snug">
                {project.tagline}
              </p>
            )}

            <p className="text-sm text-ink-secondary leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>

          <div className="space-y-6 pt-6 border-t border-[var(--border-hairline)]">
            <dl className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <dt className="uppercase tracking-[0.15em] text-ink-muted">Starting From</dt>
                <dd className="text-base font-medium text-ink tabular-nums mt-1">
                  {formatCurrency(project.priceFrom, project.currency)}
                </dd>
              </div>
              <div>
                <dt className="uppercase tracking-[0.15em] text-ink-muted">Availability</dt>
                <dd className="text-base font-medium text-ink tabular-nums mt-1">
                  {project.availableUnits} of {project.totalUnits} Residences
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="uppercase tracking-[0.15em] text-ink-muted">Typologies</dt>
                <dd className="text-ink-secondary mt-1">
                  {project.propertyTypes.join(' · ')} ({Math.min(...project.bedrooms)}–
                  {Math.max(...project.bedrooms)} Bedrooms)
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/projects/${project.slug}`}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-ink text-ivory text-xs uppercase tracking-[0.18em] hover:bg-bronze transition-colors"
              >
                <span>Explore Development</span>
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Link>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openConversionModal({
                      mode: 'BROCHURE',
                      projectId: project.id,
                      projectName: project.name,
                    })
                  )
                }
                className="inline-flex items-center gap-1.5 px-4 py-3 border border-[var(--border-strong)] text-xs uppercase tracking-[0.15em] text-ink hover:border-ink transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Brochure</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      data-reveal
      className="group border border-[var(--border-hairline)] bg-elevated flex flex-col justify-between"
    >
      <div>
        <Link
          to={`/projects/${project.slug}`}
          className="relative block aspect-[16/10] overflow-hidden bg-stone"
        >
          <img
            src={coverUrl}
            alt={coverAlt}
            width={project.heroMedia?.width ?? 1600}
            height={project.heroMedia?.height ?? 1066}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute top-4 left-4">
            <ProjectStatusBadge status={project.status} invert />
          </div>
        </Link>

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <span>
              {project.location.city}, {project.location.country}
            </span>
            <span className="text-bronze tabular-nums">
              {project.availableUnits} Available
            </span>
          </div>

          <Link to={`/projects/${project.slug}`} className="block">
            <h3 className="font-serif text-3xl text-ink group-hover:text-bronze transition-colors">
              {project.name}
            </h3>
          </Link>

          {project.tagline && (
            <p className="text-sm text-ink-secondary leading-relaxed line-clamp-2">
              {project.tagline}
            </p>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-7 pt-5 border-t border-[var(--border-hairline)] space-y-5">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Starting Price
            </span>
            <span className="text-base font-medium text-ink tabular-nums">
              {formatCurrency(project.priceFrom, project.currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Typology
            </span>
            <span className="text-xs text-ink-secondary">
              {project.propertyTypes.slice(0, 2).join(' · ')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`/projects/${project.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-ink text-ivory text-xs uppercase tracking-[0.16em] hover:bg-bronze transition-colors"
          >
            <span>View Project</span>
            <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </Link>
          <Link
            to={`/projects/${project.slug}/units`}
            className="px-3.5 py-2.5 border border-[var(--border-strong)] text-ink text-xs uppercase tracking-[0.14em] hover:border-ink transition-colors"
          >
            Residences
          </Link>
        </div>
      </div>
    </article>
  );
}
