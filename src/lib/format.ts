import type { ProjectStatus, UnitStatus } from '@/types/api';

export function formatCurrency(amount?: number, currency = 'USD'): string {
  if (amount === undefined || amount === null || !Number.isFinite(amount)) {
    return 'Upon Private Application';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatArea(areaSqFt?: number): string {
  if (!areaSqFt || !Number.isFinite(areaSqFt)) return '—';
  const sqMeters = Math.round(areaSqFt * 0.092903);
  return `${areaSqFt.toLocaleString('en-US')} sq ft (${sqMeters.toLocaleString('en-US')} m²)`;
}

export function formatDateEditorial(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatProjectStatus(status: ProjectStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'Completed — Immediate Handover';
    case 'UNDER_CONSTRUCTION':
      return 'Under Construction';
    case 'PLANNED':
      return 'Architectural Release (Planned)';
  }
}

export function formatUnitStatus(status: UnitStatus): string {
  switch (status) {
    case 'AVAILABLE':
      return 'Available';
    case 'RESERVED':
      return 'Reserved';
    case 'SOLD':
      return 'Sold';
    case 'UNAVAILABLE':
      return 'Unavailable';
  }
}

export type PaymentEstimateResult = {
  downPaymentAmount: number;
  financingAmount: number;
  monthlyPayment: number;
  totalFinancingCost: number;
  totalPayable: number;
};

export function calculatePaymentEstimate(input: {
  propertyPrice: number;
  downPaymentPercent: number;
  annualInterestRate: number;
  termMonths: number;
}): PaymentEstimateResult {
  const price = Math.max(0, input.propertyPrice);
  const clampedDownPct = Math.min(95, Math.max(0, input.downPaymentPercent));
  const downPaymentAmount = Math.round((price * clampedDownPct) / 100);
  const principal = Math.max(0, price - downPaymentAmount);
  const months = Math.max(12, Math.round(input.termMonths));
  const monthlyRate = Math.max(0, input.annualInterestRate) / 100 / 12;

  let monthlyPayment = 0;
  if (principal === 0) {
    monthlyPayment = 0;
  } else if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPayment = (principal * (monthlyRate * factor)) / (factor - 1);
  }

  const totalLoanPayments = monthlyPayment * months;
  const totalFinancingCost = Math.max(0, totalLoanPayments - principal);
  const totalPayable = downPaymentAmount + totalLoanPayments;

  return {
    downPaymentAmount,
    financingAmount: principal,
    monthlyPayment: Math.round(monthlyPayment),
    totalFinancingCost: Math.round(totalFinancingCost),
    totalPayable: Math.round(totalPayable),
  };
}

export function buildWhatsAppConciergeUrl(context?: string): string {
  const message = context
    ? `Good day Aurelia Private Sales — I would like to enquire regarding ${context}.`
    : 'Good day Aurelia Private Sales — I would like to arrange a private consultation.';
  return `https://wa.me/442079460821?text=${encodeURIComponent(message)}`;
}
