import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInMinutes } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
}

export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(dateString: string): {
  date: string;
  time: string;
} {
  const date = new Date(dateString);
  return {
    date: format(date, 'dd MMM yyyy'),
    time: format(date, 'HH:mm'),
  };
}

export function calculateStayDuration(departure: string, returnDate: string): number {
  const dep = new Date(departure);
  const ret = new Date(returnDate);
  return Math.ceil(differenceInMinutes(ret, dep) / (60 * 24));
}

export function getStopsText(stops: number): string {
  if (stops === 0) return 'Direct';
  if (stops === 1) return '1 Stop';
  return `${stops} Stops`;
}