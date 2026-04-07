import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, MessageSquareMore, XCircle } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { SectionHeader } from '@/components/shared/section-header';
import { StatCard } from '@/components/shared/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatDate, getLeaveDays } from '@/utils/date';
import { bulkReviewLeaveRequests, getFacultyDashboard, reviewLeaveRequest } from '@/services/appApi';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import type { LeaveRequest } from '@/types/leave';

type FacultyDashboardData = Awaited<ReturnType<typeof getFacultyDashboard>>;

export function FacultyDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const pushToast = useUiStore((state) => state.pushToast);
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [remarks, setRemarks] = useState('Approved. Please share class notes and catch up on assignments.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      const dashboard = await getFacultyDashboard();
      if (active) {
        setData(dashboard);
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

  const pendingRequests = useMemo(() => data?.requests.filter((request) => request.status === 'pending') ?? [], [data]);
  const activityCards = useMemo(() => {
    if (!data) {
      return [];
    }

    const averageTurnaroundHours = Math.round(data.activity.averageTurnaroundMinutes / 60);

    return [
      {
        title: 'Average turnaround',
        value: `${averageTurnaroundHours}h`,
        note: data.activity.reviewedCount > 0 ? `Across ${data.activity.reviewedCount} reviewed decision${data.activity.reviewedCount === 1 ? '' : 's'}` : 'No reviewed decisions yet',
      },
      {
        title: 'Document completeness',
        value: `${data.activity.completeness}%`,
        note: `${data.activity.completeCount}/${data.activity.requestCount} requests include detailed reasons`,
      },
      {
        title: 'Escalations',
        value: String(data.activity.escalations),
        note: 'Rejected or stale pending requests needing admin follow-up',
      },
    ];
  }, [data]);

  useEffect(() => {
    const validIds = new Set(pendingRequests.map((request) => request.id));
    setSelectedIds((previous) => previous.filter((id) => validIds.has(id)));
    if (selected && !validIds.has(selected.id)) {
      setSelected(null);
    }
  }, [pendingRequests, selected]);

  async function handleDecision(status: 'approved' | 'rejected') {
    if (!selected || !user) return;

    await reviewLeaveRequest({
      requestId: selected.id,
      status,
      remarks,
      reviewerName: user.name,
    });
    setSelected(null);
    setData(await getFacultyDashboard());
    pushToast({ title: `Request ${status}`, description: `${selected.userName}'s request has been updated.` });
  }

  function toggleBulkSelect(requestId: string) {
    setSelectedIds((previous) => (previous.includes(requestId) ? previous.filter((id) => id !== requestId) : [...previous, requestId]));
  }

  async function handleBulkDecision(status: 'approved' | 'rejected') {
    if (!user || selectedIds.length === 0) {
      return;
    }

    try {
      const result = await bulkReviewLeaveRequests({
        requestIds: selectedIds,
        status,
        remarks,
        reviewerName: user.name,
      });

      setSelectedIds([]);
      setSelected(null);
      setData(await getFacultyDashboard());
      pushToast({
        title: `Bulk ${status} complete`,
        description: `${result.count} request(s) updated.`,
      });
    } catch (error) {
      pushToast({
        title: 'Bulk action blocked',
        description: error instanceof Error ? error.message : 'Unable to process bulk action.',
      });
    }
  }

  return (
    <AppShell role="faculty" title="Faculty Dashboard" description="Review pending requests and make decisions with confidence.">
      <div className="space-y-8">
        <section id="overview" className="grid gap-4 xl:grid-cols-3">
          {loading ? (
            <>
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </>
          ) : data ? (
            <>
              <StatCard title="Pending review" value={data.metrics.pending} delta="Waiting for your input" icon={<Clock3 className="h-5 w-5" />} accent="amber" />
              <StatCard title="Approved" value={data.metrics.approved} delta="Already cleared" icon={<CheckCircle2 className="h-5 w-5" />} accent="emerald" />
              <StatCard title="Rejected" value={data.metrics.rejected} delta="Needs supporting context" icon={<XCircle className="h-5 w-5" />} accent="rose" />
            </>
          ) : null}
        </section>

        <section id="requests" className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <SectionHeader title="Pending requests" description="Select a request to inspect details or use multi-select for fast bulk decisions.">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="warning">{pendingRequests.length} pending</Badge>
                  <Badge tone="info">{selectedIds.length} selected</Badge>
                  <Button variant="secondary" size="sm" disabled={selectedIds.length === 0} onClick={() => handleBulkDecision('approved')}>
                    Approve selected
                  </Button>
                  <Button variant="danger" size="sm" disabled={selectedIds.length === 0} onClick={() => handleBulkDecision('rejected')}>
                    Reject selected
                  </Button>
                </div>
              </SectionHeader>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-24 rounded-3xl" />
                  <Skeleton className="h-24 rounded-3xl" />
                  <Skeleton className="h-24 rounded-3xl" />
                </>
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelected(request)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${selected?.id === request.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(request.id)}
                          onChange={(event) => {
                            event.stopPropagation();
                            toggleBulkSelect(request.id);
                          }}
                          onClick={(event) => event.stopPropagation()}
                          className="mt-1 h-4 w-4 rounded border-slate-300"
                          aria-label={`Select ${request.userName} request`}
                        />
                        <div>
                          <p className="text-sm font-semibold">{request.userName}</p>
                          <p className={`mt-1 text-sm ${selected?.id === request.id ? 'text-slate-300' : 'text-slate-500'}`}>
                            {request.leaveType} leave · {getLeaveDays(request.startDate, request.endDate)} day(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedIds.includes(request.id) ? <Badge tone="info">selected</Badge> : null}
                        <Badge tone={selected?.id === request.id ? 'default' : 'warning'}>{request.status}</Badge>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState title="No pending requests" description="You are all caught up. New requests will appear here automatically." />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision panel</CardTitle>
              <CardDescription>Review dates, reason, and leave duration before approving or rejecting.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {selected ? (
                <>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-950">{selected.userName}</p>
                    <p className="mt-1 text-sm text-slate-500">{selected.department}</p>
                    <p className="mt-3 text-sm text-slate-600">
                      {formatDate(selected.startDate)} - {formatDate(selected.endDate)} · {getLeaveDays(selected.startDate, selected.endDate)} day(s)
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{selected.reason}</p>
                  </div>

                  <Field label="Remarks">
                    <Textarea value={remarks} onChange={(event) => setRemarks(event.target.value)} />
                  </Field>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button className="flex-1" onClick={() => handleDecision('approved')}>
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button className="flex-1" variant="danger" onClick={() => handleDecision('rejected')}>
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <MessageSquareMore className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-4 text-base font-semibold text-slate-950">Select a request</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">The decision panel becomes interactive once a leave request is selected.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section id="team" className="space-y-5">
          <SectionHeader title="Faculty activity" description="A lightweight operational view for mentor-style oversight." />
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {activityCards.map((item) => (
                <div key={item.title} className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-medium text-slate-500">{item.title}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
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
