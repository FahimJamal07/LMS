export type Role = 'student' | 'faculty' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  title: string;
  department: string;
  avatarSeed: string;
  active: boolean;
};

export type SessionUser = Omit<User, 'password'>;
