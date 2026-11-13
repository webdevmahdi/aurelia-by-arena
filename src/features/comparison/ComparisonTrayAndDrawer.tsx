import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Scale, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { UnitStatusBadge } from '@/components/ui/StatusBadge';
import {
  clearComparison,
  MAX_COMPARISON_UNITS,
  removeCompareUnit,
  setComparisonOpen,
} from '@/features/comparison/comparisonSlice';
import { useGetProjectsQuery } from '@/features/projects/projectsApi';
import {
  calculatePaymentEstimate,
  formatArea,
  formatCurrency,
} from '@/lib/format';

export function ComparisonTrayAndDrawer() {
  const dispatch = useAppDispatch();
  const { items, isOpen } = useAppSelector((s) => s.comparison);
  const { data: projectsData } = useGetProjectsQuery({ limit: 50 });

  const projectMap = new Map(
    (projectsData?.items ?? []).map((p) => [p.id, p])
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(setComparisonOpen(false));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, dispatch]);

  return (
    <>
      {/* Persistent Bottom Architectural Comparison Bar */}
      <AnimatePresence>
        {items.length > 0 && !isOpen && (
          <motion.aside
            aria-label="Selected residences for comparison"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-8 z-40 bg-obsidian text-ivory border border-[var(--border-on-dark-strong)] px-5 py-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-4 sm:min-w-[420px]"
          >
            <div className="flex items-center gap-3">
              <Scale className="w-4 h-4 text-brass shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ivory tabular-nums">
                  Compare Residences ({items.length} / {MAX_COMPARISON_UNITS})
                </p>
                <p className="text-[11px] text-ivory-muted">
                  {items.map((u) => u.unitNumber).join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch(clearComparison())}
                className="px-2.5 py-2 text-[11px] uppercase tracking-[0.14em] text-ivory-muted hover:text-ivory cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => dispatch(setComparisonOpen(true))}
                className="px-4 py-2 bg-ivory text-ink text-xs uppercase tracking-[0.16em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
              >
                Open Comparison
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Full Comparison Matrix Sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Residence comparison matrix"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#171614]/80 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-6"
          >
            <motion.div
              initial={{ y: 36, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-6xl max-h-[92vh] bg-canvas border border-[var(--border-strong)] flex flex-col overflow-hidden"
            >
              <div className="px-6 sm:px-8 py-5 border-b border-[var(--border-hairline)] bg-elevated flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-bronze">
                    Side-by-Side Architectural Schedule
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink">
                    Residence Comparison ({items.length})
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => dispatch(clearComparison())}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.15em] text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => dispatch(setComparisonOpen(false))}
                    aria-label="Close comparison dialog"
                    className="p-2 border border-[var(--border-strong)] text-ink hover:bg-ink hover:text-ivory transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="p-16 text-center space-y-3">
                  <p className="font-serif text-2xl text-ink">No residences selected</p>
                  <p className="text-sm text-ink-secondary">
                    Select up to {MAX_COMPARISON_UNITS} residences across any Aurelia development
                    to evaluate floor plates, orientation, and indicative payments side by side.
                  </p>
                </div>
              ) : (
                <div className="overflow-auto flex-1">
                  <table className="w-full border-collapse text-left min-w-[680px]">
                    <thead>
                      <tr className="border-b border-[var(--border-hairline)] bg-elevated/60">
                        <th className="sticky left-0 z-10 bg-elevated p-4 sm:p-5 w-44 text-[11px] uppercase tracking-[0.18em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Specification
                        </th>
                        {items.map((unit) => {
                          const project = projectMap.get(unit.projectId);
                          return (
                            <th
                              key={unit.id}
                              className="p-4 sm:p-5 min-w-[220px] align-top border-r border-[var(--border-hairline)] last:border-r-0"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-bronze">
                                    {project?.name ?? 'Aurelia Residence'}
                                  </p>
                                  <p className="font-serif text-2xl text-ink font-normal mt-0.5">
                                    Residence {unit.unitNumber}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => dispatch(removeCompareUnit(unit.id))}
                                  aria-label={`Remove ${unit.unitNumber} from comparison`}
                                  className="p-1 text-ink-muted hover:text-ink cursor-pointer"
                                >
                                  <X className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[var(--border-hairline)]">
                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Availability
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            <UnitStatusBadge status={u.status} />
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Guide Price
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 font-medium tabular-nums text-ink border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            {formatCurrency(u.price, u.currency)} ({u.currency})
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Indicative Monthly*
                        </td>
                        {items.map((u) => {
                          const est = calculatePaymentEstimate({
                            propertyPrice: u.price,
                            downPaymentPercent: 30,
                            annualInterestRate: 4.65,
                            termMonths: 300,
                          });
                          return (
                            <td
                              key={u.id}
                              className="p-4 sm:p-5 tabular-nums text-ink-secondary border-r border-[var(--border-hairline)] last:border-r-0"
                            >
                              {formatCurrency(est.monthlyPayment, u.currency)} / mo
                              <span className="block text-[11px] text-ink-muted">
                                Est. (30% down · 25 yrs)
                              </span>
                            </td>
                          );
                        })}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Property Type
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 text-ink border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            {u.propertyType}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Elevation Floor
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 tabular-nums text-ink border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            Level {u.floor}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Bedrooms / Baths
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 tabular-nums text-ink border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            {u.bedrooms} Bedrooms · {u.bathrooms} Bathrooms
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Total Area
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 tabular-nums text-ink border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            {formatArea(u.areaSqFt)}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Orientation &amp; View
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 text-ink-secondary border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            <span className="block text-ink">{u.orientation ?? '—'}</span>
                            <span className="text-xs text-ink-muted">{u.view ?? ''}</span>
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Floor Plan Plate
                        </td>
                        {items.map((u) => (
                          <td
                            key={u.id}
                            className="p-4 sm:p-5 border-r border-[var(--border-hairline)] last:border-r-0"
                          >
                            {u.floorPlan ? (
                              <a
                                href={u.floorPlan.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block group space-y-2"
                              >
                                <img
                                  src={u.floorPlan.imageUrl}
                                  alt={u.floorPlan.name}
                                  className="h-28 w-full object-contain bg-[#F7F3EC] border border-[var(--border-hairline)] p-1.5"
                                />
                                <span className="text-[11px] uppercase tracking-[0.14em] text-bronze group-hover:underline">
                                  Inspect Plate
                                </span>
                              </a>
                            ) : (
                              <span className="text-xs text-ink-muted">Upon application</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="sticky left-0 bg-canvas p-4 sm:p-5 text-xs uppercase tracking-[0.14em] text-ink-muted border-r border-[var(--border-hairline)]">
                          Next Step
                        </td>
                        {items.map((u) => {
                          const project = projectMap.get(u.projectId);
                          return (
                            <td
                              key={u.id}
                              className="p-4 sm:p-5 space-y-2 border-r border-[var(--border-hairline)] last:border-r-0"
                            >
                              <Link
                                to={`/units/${u.id}`}
                                onClick={() => dispatch(setComparisonOpen(false))}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-ink text-ivory text-xs uppercase tracking-[0.15em] hover:bg-bronze transition-colors"
                              >
                                <span>View Residence</span>
                                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  dispatch(setComparisonOpen(false));
                                  dispatch(
                                    openConversionModal({
                                      mode: 'UNIT_INQUIRY',
                                      projectId: u.projectId,
                                      projectName: project?.name,
                                      unitId: u.id,
                                      unitNumber: u.unitNumber,
                                    })
                                  );
                                }}
                                className="w-full px-3 py-2 border border-[var(--border-strong)] text-ink text-xs uppercase tracking-[0.15em] hover:border-ink transition-colors cursor-pointer"
                              >
                                Enquire
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-6 sm:px-8 py-3 bg-elevated border-t border-[var(--border-hairline)] text-[11px] text-ink-muted">
                *Indicative monthly estimate assumes 30% down payment, 4.65% annual rate over 300
                months. Subject to independent lender underwriting; does not imply credit approval.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
