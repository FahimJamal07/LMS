import { cn } from '@/utils/cn';
import type { HTMLAttributes, ReactNode } from 'react';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & { children: ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' | 'info' };

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};

export function Badge({ className, tone = 'default', children, ...props }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset', toneClasses[tone], className)} {...props}>
      {children}
    </span>
  );
}
