export type AuditAction =
  | 'user.registered'
  | 'leave.submitted'
  | 'leave.reviewed'
  | 'leave.bulk-reviewed'
  | 'user.status-toggled';

export type AuditEntity = 'user' | 'leave' | 'system';

export type AuditLog = {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  actorName: string;
  actorRole: 'student' | 'faculty' | 'admin' | 'system';
  message: string;
  createdAt: string;
};
