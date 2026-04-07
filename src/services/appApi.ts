import type { SessionUser, User, Role } from '@/types/auth';
import type { LeaveFormInput, LeaveRequest, LeaveStatus } from '@/types/leave';
import type { NotificationItem } from '@/types/notification';
import type { AuditLog } from '@/types/audit';
import { getLeaveDays } from '@/utils/date';
import * as mockApi from './mockApi';

type StudentDashboardData = {
  requests: LeaveRequest[];
  metrics: {
    pending: number;
    approved: number;
    rejected: number;
    remaining: number;
  };
};

type FacultyDashboardData = {
  requests: LeaveRequest[];
  metrics: {
    pending: number;
    approved: number;
    rejected: number;
  };
  activity: {
    averageTurnaroundMinutes: number;
    completeness: number;
    escalations: number;
    reviewedCount: number;
    requestCount: number;
    completeCount: number;
  };
};

type AdminDashboardData = {
  users: User[];
  requests: LeaveRequest[];
  notifications: NotificationItem[];
  audits: AuditLog[];
  metrics: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    activeStudents: number;
  };
};

type LeaveAnalyticsData = {
  statusCounts: Record<LeaveStatus, number>;
  typeCounts: Record<string, number>;
};

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000/api';
const authTokenKey = 'leaveflow.token';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getConflictMessage(path: string, serverMessage?: string) {
  if (path === '/auth/register') {
    return 'An account with this email already exists. Please sign in instead.';
  }

  return serverMessage ?? 'Conflict detected. Please refresh and try again.';
}

function hasWindow() {
  return typeof window !== 'undefined';
}

function getAuthToken() {
  if (!hasWindow()) {
    return null;
  }

  return window.localStorage.getItem(authTokenKey);
}

function setAuthToken(token: string | null) {
  if (!hasWindow()) {
    return;
  }

  if (token) {
    window.localStorage.setItem(authTokenKey, token);
  } else {
    window.localStorage.removeItem(authTokenKey);
  }
}

async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.status === 409) {
      throw new ApiError(getConflictMessage(path, errorBody?.error), response.status);
    }

    throw new ApiError(errorBody?.error ?? `Request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as T;
}

function toStudentDashboard(data: { leaves: LeaveRequest[]; stats: { pending: number; approved: number; rejected: number } }): StudentDashboardData {
  const approvedDays = data.leaves
    .filter((request) => request.status === 'approved')
    .reduce((sum, request) => sum + getLeaveDays(request.startDate, request.endDate), 0);

  return {
    requests: data.leaves,
    metrics: {
      pending: data.stats.pending,
      approved: data.stats.approved,
      rejected: data.stats.rejected,
      remaining: Math.max(0, 12 - approvedDays),
    },
  };
}

function toFacultyDashboard(data: FacultyDashboardData): FacultyDashboardData {
  return data;
}

function toAdminDashboard(data: {
  users: User[];
  leaves: LeaveRequest[];
  audits: AuditLog[];
  metrics: {
    totalUsers: number;
    activeStudents: number;
    totalLeaveRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
}): AdminDashboardData {
  return {
    users: data.users,
    requests: data.leaves,
    notifications: [],
    audits: data.audits,
    metrics: {
      total: data.metrics.totalLeaveRequests,
      pending: data.metrics.pendingRequests,
      approved: data.metrics.approvedRequests,
      rejected: data.metrics.rejectedRequests,
      activeStudents: data.metrics.activeStudents,
    },
  };
}

export async function authenticate(email: string, password: string): Promise<SessionUser> {
  if (!USE_BACKEND) {
    return mockApi.authenticate(email, password);
  }

  const response = await fetchJson<{ token: string; user: SessionUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(response.token);
  return response.user;
}

export async function registerUser(input: { name: string; email: string; password: string; role: Role; department: string; title: string }): Promise<SessionUser> {
  if (!USE_BACKEND) {
    return mockApi.registerUser(input);
  }

  const response = await fetchJson<{ token: string; user: SessionUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  setAuthToken(response.token);
  return response.user;
}

export async function submitLeaveRequest(user: SessionUser, form: LeaveFormInput): Promise<LeaveRequest> {
  if (!USE_BACKEND) {
    return mockApi.submitLeaveRequest(user, form);
  }

  return fetchJson<LeaveRequest>('/leave/submit', {
    method: 'POST',
    body: JSON.stringify(form),
  });
}

export async function reviewLeaveRequest(input: { requestId: string; status: Exclude<LeaveStatus, 'pending'>; remarks: string; reviewerName: string }): Promise<LeaveRequest> {
  if (!USE_BACKEND) {
    return mockApi.reviewLeaveRequest(input);
  }

  return fetchJson<LeaveRequest>('/leave/review', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function bulkReviewLeaveRequests(input: { requestIds: string[]; status: Exclude<LeaveStatus, 'pending'>; remarks: string; reviewerName: string }): Promise<{ count: number; leaves: LeaveRequest[] }> {
  if (!USE_BACKEND) {
    const result = mockApi.bulkReviewLeaveRequests(input);
    return {
      count: result.count,
      leaves: result.affectedIds.map((id) => mockApi.listLeaves().find((request) => request.id === id) as LeaveRequest).filter(Boolean),
    };
  }

  const response = await fetchJson<{ count: number; leaves: LeaveRequest[] }>('/leave/bulk-review', {
    method: 'POST',
    body: JSON.stringify({ requestIds: input.requestIds, status: input.status, remarks: input.remarks }),
  });
  return response;
}

export async function getStudentDashboard(userId: string): Promise<StudentDashboardData> {
  if (!USE_BACKEND) {
    return mockApi.getStudentDashboard(userId);
  }

  const response = await fetchJson<{ leaves: LeaveRequest[]; stats: { pending: number; approved: number; rejected: number } }>('/leave/student-dashboard');
  return toStudentDashboard(response);
}

export async function getFacultyDashboard(): Promise<FacultyDashboardData> {
  if (!USE_BACKEND) {
    return mockApi.getFacultyDashboard() as FacultyDashboardData;
  }

  const response = await fetchJson<FacultyDashboardData>('/leave/faculty-dashboard');
  return toFacultyDashboard(response);
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  if (!USE_BACKEND) {
    return mockApi.getAdminDashboard() as AdminDashboardData;
  }

  const response = await fetchJson<{
    users: User[];
    leaves: LeaveRequest[];
    audits: AuditLog[];
    metrics: {
      totalUsers: number;
      activeStudents: number;
      totalLeaveRequests: number;
      pendingRequests: number;
      approvedRequests: number;
      rejectedRequests: number;
    };
  }>('/admin/dashboard');

  return toAdminDashboard(response);
}

export async function toggleUserActiveStatus(userId: string): Promise<User> {
  if (!USE_BACKEND) {
    return mockApi.toggleUserActiveStatus(userId);
  }

  return fetchJson<User>(`/admin/users/${userId}/toggle-status`, {
    method: 'PUT',
  });
}

export async function getLeaveAnalytics(): Promise<LeaveAnalyticsData> {
  if (!USE_BACKEND) {
    return mockApi.getLeaveAnalytics() as LeaveAnalyticsData;
  }

  const response = await fetchJson<{
    statusDistribution: Record<LeaveStatus, number>;
    typeDistribution: Record<string, number>;
  }>('/admin/analytics/leaves');

  return {
    statusCounts: response.statusDistribution,
    typeCounts: response.typeDistribution,
  };
}

export async function listNotifications(): Promise<NotificationItem[]> {
  if (!USE_BACKEND) {
    return mockApi.listNotifications();
  }

  return fetchJson<NotificationItem[]>('/notifications');
}

export async function markNotificationsRead(notificationIds: string[]): Promise<void> {
  if (!USE_BACKEND) {
    mockApi.markNotificationsRead(notificationIds);
    return;
  }

  await fetchJson<{ count: number }>('/notifications/mark-read', {
    method: 'POST',
    body: JSON.stringify({ notificationIds }),
  });
}

export function logout() {
  setAuthToken(null);
}
