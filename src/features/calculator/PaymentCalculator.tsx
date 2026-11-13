import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { openConversionModal } from '@/components/conversion/conversionSlice';
import { calculatePaymentEstimate, formatCurrency } from '@/lib/format';

export function PaymentCalculator({
  initialPrice = 4250000,
  currency = 'USD',
  projectId,
  projectName,
  unitId,
  unitNumber,
}: {
  initialPrice?: number;
  currency?: string;
  projectId?: string;
  projectName?: string;
  unitId?: string;
  unitNumber?: string;
}) {
  const dispatch = useAppDispatch();

  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(4.65);
  const [termMonths, setTermMonths] = useState<number>(300);

  useEffect(() => {
    if (initialPrice && Number.isFinite(initialPrice)) {
      setPropertyPrice(initialPrice);
    }
  }, [initialPrice]);

  const estimate = useMemo(
    () =>
      calculatePaymentEstimate({
        propertyPrice,
        downPaymentPercent,
        annualInterestRate,
        termMonths,
      }),
    [propertyPrice, downPaymentPercent, annualInterestRate, termMonths]
  );

  const termPresets = [
    { label: '10 Yrs (120m)', months: 120 },
    { label: '15 Yrs (180m)', months: 180 },
    { label: '20 Yrs (240m)', months: 240 },
    { label: '25 Yrs (300m)', months: 300 },
    { label: '30 Yrs (360m)', months: 360 },
  ];

  return (
    <div className="border border-[var(--border-hairline)] bg-elevated">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Validated Inputs */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-7 border-b lg:border-b-0 lg:border-r border-[var(--border-hairline)]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--border-hairline)]">
            <span className="text-[11px] uppercase tracking-[0.22em] text-bronze">
              Indicative Acquisition Estimator
            </span>
            <span className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              Currency: {currency}
            </span>
          </div>

          {/* Property Price */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="calc-price"
                className="text-xs uppercase tracking-[0.16em] text-ink-secondary"
              >
                Residence Value ({currency})
              </label>
              <span className="text-sm font-medium text-ink tabular-nums">
                {formatCurrency(propertyPrice, currency)}
              </span>
            </div>
            <input
              id="calc-price"
              type="number"
              min={250000}
              max={100000000}
              step={50000}
              value={propertyPrice}
              onChange={(e) => {
                const next = Number(e.target.value);
                setPropertyPrice(Number.isFinite(next) ? Math.max(0, next) : 0);
              }}
              className="w-full px-4 py-3 bg-canvas border border-[var(--border-strong)] text-ink tabular-nums text-sm focus:border-bronze"
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="calc-down-pct"
                className="text-xs uppercase tracking-[0.16em] text-ink-secondary"
              >
                Initial Capital / Down Payment ({downPaymentPercent}%)
              </label>
              <span className="text-sm font-medium text-ink tabular-nums">
                {formatCurrency(estimate.downPaymentAmount, currency)}
              </span>
            </div>
            <input
              id="calc-down-pct"
              type="range"
              min={10}
              max={85}
              step={5}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="w-full accent-[#8C6D46] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-ink-muted tabular-nums">
              <span>10%</span>
              <span>Financing Principal: {formatCurrency(estimate.financingAmount, currency)}</span>
              <span>85%</span>
            </div>
          </div>

          {/* Annual Interest Rate & Financing Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="calc-interest"
                className="block text-xs uppercase tracking-[0.16em] text-ink-secondary"
              >
                Annual Interest Rate (%)
              </label>
              <input
                id="calc-interest"
                type="number"
                min={0}
                max={20}
                step={0.05}
                value={annualInterestRate}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (Number.isFinite(val)) {
                    setAnnualInterestRate(Math.min(20, Math.max(0, val)));
                  }
                }}
                className="w-full px-4 py-3 bg-canvas border border-[var(--border-strong)] text-ink tabular-nums text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="calc-term"
                className="block text-xs uppercase tracking-[0.16em] text-ink-secondary"
              >
                Financing Term (Months)
              </label>
              <input
                id="calc-term"
                type="number"
                min={12}
                max={480}
                step={12}
                value={termMonths}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (Number.isFinite(val)) {
                    setTermMonths(Math.min(480, Math.max(12, val)));
                  }
                }}
                className="w-full px-4 py-3 bg-canvas border border-[var(--border-strong)] text-ink tabular-nums text-sm"
              />
            </div>
          </div>

          {/* Quick Term Buttons */}
          <div className="flex flex-wrap gap-2">
            {termPresets.map((preset) => (
              <button
                key={preset.months}
                type="button"
                onClick={() => setTermMonths(preset.months)}
                className={`px-3 py-1.5 text-xs tabular-nums border transition-colors cursor-pointer ${
                  termMonths === preset.months
                    ? 'bg-ink text-ivory border-ink'
                    : 'border-[var(--border-hairline)] text-ink-secondary hover:border-ink'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Calculated Outputs & Compliance Disclaimer */}
        <div className="lg:col-span-5 p-6 sm:p-10 bg-obsidian text-ivory flex flex-col justify-between gap-8">
          <div className="space-y-6">
            <div>
              <span className="inline-block px-2.5 py-1 border border-brass/40 text-[10px] uppercase tracking-[0.2em] text-brass mb-4">
                Indicative Estimate Only
              </span>
              <p className="text-xs uppercase tracking-[0.18em] text-ivory-muted">
                Estimated Monthly Payment
              </p>
              <p className="font-serif text-4xl sm:text-5xl text-ivory tabular-nums mt-2">
                {formatCurrency(estimate.monthlyPayment, currency)}
                <span className="text-base font-sans text-ivory-muted"> / mo</span>
              </p>
            </div>

            <dl className="space-y-3 pt-6 border-t border-[var(--border-on-dark)] text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ivory-muted">Down Payment ({downPaymentPercent}%)</dt>
                <dd className="tabular-nums text-ivory">
                  {formatCurrency(estimate.downPaymentAmount, currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ivory-muted">Financing Principal</dt>
                <dd className="tabular-nums text-ivory">
                  {formatCurrency(estimate.financingAmount, currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ivory-muted">Estimated Total Financing Cost</dt>
                <dd className="tabular-nums text-ivory">
                  {formatCurrency(estimate.totalFinancingCost, currency)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 pt-3 border-t border-[var(--border-on-dark)] font-medium">
                <dt className="text-ivory">Estimated Total Payable</dt>
                <dd className="tabular-nums text-brass">
                  {formatCurrency(estimate.totalPayable, currency)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="space-y-5">
            <p className="text-[11px] leading-relaxed text-ivory-muted">
              Notice: Figures shown are illustrative mathematical estimates only and do not
              constitute a financing offer, credit commitment, or lender approval. Developer
              milestone-linked payment schedules are available upon request.
            </p>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  openConversionModal({
                    mode: 'PRICING',
                    projectId,
                    projectName,
                    unitId,
                    unitNumber,
                    defaultBudget: formatCurrency(propertyPrice, currency),
                  })
                )
              }
              className="w-full py-3.5 px-5 bg-ivory text-ink text-xs uppercase tracking-[0.18em] hover:bg-bronze hover:text-ivory transition-colors cursor-pointer"
            >
              Request Developer Payment Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
