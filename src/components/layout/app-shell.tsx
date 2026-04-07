import type { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Role } from '@/types/auth';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { useUiStore } from '@/store/uiStore';
import { cn } from '@/utils/cn';

type AppShellProps = {
  role: Role;
  title: string;
  description: string;
  children: ReactNode;
};

export function AppShell({ role, title, description, children }: AppShellProps) {
  const mobileSidebarOpen = useUiStore((state) => state.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-950">
      <div className="flex min-h-screen">
        <div className="hidden lg:block lg:sticky lg:top-0 lg:h-screen">
          <Sidebar role={role} />
        </div>

        <AnimatePresence>
          {mobileSidebarOpen ? (
            <div className="fixed inset-0 z-50 lg:hidden">
              <button className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} aria-label="Close sidebar overlay" />
              <div className="absolute left-0 top-0 h-full w-[86%] max-w-[320px] shadow-soft">
                <div className="h-full">
                  <Sidebar role={role} onNavigate={() => setMobileSidebarOpen(false)} />
                </div>
              </div>
            </div>
          ) : null}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar title={title} description={description} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className={cn('mx-auto w-full max-w-[1600px]')}>{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
