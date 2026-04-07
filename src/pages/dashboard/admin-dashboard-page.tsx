import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, FileText, ShieldAlert, Users } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SectionHeader } from '@/components/shared/section-header';
import { StatCard } from '@/components/shared/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelative, getLeaveDays } from '@/utils/date';
import { getAdminDashboard, getLeaveAnalytics, toggleUserActiveStatus } from '@/services/appApi';
import { EmptyState } from '@/components/shared/empty-state';
import { useUiStore } from '@/store/uiStore';
import type { Role } from '@/types/auth';
import type { AuditLog } from '@/types/audit';

type RoleFilter = Role | 'all';
type AuditActionFilter = AuditLog['action'] | 'all';
type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboard>>;
type LeaveAnalyticsData = Awaited<ReturnType<typeof getLeaveAnalytics>>;

export function AdminDashboardPage() {
  const pushToast = useUiStore((state) => state.pushToast);
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [analytics, setAnalytics] = useState<LeaveAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [auditQuery, setAuditQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<AuditActionFilter>('all');

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const [dashboard, analyticsData] = await Promise.all([getAdminDashboard(), getLeaveAnalytics()]);

      if (active) {
        setData(dashboard);
        setAnalytics(analyticsData);
        setLoading(false);
      }
    }

    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 320);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const filteredUsers = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.users.filter((user) => {
      const matchesQuery = `${user.name} ${user.email} ${user.department}`.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.active : !user.active);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [data, query, roleFilter, statusFilter]);

  const filteredAudits = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.audits.filter((audit) => {
      const matchesAction = auditActionFilter === 'all' || audit.action === auditActionFilter;
      const matchesQuery = `${audit.actorName} ${audit.message} ${audit.entity}`.toLowerCase().includes(auditQuery.toLowerCase());
      return matchesAction && matchesQuery;
    });
  }, [data, auditActionFilter, auditQuery]);

  const statusCounts = analytics?.statusCounts ?? { pending: 0, approved: 0, rejected: 0 };
  const typeCounts = analytics?.typeCounts ?? {};

  const statusSeries = [
    { name: 'Pending', value: statusCounts.pending },
    { name: 'Approved', value: statusCounts.approved },
    { name: 'Rejected', value: statusCounts.rejected },
  ];

  const typeSeries = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  async function refreshDashboard() {
    const [dashboard, analyticsData] = await Promise.all([getAdminDashboard(), getLeaveAnalytics()]);
    setData(dashboard);
    setAnalytics(analyticsData);
  }

  async function handleToggleUser(userId: string) {
    try {
      const user = await toggleUserActiveStatus(userId);
      await refreshDashboard();
      pushToast({
        title: `User ${user.active ? 'activated' : 'disabled'}`,
        description: `${user.name} is now ${user.active ? 'active' : 'disabled'}.`,
      });
    } catch (error) {
      pushToast({
        title: 'Action blocked',
        description: error instanceof Error ? error.message : 'Unable to update user status.',
      });
    }
  }

  return (
    <AppShell role="admin" title="Admin Dashboard" description="Monitor the entire leave operation with analytics, trends, and user insight.">
      <div className="space-y-8">
        <section id="overview" className="grid gap-4 xl:grid-cols-5">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </>
          ) : data ? (
            <>
              <StatCard title="Total requests" value={data.metrics.total} delta="Across all roles" icon={<FileText className="h-5 w-5" />} accent="indigo" />
              <StatCard title="Pending" value={data.metrics.pending} delta="Needs resolution" icon={<Activity className="h-5 w-5" />} accent="amber" />
              <StatCard title="Approved" value={data.metrics.approved} delta="Healthy throughput" icon={<ShieldAlert className="h-5 w-5" />} accent="emerald" />
              <StatCard title="Rejected" value={data.metrics.rejected} delta="Process corrections" icon={<ShieldAlert className="h-5 w-5" />} accent="rose" />
              <StatCard title="Students" value={data.metrics.activeStudents} delta="Active in the system" icon={<Users className="h-5 w-5" />} accent="slate" />
            </>
          ) : null}
        </section>

        <section id="analytics" className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status distribution</CardTitle>
              <CardDescription>Approval flow across the current dataset.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusSeries}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0f172a" radius={[14, 14, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave volume by type</CardTitle>
              <CardDescription>Operational mix for planning and policy tuning.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={typeSeries}>
                  <defs>
                    <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="url(#fillVolume)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <section id="users" className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <SectionHeader title="User management" description="Search, filter, and manage account availability.">
                <div className="flex flex-wrap items-center gap-2">
                  <Input className="w-[220px]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" />
                  <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}>
                    <option value="all">All roles</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </Select>
                  <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'disabled')}>
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </Select>
                </div>
              </SectionHeader>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {filteredUsers.length ? (
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <Th>Name</Th>
                      <Th>Role</Th>
                      <Th>Department</Th>
                      <Th>Title</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80">
                        <Td>
                          <div>
                            <p className="font-medium text-slate-950">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </Td>
                        <Td>
                          <Badge tone={user.role === 'admin' ? 'danger' : user.role === 'faculty' ? 'info' : 'success'}>{user.role}</Badge>
                        </Td>
                        <Td>{user.department}</Td>
                        <Td>{user.title}</Td>
                        <Td>
                          <Badge tone={user.active ? 'success' : 'danger'}>{user.active ? 'active' : 'disabled'}</Badge>
                        </Td>
                        <Td>
                          <Button
                            variant={user.active ? 'danger' : 'secondary'}
                            size="sm"
                            onClick={() => handleToggleUser(user.id)}
                          >
                            {user.active ? 'Disable' : 'Activate'}
                          </Button>
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState title="No users match your filters" description="Try adjusting role, status, or search criteria." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionHeader title="Audit timeline" description="Track every critical system action with actor context.">
                <div className="flex flex-wrap items-center gap-2">
                  <Input className="w-[220px]" value={auditQuery} onChange={(event) => setAuditQuery(event.target.value)} placeholder="Search audit logs" />
                  <Select value={auditActionFilter} onChange={(event) => setAuditActionFilter(event.target.value as AuditActionFilter)}>
                    <option value="all">All actions</option>
                    <option value="leave.submitted">leave.submitted</option>
                    <option value="leave.reviewed">leave.reviewed</option>
                    <option value="leave.bulk-reviewed">leave.bulk-reviewed</option>
                    <option value="user.registered">user.registered</option>
                    <option value="user.status-toggled">user.status-toggled</option>
                  </Select>
                </div>
              </SectionHeader>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredAudits.length ? (
                filteredAudits.slice(0, 10).map((audit) => (
                  <div key={audit.id} className="rounded-3xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-950">{audit.actorName}</p>
                      <Badge tone="info">{audit.action}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{audit.message}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{audit.entity}</span>
                      <span>{formatRelative(audit.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No audits match your filters" description="Try adjusting search text or action category." />
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {data?.requests.slice(0, 3).map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>{request.userName}</CardTitle>
                <CardDescription>
                  {request.leaveType} · {getLeaveDays(request.startDate, request.endDate)} day(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'danger'}>{request.status}</Badge>
                  <p className="text-xs text-slate-400">{formatRelative(request.submittedAt)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 text-sm text-slate-700">{children}</td>;
}
