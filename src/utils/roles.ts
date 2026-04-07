import type { Role } from '@/types/auth';

export const roleLabels: Record<Role, string> = {
  student: 'Student',
  faculty: 'Faculty',
  admin: 'Admin',
};

export const roleRoutes: Record<Role, string> = {
  student: '/dashboard/student',
  faculty: '/dashboard/faculty',
  admin: '/dashboard/admin',
};
