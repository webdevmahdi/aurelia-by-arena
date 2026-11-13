import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Calendar,
  FileSpreadsheet,
  Scale,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { UnitStatusBadge } from '@/components/ui/StatusBadge';
import { toggleCompareUnit } from '@/features/comparison/comparisonSlice';
import { formatArea, formatCurrency } from '@/lib/format';
import type { FloorPlanDTO, UnitDTO } from '@/types/api';

export function UnitsArchitecturalSchedule({
  units,
  projectName,
}: {
  units: UnitDTO[];
  projectName?: string;
}) {
  const dispatch = useAppDispatch();
  const comparedIds = useAppSelector((s) => s.comparison.items.map((i) => i.id));
  const [previewPlan, setPreviewPlan] = useState<{
    unitNumber: string;
    plan: FloorPlanDTO;
  } | null>(null);

  return (
    <>
      {/* Desktop Architectural Schedule Ledger */}
      <div className="hidden lg:block border border-[var(--border-hairline)] bg-elevated overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--border-hairline)] bg-canvas/80 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
              <th className="py-4 px-5 font-medium">Residence</th>
              <th className="py-4 px-4 font-medium">Typology</th>
              <th className="py-4 px-4 font-medium">Floor</th>
              <th className="py-4 px-4 font-medium">Beds / Baths</th>
              <th className="py-4 px-4 font-medium">Area</th>
              <th className="py-4 px-4 font-medium">Orientation / Aspect</th>
              <th className="py-4 px-4 font-medium">Guide Price</th>
              <th className="py-4 px-4 font-medium">Status</th>
              <th className="py-4 px-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-hairline)] text-sm">
            {units.map((unit) => {
              const isCompared = comparedIds.includes(unit.id);
              return (
                <tr
                  key={unit.id}
                  className="hover:bg-canvas/65 transition-colors group"
                >
                  <td className="py-4 px-5">
                    <Link
                      to={`/units/${unit.id}`}
                      className="font-serif text-xl text-ink group-hover:text-bronze transition-colors font-medium"
                    >
                      {unit.unitNumber}
                    </Link>
                  </td>
                  <td className="py-4 px-4 text-ink-secondary">{unit.propertyType}</td>
                  <td className="py-4 px-4 tabular-nums text-ink">L{String(unit.floor).padStart(2, '0')}</td>
                  <td className="py-4 px-4 tabular-nums text-ink">
                    {unit.bedrooms} BD · {unit.bathrooms} BA
                  </td>
                  <td className="py-4 px-4 tabular-nums text-ink">
                    {unit.areaSqFt.toLocaleString()} sq ft
                  </td>
                  <td className="py-4 px-4 text-xs text-ink-secondary max-w-[200px]">
                    <span className="block text-ink">{unit.orientation ?? '—'}</span>
                    {unit.view && (
                      <span className="block text-ink-muted truncate" title={unit.view}>
                        {unit.view}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 tabular-nums font-medium text-ink">
                    {formatCurrency(unit.price, unit.currency)}
                  </td>
                  <td className="py-4 px-4">
                    <UnitStatusBadge status={unit.status} />
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-1.5">
                      {unit.floorPlan && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewPlan({
                              unitNumber: unit.unitNumber,
                              plan: unit.floorPlan!,
                            })
                          }
                          title="View Floor Plan"
                          className="px-2.5 py-1.5 border border-[var(--border-hairline)] text-[11px] uppercase tracking-[0.13em] text-ink-secondary hover:border-ink hover:text-ink transition-colors cursor-pointer"
                        >
                          Plan
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dispatch(toggleCompareUnit(unit))}
                        title="Compare Residence"
                        className={clsx(
                          'px-2.5 py-1.5 border text-[11px] uppercase tracking-[0.13em] transition-colors cursor-pointer',
                          isCompared
                            ? 'bg-bronze text-ivory border-bronze'
                            : 'border-[var(--border-hairline)] text-ink-secondary hover:border-ink hover:text-ink'
                        )}
                      >
                        {isCompared ? 'Added' : 'Compare'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            openConversionModal({
                              mode: 'UNIT_INQUIRY',
                              projectId: unit.projectId,
                              projectName,
                              unitId: unit.id,
                              unitNumber: unit.unitNumber,
                              defaultBudget: formatCurrency(unit.price, unit.currency),
                            })
                          )
                        }
                        className="px-2.5 py-1.5 border border-[var(--border-strong)] text-[11px] uppercase tracking-[0.13em] text-ink hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
                      >
                        Enquire
                      </button>
                      <Link
                        to={`/units/${unit.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-ink text-ivory text-[11px] uppercase tracking-[0.13em] hover:bg-bronze transition-colors"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tablet & Mobile Architectural Residence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:hidden">
        {units.map((unit) => {
          const isCompared = comparedIds.includes(unit.id);
          const primaryImage = unit.media[0]?.url;

          return (
            <article
              key={unit.id}
              className="border border-[var(--border-hairline)] bg-elevated flex flex-col justify-between"
            >
              <div>
                {primaryImage && (
                  <Link
                    to={`/units/${unit.id}`}
                    className="block aspect-[16/9] overflow-hidden bg-stone border-b border-[var(--border-hairline)]"
                  >
                    <img
                      src={primaryImage}
                      alt={unit.media[0]?.alt ?? `Residence ${unit.unitNumber}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </Link>
                )}

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-bronze">
                        {unit.propertyType} · Floor {unit.floor}
                      </span>
                      <Link to={`/units/${unit.id}`}>
                        <h3 className="font-serif text-2xl text-ink mt-0.5">
                          Residence {unit.unitNumber}
                        </h3>
                      </Link>
                    </div>
                    <UnitStatusBadge status={unit.status} />
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-[var(--border-hairline)]">
                    <div>
                      <dt className="text-ink-muted uppercase tracking-[0.12em]">Layout</dt>
                      <dd className="text-ink tabular-nums mt-0.5">
                        {unit.bedrooms} Bed · {unit.bathrooms} Bath
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted uppercase tracking-[0.12em]">Area</dt>
                      <dd className="text-ink tabular-nums mt-0.5">
                        {formatArea(unit.areaSqFt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted uppercase tracking-[0.12em]">Guide Price</dt>
                      <dd className="text-ink font-medium tabular-nums mt-0.5">
                        {formatCurrency(unit.price, unit.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-muted uppercase tracking-[0.12em]">Orientation</dt>
                      <dd className="text-ink mt-0.5">{unit.orientation ?? '—'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-2">
                <div className="flex gap-2">
                  <Link
                    to={`/units/${unit.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-ink text-ivory text-xs uppercase tracking-[0.15em]"
                  >
                    <span>View Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => dispatch(toggleCompareUnit(unit))}
                    className={clsx(
                      'inline-flex items-center gap-1.5 px-3 py-2.5 border text-xs uppercase tracking-[0.14em] cursor-pointer',
                      isCompared
                        ? 'bg-bronze text-ivory border-bronze'
                        : 'border-[var(--border-strong)] text-ink'
                    )}
                  >
                    <Scale className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>{isCompared ? 'Added' : 'Compare'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {unit.floorPlan && (
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPlan({
                          unitNumber: unit.unitNumber,
                          plan: unit.floorPlan!,
                        })
                      }
                      className="inline-flex items-center justify-center gap-1 py-2 px-2 border border-[var(--border-hairline)] text-[11px] uppercase tracking-[0.12em] text-ink-secondary cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3 h-3" strokeWidth={1.5} />
                      <span>Plan</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        openConversionModal({
                          mode: 'PRICING',
                          projectId: unit.projectId,
                          projectName,
                          unitId: unit.id,
                          unitNumber: unit.unitNumber,
                        })
                      )
                    }
                    className="py-2 px-2 border border-[var(--border-hairline)] text-[11px] uppercase tracking-[0.12em] text-ink-secondary cursor-pointer"
                  >
                    Pricing
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        openConversionModal({
                          mode: 'SITE_VISIT',
                          projectId: unit.projectId,
                          projectName,
                          unitId: unit.id,
                          unitNumber: unit.unitNumber,
                        })
                      )
                    }
                    className="inline-flex items-center justify-center gap-1 py-2 px-2 border border-[var(--border-hairline)] text-[11px] uppercase tracking-[0.12em] text-ink-secondary cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" strokeWidth={1.5} />
                    <span>Visit</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Floor Plan Quick Modal */}
      <AnimatePresence>
        {previewPlan && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Floor plan for Residence ${previewPlan.unitNumber}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#171614]/85 flex items-center justify-center p-4 sm:p-8"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewPlan(null);
            }}
          >
            <div className="w-full max-w-4xl bg-canvas border border-[var(--border-strong)] overflow-hidden">
              <div className="px-6 py-4 bg-elevated border-b border-[var(--border-hairline)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-bronze">
                    Residence {previewPlan.unitNumber}
                  </span>
                  <h3 className="font-serif text-2xl text-ink">{previewPlan.plan.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPlan(null)}
                  aria-label="Close floor plan preview"
                  className="p-2 border border-[var(--border-strong)] text-ink hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
              <div className="p-6 bg-[#F7F3EC] flex items-center justify-center">
                <img
                  src={previewPlan.plan.imageUrl}
                  alt={previewPlan.plan.name}
                  className="max-h-[70vh] w-auto object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
