import type { SessionUser, User, Role } from '@/types/auth';
import type { LeaveFormInput, LeaveRequest, LeaveStatus, LeaveType } from '@/types/leave';
import type { NotificationItem } from '@/types/notification';
import type { AuditLog } from '@/types/audit';
import { getLeaveDays } from '@/utils/date';

type AppState = {
  users: User[];
  leaves: LeaveRequest[];
  notifications: NotificationItem[];
  audits: AuditLog[];
};

const storageKey = 'leaveflow.db';

const seedUsers: User[] = [
  {
    id: 'u-admin',
    name: 'Avery Stone',
    email: 'admin@leaveflow.dev',
    password: 'Password123!',
    role: 'admin',
    title: 'Operations Admin',
    department: 'Registry',
    avatarSeed: 'AS',
    active: true,
  },
  {
    id: 'u-faculty',
    name: 'Dr. Elena Carter',
    email: 'faculty@leaveflow.dev',
    password: 'Password123!',
    role: 'faculty',
    title: 'Department Lead',
    department: 'Computer Science',
    avatarSeed: 'EC',
    active: true,
  },
  {
    id: 'u-student',
    name: 'Maya Fernandez',
    email: 'student@leaveflow.dev',
    password: 'Password123!',
    role: 'student',
    title: 'B.Tech CSE - Year 3',
    department: 'Computer Science',
    avatarSeed: 'MF',
    active: true,
  },
  {
    id: 'u-student-2',
    name: 'Noah Parker',
    email: 'noah.parker@leaveflow.dev',
    password: 'Password123!',
    role: 'student',
    title: 'BBA - Year 2',
    department: 'Business Administration',
    avatarSeed: 'NP',
    active: true,
  },
];

function nowISO(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60_000).toISOString();
}

function createLeave(
  user: User,
  data: Partial<LeaveRequest> & { leaveType: LeaveType; startDate: string; endDate: string; reason: string; status?: LeaveStatus },
): LeaveRequest {
  return {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    department: user.department,
    leaveType: data.leaveType,
    startDate: data.startDate,
    endDate: data.endDate,
    reason: data.reason,
    status: data.status ?? 'pending',
    remarks: data.remarks,
    reviewedBy: data.reviewedBy,
    reviewedAt: data.reviewedAt,
    submittedAt: data.submittedAt ?? nowISO(-1440),
  };
}

const seedLeaves: LeaveRequest[] = [
  createLeave(seedUsers[2], {
    leaveType: 'sick',
    startDate: '2026-04-08',
    endDate: '2026-04-10',
    reason: 'High fever and advised rest by the clinic.',
    status: 'pending',
    submittedAt: nowISO(-120),
  }),
  createLeave(seedUsers[2], {
    leaveType: 'personal',
    startDate: '2026-03-18',
    endDate: '2026-03-20',
    reason: 'Family event out of town.',
    status: 'approved',
    remarks: 'Approved. Keep up with assignments.',
    reviewedBy: seedUsers[1].name,
    reviewedAt: nowISO(-5400),
    submittedAt: nowISO(-10000),
  }),
  createLeave(seedUsers[2], {
    leaveType: 'conference',
    startDate: '2026-02-11',
    endDate: '2026-02-12',
    reason: 'Presented project at a regional student conference.',
    status: 'rejected',
    remarks: 'Submit supporting invitation letter next time.',
    reviewedBy: seedUsers[1].name,
    reviewedAt: nowISO(-20000),
    submittedAt: nowISO(-22000),
  }),
  createLeave(seedUsers[3], {
    leaveType: 'casual',
    startDate: '2026-04-14',
    endDate: '2026-04-15',
    reason: 'Medical appointment and travel.',
    status: 'pending',
    submittedAt: nowISO(-360),
  }),
];

const seedNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Student leave submitted',
    description: 'Maya Fernandez requested leave for 8 Apr - 10 Apr.',
    createdAt: nowISO(-60),
    read: false,
  },
  {
    id: 'n-2',
    title: 'Faculty approval complete',
    description: 'A leave request was approved with remarks.',
    createdAt: nowISO(-420),
    read: true,
  },
  {
    id: 'n-3',
    title: 'Admin insight updated',
    description: 'Weekly approval rate and utilization refreshed.',
    createdAt: nowISO(-840),
    read: true,
  },
];

const seedAudits: AuditLog[] = [
  {
    id: 'a-1',
    action: 'leave.submitted',
    entity: 'leave',
    entityId: 'seed-leave-1',
    actorName: 'Maya Fernandez',
    actorRole: 'student',
    message: 'Submitted sick leave for 8 Apr - 10 Apr.',
    createdAt: nowISO(-100),
  },
  {
    id: 'a-2',
    action: 'leave.reviewed',
    entity: 'leave',
    entityId: 'seed-leave-2',
    actorName: 'Dr. Elena Carter',
    actorRole: 'faculty',
    message: 'Approved personal leave with reviewer remarks.',
    createdAt: nowISO(-5200),
  },
  {
    id: 'a-3',
    action: 'user.registered',
    entity: 'user',
    entityId: 'u-student',
    actorName: 'Maya Fernandez',
    actorRole: 'student',
    message: 'Created a new account and joined LeaveFlow.',
    createdAt: nowISO(-22000),
  },
];

function cloneState(state: AppState): AppState {
  return {
    users: state.users.map((user) => ({ ...user })),
    leaves: state.leaves.map((leave) => ({ ...leave })),
    notifications: state.notifications.map((notification) => ({ ...notification })),
    audits: state.audits.map((audit) => ({ ...audit })),
  };
}

function getSeedState(): AppState {
  return cloneState({ users: seedUsers, leaves: seedLeaves, notifications: seedNotifications, audits: seedAudits });
}

function readState(): AppState {
  if (typeof window === 'undefined') {
    return getSeedState();
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    const initial = getSeedState();
    window.localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as AppState;
    // Keep old localStorage snapshots forward-compatible when new fields are added.
    parsed.users = parsed.users.map((user) => ({
      ...user,
      active: user.active ?? true,
    }));
    parsed.audits = parsed.audits ?? [];
    return parsed;
  } catch {
    const initial = getSeedState();
    window.localStorage.setItem(storageKey, JSON.stringify(initial));
    return initial;
  }
}

function writeState(state: AppState) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }
}

function recordAudit(state: AppState, input: Omit<AuditLog, 'id' | 'createdAt'>) {
  state.audits.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  });
}

function pushNotification(title: string, description: string) {
  const state = readState();
  state.notifications.unshift({
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: new Date().toISOString(),
    read: false,
  });
  writeState(state);
}

export function listUsers() {
  return readState().users;
}

export function listLeaves() {
  return readState().leaves;
}

export function listNotifications() {
  return readState().notifications;
}

export function listAuditLogs() {
  return readState().audits;
}

export function authenticate(email: string, password: string): SessionUser {
  const user = readState().users.find((entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (!user.active) {
    throw new Error('This account is currently disabled by an administrator.');
  }

  const { password: _password, ...sessionUser } = user;
  return sessionUser;
}

export function registerUser(input: { name: string; email: string; password: string; role: Role; department: string; title: string }): SessionUser {
  const state = readState();
  const exists = state.users.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase());

  if (exists) {
    throw new Error('An account with this email already exists.');
  }

  const user: User = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    password: input.password,
    role: input.role,
    department: input.department,
    title: input.title,
    avatarSeed: input.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join(''),
    active: true,
  };

  state.users.unshift(user);
  recordAudit(state, {
    action: 'user.registered',
    entity: 'user',
    entityId: user.id,
    actorName: user.name,
    actorRole: user.role,
    message: 'Created a new account and joined LeaveFlow.',
  });
  writeState(state);

  const { password: _password, ...sessionUser } = user;
  return sessionUser;
}

export function submitLeaveRequest(user: SessionUser, form: LeaveFormInput) {
  const state = readState();
  const request: LeaveRequest = {
    id: crypto.randomUUID(),
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    department: user.department,
    leaveType: form.leaveType,
    startDate: form.startDate,
    endDate: form.endDate,
    reason: form.reason,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  state.leaves.unshift(request);
  recordAudit(state, {
    action: 'leave.submitted',
    entity: 'leave',
    entityId: request.id,
    actorName: user.name,
    actorRole: user.role,
    message: `Submitted ${request.leaveType} leave for ${request.startDate} to ${request.endDate}.`,
  });
  writeState(state);
  pushNotification('Leave request submitted', `${user.name} submitted a ${request.leaveType} leave request.`);
  return request;
}

export function reviewLeaveRequest(input: { requestId: string; status: Exclude<LeaveStatus, 'pending'>; remarks: string; reviewerName: string }) {
  const state = readState();
  const request = state.leaves.find((entry) => entry.id === input.requestId);

  if (!request) {
    throw new Error('Leave request not found.');
  }

  request.status = input.status;
  request.remarks = input.remarks;
  request.reviewedBy = input.reviewerName;
  request.reviewedAt = new Date().toISOString();
  recordAudit(state, {
    action: 'leave.reviewed',
    entity: 'leave',
    entityId: request.id,
    actorName: input.reviewerName,
    actorRole: 'faculty',
    message: `${input.status} ${request.userName}'s ${request.leaveType} leave request.`,
  });
  writeState(state);
  pushNotification(
    `Leave request ${input.status}`,
    `${request.userName}'s ${request.leaveType} leave was ${input.status} by ${input.reviewerName}.`,
  );

  return request;
}

export function bulkReviewLeaveRequests(input: {
  requestIds: string[];
  status: Exclude<LeaveStatus, 'pending'>;
  remarks: string;
  reviewerName: string;
}) {
  const state = readState();
  const targets = state.leaves.filter((request) => input.requestIds.includes(request.id) && request.status === 'pending');

  if (targets.length === 0) {
    throw new Error('No pending leave requests selected.');
  }

  targets.forEach((request) => {
    request.status = input.status;
    request.remarks = input.remarks;
    request.reviewedBy = input.reviewerName;
    request.reviewedAt = new Date().toISOString();
  });

  recordAudit(state, {
    action: 'leave.bulk-reviewed',
    entity: 'system',
    entityId: `bulk-${crypto.randomUUID()}`,
    actorName: input.reviewerName,
    actorRole: 'faculty',
    message: `${input.status} ${targets.length} pending request(s) in bulk.`,
  });

  writeState(state);
  pushNotification(
    `Bulk ${input.status} completed`,
    `${input.reviewerName} ${input.status} ${targets.length} pending leave request(s).`,
  );

  return {
    count: targets.length,
    affectedIds: targets.map((request) => request.id),
  };
}

export function markNotificationsRead(notificationIds: string[]) {
  const state = readState();
  state.notifications = state.notifications.map((notification) =>
    notificationIds.includes(notification.id) ? { ...notification, read: true } : notification,
  );
  writeState(state);
}

export function getStudentDashboard(userId: string) {
  const state = readState();
  const requests = state.leaves.filter((request) => request.userId === userId);
  const pending = requests.filter((request) => request.status === 'pending').length;
  const approved = requests.filter((request) => request.status === 'approved').length;
  const rejected = requests.filter((request) => request.status === 'rejected').length;
  const consumedDays = requests
    .filter((request) => request.status === 'approved')
    .reduce((sum, request) => sum + getLeaveDays(request.startDate, request.endDate), 0);

  return {
    requests,
    metrics: {
      pending,
      approved,
      rejected,
      remaining: Math.max(0, 12 - consumedDays),
    },
  };
}

export function getFacultyDashboard() {
  const state = readState();
  const requests = state.leaves.filter((request) => request.status === 'pending' || request.status === 'approved');
  const pending = state.leaves.filter((request) => request.status === 'pending').length;
  const approved = state.leaves.filter((request) => request.status === 'approved').length;
  const rejected = state.leaves.filter((request) => request.status === 'rejected').length;
  const reviewedRequests = state.leaves.filter((request) => request.reviewedAt);
  const turnaroundMinutes = reviewedRequests
    .map((request) => new Date(request.reviewedAt as string).getTime() - new Date(request.submittedAt).getTime())
    .filter((value) => Number.isFinite(value) && value > 0);
  const averageTurnaroundMinutes = turnaroundMinutes.length > 0 ? turnaroundMinutes.reduce((sum, value) => sum + value, 0) / turnaroundMinutes.length : 0;
  const completeRequests = state.leaves.filter((request) => request.reason.trim().length >= 30);
  const escalations = state.leaves.filter((request) => {
    if (request.status === 'rejected') {
      return true;
    }

    if (request.status !== 'pending') {
      return false;
    }

    const ageInHours = (Date.now() - new Date(request.submittedAt).getTime()) / (60 * 60 * 1000);
    return ageInHours >= 4;
  }).length;

  return {
    requests,
    metrics: { pending, approved, rejected },
    activity: {
      averageTurnaroundMinutes,
      completeness: requests.length > 0 ? Math.round((completeRequests.length / state.leaves.length) * 100) : 0,
      escalations,
      reviewedCount: reviewedRequests.length,
      requestCount: state.leaves.length,
      completeCount: completeRequests.length,
    },
  };
}

export function getAdminDashboard() {
  const state = readState();
  const requests = state.leaves;
  const total = requests.length;
  const pending = requests.filter((request) => request.status === 'pending').length;
  const approved = requests.filter((request) => request.status === 'approved').length;
  const rejected = requests.filter((request) => request.status === 'rejected').length;
  const activeStudents = state.users.filter((user) => user.role === 'student' && user.active).length;

  return {
    users: state.users,
    requests,
    notifications: state.notifications,
    audits: state.audits,
    metrics: { total, pending, approved, rejected, activeStudents },
  };
}

export function toggleUserActiveStatus(userId: string) {
  const state = readState();
  const target = state.users.find((user) => user.id === userId);

  if (!target) {
    throw new Error('User not found.');
  }

  if (target.role === 'admin' && target.active) {
    const activeAdmins = state.users.filter((user) => user.role === 'admin' && user.active).length;
    if (activeAdmins <= 1) {
      throw new Error('At least one admin must remain active.');
    }
  }

  target.active = !target.active;
  recordAudit(state, {
    action: 'user.status-toggled',
    entity: 'user',
    entityId: target.id,
    actorName: 'Admin',
    actorRole: 'admin',
    message: `${target.name} was ${target.active ? 'activated' : 'disabled'} by admin action.`,
  });
  writeState(state);
  pushNotification(
    `User ${target.active ? 'activated' : 'disabled'}`,
    `${target.name} was ${target.active ? 'activated' : 'disabled'} by admin action.`,
  );

  return target;
}

export function getLeaveAnalytics() {
  const requests = listLeaves();
  const statusCounts: Record<LeaveStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  const typeCounts: Record<LeaveType, number> = {
    sick: 0,
    casual: 0,
    personal: 0,
    emergency: 0,
    conference: 0,
  };

  requests.forEach((request) => {
    statusCounts[request.status] += 1;
    typeCounts[request.leaveType] += 1;
  });

  return {
    statusCounts,
    typeCounts,
  };
}
