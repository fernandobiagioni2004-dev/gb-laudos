import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addBusinessDays(dateStr: string, days: number): Date {
  const date = new Date(dateStr + 'T12:00:00');
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return date;
}

export function calcDeadline(createdAt: string): Date {
  return addBusinessDays(createdAt, 2);
}
