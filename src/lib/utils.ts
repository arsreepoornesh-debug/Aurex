import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStringOrDate: string | Date | null | undefined): string {
  if (!dateStringOrDate) return '—';
  const d = new Date(dateStringOrDate);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStringOrDate: string | Date | null | undefined): string {
  if (!dateStringOrDate) return '—';
  const d = new Date(dateStringOrDate);
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function generateClientId(counter: number = 1): string {
  const year = new Date().getFullYear();
  return `AUR-${year}-${String(counter).padStart(4, '0')}`;
}

export function generateInvoiceNumber(counter: number = 1): string {
  const year = new Date().getFullYear();
  return `INV-AUR-${year}-${String(counter).padStart(4, '0')}`;
}

export function getServiceMaxCapacity(serviceType: string): number {
  switch (serviceType) {
    case 'SEMI_PRIVATE':
      return 4;
    case 'PREMIUM':
      return 1;
    case 'ASSESSMENT':
      return 1;
    case 'CONSULTATION':
      return 1;
    default:
      return 4;
  }
}
