import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  delta?: string;
  icon: ReactNode;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
};

const accentClasses: Record<NonNullable<StatCardProps['accent']>, string> = {
  indigo: 'from-indigo-500 to-violet-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  slate: 'from-slate-600 to-slate-900',
};

export function StatCard({ title, value, delta, icon, accent = 'indigo' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          {delta ? <p className="mt-2 text-xs font-medium text-slate-500">{delta}</p> : null}
        </div>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft', accentClasses[accent])}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
