import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & { children: ReactNode };

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('rounded-3xl border border-slate-200/70 bg-white/90 shadow-soft backdrop-blur', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-slate-200/60 p-6 pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-base font-semibold tracking-tight text-slate-950', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('mt-1 text-sm leading-6 text-slate-500', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-4', className)} {...props} />;
}
