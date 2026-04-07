import type { Role } from './auth';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'sick' | 'casual' | 'personal' | 'emergency' | 'conference';

export type LeaveRequest = {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  submittedAt: string;
};

export type LeaveFormInput = {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
};
