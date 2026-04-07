import { useEffect, useMemo, useState } from 'react';
import { Clock3, Filter, Medal, Plus, ShieldCheck, SunMedium } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionHeader } from '@/components/shared/section-header';
import { StatCard } from '@/components/shared/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatRelative, getLeaveDays } from '@/utils/date';
import { useAuthStore } from '@/store/authStore';
import { submitLeaveRequest, getStudentDashboard } from '@/services/appApi';
import { useUiStore } from '@/store/uiStore';
import type { LeaveFormInput, LeaveRequest, LeaveStatus } from '@/types/leave';

type StudentDashboardData = Awaited<ReturnType<typeof getStudentDashboard>>;

const defaultForm: LeaveFormInput = {
  leaveType: 'sick',
  startDate: '',
  endDate: '',
  reason: '',
};

export function StudentDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const pushToast = useUiStore((state) => state.pushToast);
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(defaultForm);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (user) {
        const dashboard = await getStudentDashboard(user.id);
        if (active) {
          setData(dashboard);
        }
      }

      if (active) {
        setLoading(false);
      }
    }

    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 340);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [user]);

  const filteredRequests = useMemo(() => {
    if (!data) {
      return [] as LeaveRequest[];
    }

    return data.requests.filter((request) => {
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      const searchValue = `${request.leaveType} ${request.reason} ${request.status}`.toLowerCase();
      const matchesQuery = searchValue.includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [data, query, statusFilter]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      await submitLeaveRequest(user, form);
      setForm(defaultForm);
      setData(await getStudentDashboard(user.id));
      pushToast({ title: 'Leave request submitted', description: 'Faculty will review it shortly.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell role="student" title="Student Dashboard" description="Apply leave, track approvals, and stay ahead of deadlines.">
      <div className="space-y-8">
        <section id="overview" className="grid gap-4 xl:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </>
          ) : data ? (
            <>
              <StatCard title="Pending requests" value={data.metrics.pending} delta="Awaiting faculty action" icon={<Clock3 className="h-5 w-5" />} accent="amber" />
              <StatCard title="Approved leaves" value={data.metrics.approved} delta="This academic cycle" icon={<ShieldCheck className="h-5 w-5" />} accent="emerald" />
              <StatCard title="Rejected requests" value={data.metrics.rejected} delta="Improving with better documentation" icon={<Medal className="h-5 w-5" />} accent="rose" />
              <StatCard title="Leave balance" value={`${data.metrics.remaining} days`} delta="Soft quota for the current term" icon={<SunMedium className="h-5 w-5" />} accent="indigo" />
            </>
          ) : null}
        </section>

        <section id="apply-leave" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <SectionHeader title="Apply leave" description="Submit a polished request with dates, type, and reason." />
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Leave type">
                    <Select value={form.leaveType} onChange={(event) => setForm({ ...form, leaveType: event.target.value as LeaveFormInput['leaveType'] })}>
                      <option value="sick">Sick</option>
                      <option value="casual">Casual</option>
                      <option value="personal">Personal</option>
                      <option value="emergency">Emergency</option>
                      <option value="conference">Conference</option>
                    </Select>
                  </Field>
                  <Field label="Days">
                    <div className="flex h-11 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                      {form.startDate && form.endDate ? `${getLeaveDays(form.startDate, form.endDate)} day(s)` : 'Select a date range'}
                    </div>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Start date">
                    <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
                  </Field>
                  <Field label="End date">
                    <Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
                  </Field>
                </div>

                <Field label="Reason">
                  <Textarea
                    value={form.reason}
                    onChange={(event) => setForm({ ...form, reason: event.target.value })}
                    placeholder="Explain the context clearly so approval is fast and predictable."
                  />
                </Field>

                <Button className="w-full sm:w-auto" size="lg" type="submit" disabled={submitting}>
                  <Plus className="h-4 w-4" />
                  {submitting ? 'Submitting...' : 'Submit request'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionHeader title="Status snapshot" description="A quick view of the current leave lifecycle." />
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Fast turnaround', value: 'Faculty decisions within 24h', tone: 'info' as const },
                { label: 'Travel-safe', value: 'Attach proof when required', tone: 'success' as const },
                { label: 'Visibility', value: 'Track every status change', tone: 'warning' as const },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.value}</p>
                    </div>
                    <Badge tone={item.tone}>{item.label}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="history" className="space-y-5">
          <SectionHeader title="Leave history" description="Filter requests by status and search by reason or type.">
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm">
                <Filter className="h-4 w-4" />
                <span>{filteredRequests.length} result(s)</span>
              </div>
              <Input className="w-[180px] sm:w-[240px]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search history" />
            </div>
          </SectionHeader>

          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${statusFilter === status ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
              >
                {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-3xl" />
              <Skeleton className="h-20 rounded-3xl" />
              <Skeleton className="h-20 rounded-3xl" />
            </div>
          ) : filteredRequests.length > 0 ? (
            <Card>
              <CardContent className="overflow-x-auto p-0">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                    <tr>
                      <Th>Type</Th>
                      <Th>Date range</Th>
                      <Th>Days</Th>
                      <Th>Status</Th>
                      <Th>Submitted</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="cursor-pointer transition hover:bg-slate-50/80" onClick={() => setSelectedRequest(request)}>
                        <Td>{request.leaveType}</Td>
                        <Td>
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </Td>
                        <Td>{getLeaveDays(request.startDate, request.endDate)}</Td>
                        <Td>
                          <Badge tone={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'danger'}>
                            {request.status}
                          </Badge>
                        </Td>
                        <Td>{formatRelative(request.submittedAt)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title="No matching leave requests"
              description="Try a different filter or submit a new request to get started."
              actionLabel="Apply leave"
              onAction={() => window.location.hash = '#apply-leave'}
            />
          )}
        </section>
      </div>

      <Dialog
        open={Boolean(selectedRequest)}
        title={selectedRequest ? `${selectedRequest.leaveType} leave request` : 'Leave request'}
        description="Track decision status, reviewer notes, and submission details."
        onClose={() => setSelectedRequest(null)}
      >
        {selectedRequest ? (
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Date range</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)}
              </p>
              <p className="mt-2 text-sm text-slate-600">Duration: {getLeaveDays(selectedRequest.startDate, selectedRequest.endDate)} day(s)</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">Reason</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedRequest.reason}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-500">Status</p>
                <div className="mt-2">
                  <Badge tone={selectedRequest.status === 'approved' ? 'success' : selectedRequest.status === 'pending' ? 'warning' : 'danger'}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-500">Submitted</p>
                <p className="mt-2 text-sm text-slate-700">{formatRelative(selectedRequest.submittedAt)}</p>
              </div>
            </div>

            {selectedRequest.remarks ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">Reviewer remarks</p>
                <p className="mt-2 text-sm leading-6 text-emerald-900">{selectedRequest.remarks}</p>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                No reviewer remarks yet. The request is still being processed.
              </div>
            )}
          </div>
        ) : null}
      </Dialog>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-4 font-medium">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-4 text-sm text-slate-700">{children}</td>;
}
