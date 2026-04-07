import { cn } from '@/utils/cn';
import type { HTMLAttributes } from 'react';

type AvatarProps = HTMLAttributes<HTMLDivElement> & { seed: string };

export function Avatar({ className, seed, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 via-slate-700 to-indigo-700 text-sm font-semibold text-white shadow-soft',
        className,
      )}
      {...props}
    >
      {seed}
    </div>
  );
}
