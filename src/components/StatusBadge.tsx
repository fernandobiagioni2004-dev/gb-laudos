import React from 'react';
import { cn } from '@/lib/utils';
import type { ExamStatus } from '@/data/mockData';

const variants: Record<ExamStatus, string> = {
  'Disponível':  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Em análise':  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'Finalizado':  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'Cancelado':   'bg-red-500/15 text-red-400 border-red-500/30',
};

const dots: Record<ExamStatus, string> = {
  'Disponível': 'bg-emerald-400',
  'Em análise': 'bg-amber-400',
  'Finalizado': 'bg-blue-400',
  'Cancelado':  'bg-red-400',
};

export const StatusBadge = React.forwardRef<
  HTMLSpanElement,
  { status: ExamStatus; className?: string }
>(({ status, className }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
      variants[status],
      className,
    )}
  >
    <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dots[status])} />
    {status}
  </span>
));
StatusBadge.displayName = 'StatusBadge';
