import clsx from 'clsx';
import {
  ArrowUpRight,
  FileText,
  Maximize2,
  Move,
  RotateCcw,
  Scale,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { UnitStatusBadge } from '@/components/ui/StatusBadge';
import { toggleCompareUnit } from '@/features/comparison/comparisonSlice';
import { formatArea, formatCurrency } from '@/lib/format';
import type { FloorPlanDTO, UnitDTO } from '@/types/api';

export function InteractiveFloorPlanViewer({
  floorPlans,
  units = [],
  projectId,
  projectName,
}: {
  floorPlans: FloorPlanDTO[];
  units?: UnitDTO[];
  projectId: string;
  projectName: string;
}) {
  const dispatch = useAppDispatch();
  const comparedIds = useAppSelector((s) => s.comparison.items.map((i) => i.id));

  const floors = useMemo(() => {
    const set = new Set<number>(units.map((u) => u.floor));
    return Array.from(set).sort((a, b) => a - b);
  }, [units]);

  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(floorPlans[0]?.id ?? '');
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(
    units[0]?.id ?? null
  );

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ active: boolean; startX: number; startY: number }>({
    active: false,
    startX: 0,
    startY: 0,
  });

  const filteredUnits = useMemo(() => {
    return units.filter((u) => selectedFloor === 'ALL' || u.floor === selectedFloor);
  }, [units, selectedFloor]);

  const activeUnit = useMemo(() => {
    if (selectedUnitId) {
      const match = filteredUnits.find((u) => u.id === selectedUnitId);
      if (match) return match;
    }
    return filteredUnits[0] ?? null;
  }, [filteredUnits, selectedUnitId]);

  const activePlan = useMemo(() => {
    if (activeUnit?.floorPlan) {
      const byUnit = floorPlans.find((fp) => fp.id === activeUnit.floorPlan?.id);
      if (byUnit) return byUnit;
      return activeUnit.floorPlan;
    }
    return floorPlans.find((fp) => fp.id === selectedPlanId) ?? floorPlans[0];
  }, [activeUnit, floorPlans, selectedPlanId]);

  const handleZoomIn = () => setZoom((z) => Math.min(2.4, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(1, +(z - 0.25).toFixed(2));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (floorPlans.length === 0) return null;

  return (
    <div className="border border-[var(--border-hairline)] bg-elevated">
      {/* Top Architectural Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 sm:px-8 py-4 border-b border-[var(--border-hairline)] bg-canvas/70">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Floor plates">
          {floorPlans.map((plan) => {
            const isSelected = activePlan?.id === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  const matchingUnit = units.find((u) => u.floorPlan?.id === plan.id);
                  if (matchingUnit) {
                    setSelectedUnitId(matchingUnit.id);
                    if (selectedFloor !== 'ALL' && matchingUnit.floor !== selectedFloor) {
                      setSelectedFloor('ALL');
                    }
                  }
                  handleResetView();
                }}
                className={clsx(
                  'px-3.5 py-2 text-xs uppercase tracking-[0.14em] border transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-ink text-ivory border-ink'
                    : 'bg-elevated text-ink border-[var(--border-hairline)] hover:border-ink'
                )}
              >
                {plan.name.split('—')[0].trim()}
              </button>
            );
          })}
        </div>

        {/* Zoom & PDF Sheet Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            aria-label="Zoom out floor plan"
            className="p-2 border border-[var(--border-hairline)] text-ink disabled:opacity-35 hover:border-ink transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <span className="px-2.5 text-xs tabular-nums text-ink-secondary">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 2.4}
            aria-label="Zoom in floor plan"
            className="p-2 border border-[var(--border-hairline)] text-ink disabled:opacity-35 hover:border-ink transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            aria-label="Reset floor plan zoom and pan"
            className="p-2 border border-[var(--border-hairline)] text-ink hover:border-ink transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
          </button>
          {activePlan?.pdfUrl && (
            <a
              href={activePlan.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--border-strong)] text-[11px] uppercase tracking-[0.15em] text-ink hover:bg-ink hover:text-ivory transition-colors"
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Architectural Sheet</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Split Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Floor & Unit Selector Ledger (Non-color-only availability) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[var(--border-hairline)] p-5 sm:p-7 flex flex-col justify-between gap-6">
          <div className="space-y-5">
            {floors.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-2.5">
                  Select Elevation Level
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedFloor('ALL')}
                    className={clsx(
                      'px-3 py-1.5 text-xs uppercase tracking-[0.14em] border transition-colors cursor-pointer',
                      selectedFloor === 'ALL'
                        ? 'bg-bronze text-ivory border-bronze'
                        : 'border-[var(--border-hairline)] text-ink-secondary hover:border-ink'
                    )}
                  >
                    All Levels
                  </button>
                  {floors.map((fl) => (
                    <button
                      key={fl}
                      type="button"
                      onClick={() => setSelectedFloor(fl)}
                      className={clsx(
                        'px-3 py-1.5 text-xs tabular-nums border transition-colors cursor-pointer',
                        selectedFloor === fl
                          ? 'bg-bronze text-ivory border-bronze'
                          : 'border-[var(--border-hairline)] text-ink-secondary hover:border-ink'
                      )}
                    >
                      L{String(fl).padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredUnits.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-muted mb-2.5">
                  Residences on Plate ({filteredUnits.length})
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {filteredUnits.map((unit) => {
                    const isActive = activeUnit?.id === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => setSelectedUnitId(unit.id)}
                        className={clsx(
                          'w-full text-left p-3.5 border transition-colors flex items-center justify-between gap-3 cursor-pointer',
                          isActive
                            ? 'border-ink bg-canvas'
                            : 'border-[var(--border-hairline)] bg-elevated hover:border-[var(--border-strong)]'
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg text-ink font-medium">
                              {unit.unitNumber}
                            </span>
                            <span className="text-xs text-ink-muted tabular-nums">
                              · Floor {unit.floor}
                            </span>
                          </div>
                          <p className="text-xs text-ink-secondary tabular-nums mt-0.5">
                            {unit.bedrooms} Bed · {unit.areaSqFt.toLocaleString()} sq ft ·{' '}
                            {formatCurrency(unit.price, unit.currency)}
                          </p>
                        </div>
                        <UnitStatusBadge status={unit.status} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Linked Unit Detail Card */}
          {activeUnit ? (
            <div className="pt-5 border-t border-[var(--border-hairline)] space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-bronze">
                    Selected Residence
                  </span>
                  <h4 className="font-serif text-2xl text-ink">
                    Residence {activeUnit.unitNumber}
                  </h4>
                </div>
                <UnitStatusBadge status={activeUnit.status} />
              </div>

              <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div>
                  <dt className="text-ink-muted uppercase tracking-[0.12em]">Area</dt>
                  <dd className="text-ink font-medium tabular-nums">
                    {formatArea(activeUnit.areaSqFt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-muted uppercase tracking-[0.12em]">Guide Price</dt>
                  <dd className="text-ink font-medium tabular-nums">
                    {formatCurrency(activeUnit.price, activeUnit.currency)}
                  </dd>
                </div>
                {activeUnit.orientation && (
                  <div>
                    <dt className="text-ink-muted uppercase tracking-[0.12em]">Orientation</dt>
                    <dd className="text-ink">{activeUnit.orientation}</dd>
                  </div>
                )}
                {activeUnit.view && (
                  <div>
                    <dt className="text-ink-muted uppercase tracking-[0.12em]">Aspect</dt>
                    <dd className="text-ink truncate" title={activeUnit.view}>
                      {activeUnit.view}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  to={`/units/${activeUnit.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-ink text-ivory text-xs uppercase tracking-[0.16em] hover:bg-bronze transition-colors"
                >
                  <span>Inspect Residence</span>
                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Link>
                <button
                  type="button"
                  onClick={() => dispatch(toggleCompareUnit(activeUnit))}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3.5 py-2.5 border text-xs uppercase tracking-[0.15em] transition-colors cursor-pointer',
                    comparedIds.includes(activeUnit.id)
                      ? 'bg-bronze text-ivory border-bronze'
                      : 'border-[var(--border-strong)] text-ink hover:border-ink'
                  )}
                >
                  <Scale className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{comparedIds.includes(activeUnit.id) ? 'Compared' : 'Compare'}</span>
                </button>
              </div>
            </div>
          ) : (
            activePlan && (
              <div className="pt-5 border-t border-[var(--border-hairline)] space-y-3">
                <h4 className="font-serif text-2xl text-ink">{activePlan.name}</h4>
                <p className="text-xs text-ink-secondary tabular-nums">
                  {activePlan.bedrooms ? `${activePlan.bedrooms} Bedrooms · ` : ''}
                  {activePlan.bathrooms ? `${activePlan.bathrooms} Bathrooms · ` : ''}
                  {activePlan.areaSqFt ? formatArea(activePlan.areaSqFt) : ''}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      openConversionModal({
                        mode: 'PRICING',
                        projectId,
                        projectName,
                      })
                    )
                  }
                  className="w-full px-4 py-2.5 bg-ink text-ivory text-xs uppercase tracking-[0.16em] hover:bg-bronze transition-colors cursor-pointer"
                >
                  Request Floor Plate Availability
                </button>
              </div>
            )
          )}
        </div>

        {/* Right: Interactive Zoom/Pan Architectural Plate Stage */}
        <div className="lg:col-span-8 relative bg-[#F7F3EC] overflow-hidden flex flex-col justify-between min-h-[400px] sm:min-h-[540px]">
          <div
            onPointerDown={(e) => {
              if (zoom <= 1) return;
              dragState.current = {
                active: true,
                startX: e.clientX - pan.x,
                startY: e.clientY - pan.y,
              };
            }}
            onPointerMove={(e) => {
              if (!dragState.current.active || zoom <= 1) return;
              const maxOffset = (zoom - 1) * 260;
              const nextX = Math.max(
                -maxOffset,
                Math.min(maxOffset, e.clientX - dragState.current.startX)
              );
              const nextY = Math.max(
                -maxOffset,
                Math.min(maxOffset, e.clientY - dragState.current.startY)
              );
              setPan({ x: nextX, y: nextY });
            }}
            onPointerUp={() => {
              dragState.current.active = false;
            }}
            onPointerLeave={() => {
              dragState.current.active = false;
            }}
            className={clsx(
              'flex-1 flex items-center justify-center p-4 sm:p-8 select-none overflow-hidden',
              zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            )}
          >
            {activePlan && (
              <img
                src={activePlan.imageUrl}
                alt={`${activePlan.name} architectural floor plan`}
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: dragState.current.active ? 'none' : 'transform 220ms ease-out',
                }}
                className="max-h-[480px] w-auto object-contain"
              />
            )}
          </div>

          {/* Bottom Stage Metadata & Mobile Fallback Actions */}
          <div className="px-5 sm:px-8 py-3.5 border-t border-[var(--border-hairline)] bg-elevated/90 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
            <div className="flex items-center gap-2">
              <Move className="w-3.5 h-3.5 text-bronze" strokeWidth={1.5} />
              <span>
                {zoom > 1
                  ? 'Drag plate to inspect room dimensions'
                  : 'Use zoom controls above to inspect architectural room dimensions'}
              </span>
            </div>
            {activePlan && (
              <a
                href={activePlan.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink hover:text-bronze uppercase tracking-[0.14em] text-[11px]"
              >
                <Maximize2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Open Full-Resolution Plate</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
