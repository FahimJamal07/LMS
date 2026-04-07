import { ChevronLeft, ChevronRight, PanelsTopLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import { navItemsByRole } from '@/utils/navigation';
import type { Role } from '@/types/auth';
import { useUiStore } from '@/store/uiStore';
import { roleLabels } from '@/utils/roles';

type SidebarProps = {
  role: Role;
  onNavigate?: () => void;
};

export function Sidebar({ role, onNavigate }: SidebarProps) {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const setCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const setMobileOpen = useUiStore((state) => state.setMobileSidebarOpen);
  const [activeHash, setActiveHash] = useState<string>(window.location.hash || '#overview');

  useEffect(() => {
    function syncHash() {
      setActiveHash(window.location.hash || '#overview');
    }

    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  function goToSection(hash: string) {
    const sectionId = hash.replace('#', '');
    const target = document.getElementById(sectionId);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', hash);
      setActiveHash(hash);
    }

    onNavigate?.();
  }

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-[84px]' : 'w-[290px]',
      )}
    >
      <div className="relative flex items-center justify-between gap-3 border-b border-slate-200/60 px-5 py-5">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-soft">
            <PanelsTopLeft className="h-5 w-5" />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-sm font-semibold text-slate-950">LeaveFlow</p>
              <p className="text-xs text-slate-500">{roleLabels[role]} dashboard</p>
            </div>
          ) : null}
        </div>
        <div className="absolute right-2 top-1/2 hidden -translate-y-1/2 lg:block">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="lg:hidden">
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItemsByRole[role].map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => goToSection(item.href)}
            className={
              cn(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition duration-200',
                activeHash === item.href ? 'bg-slate-950 text-white shadow-soft' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                collapsed && 'justify-center px-3',
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-200/60 p-4">
        <div className={cn('rounded-3xl bg-slate-950 px-4 py-4 text-white shadow-soft', collapsed && 'px-3')}>
          {!collapsed ? (
            <>
              <p className="text-sm font-medium">Smart workflow</p>
              <p className="mt-1 text-xs leading-5 text-slate-300">Approvals, analytics, and notifications in one calm workspace.</p>
            </>
          ) : (
            <div className="flex justify-center text-xs font-medium">SW</div>
          )}
        </div>
      </div>
    </aside>
  );
}
