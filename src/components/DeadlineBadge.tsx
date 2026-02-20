import { calcDeadline } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeadlineBadgeProps {
  createdAt: string;
  urgent?: boolean;
  urgentDate?: string;
  urgentTime?: string;
  className?: string;
}

export function DeadlineBadge({ createdAt, urgent, urgentDate, urgentTime, className }: DeadlineBadgeProps) {
  const now = new Date();
  let deadline: Date;

  if (urgent && urgentDate) {
    const timePart = urgentTime || '23:59';
    deadline = new Date(`${urgentDate}T${timePart}:00`);
  } else {
    deadline = calcDeadline(createdAt);
  }

  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  let colorClasses: string;
  if (diffHours < 0) {
    colorClasses = 'bg-red-500/15 text-red-400 border-red-500/30';
  } else if (diffHours < 12) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else {
    colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }

  const day = String(deadline.getDate()).padStart(2, '0');
  const month = String(deadline.getMonth() + 1).padStart(2, '0');
  const year = deadline.getFullYear();
  const hours = String(deadline.getHours()).padStart(2, '0');
  const minutes = String(deadline.getMinutes()).padStart(2, '0');
  const formatted = `${day}/${month}/${year} às ${hours}:${minutes}`;

  const label = diffHours < 0 ? 'Vencido' : 'Prazo';

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
      colorClasses,
      className
    )}>
      <Clock className="h-3 w-3" />
      {label}: {formatted}
    </span>
  );
}
