import { cn } from '@/utils/cn';
import type { HTMLAttributes } from 'react';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-shimmer rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:400%_100%]', className)} {...props} />;
}
