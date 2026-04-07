import { BarChart3, CalendarCheck2, LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
import type { Role } from '@/types/auth';

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export const navItemsByRole: Record<Role, NavItem[]> = {
  student: [
    { label: 'Overview', href: '#overview', icon: LayoutDashboard },
    { label: 'Apply Leave', href: '#apply-leave', icon: CalendarCheck2 },
    { label: 'History', href: '#history', icon: ShieldCheck },
  ],
  faculty: [
    { label: 'Overview', href: '#overview', icon: LayoutDashboard },
    { label: 'Requests', href: '#requests', icon: CalendarCheck2 },
    { label: 'Team', href: '#team', icon: Users },
  ],
  admin: [
    { label: 'Overview', href: '#overview', icon: LayoutDashboard },
    { label: 'Analytics', href: '#analytics', icon: BarChart3 },
    { label: 'Users', href: '#users', icon: Users },
  ],
};
