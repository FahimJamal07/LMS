import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, GraduationCap, Mail, Sparkles, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { registerUser } from '@/services/appApi';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { roleRoutes } from '@/utils/roles';
import type { Role } from '@/types/auth';

export function SignupPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const pushToast = useUiStore((state) => state.pushToast);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as Role,
    department: 'Computer Science',
    title: 'Year 1 Student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await registerUser(form);
      setUser(user);
      pushToast({ title: 'Account created', description: `Welcome, ${user.name}.` });
      navigate(roleRoutes[user.role]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-white/10 bg-white/95 shadow-[0_20px_80px_rgba(15,23,42,0.26)]">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Create your workspace</CardTitle>
                <CardDescription>Start with a polished role-aware account.</CardDescription>
              </div>
              <UserPlus className="h-5 w-5 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Full name" icon={<Sparkles className="h-4 w-4" />}>
                <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Maya Fernandez" />
              </Field>
              <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@university.edu" type="email" />
              </Field>
              <Field label="Password" icon={<Sparkles className="h-4 w-4" />}>
                <Input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Create a strong password" type="password" />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Role" icon={<GraduationCap className="h-4 w-4" />}>
                  <Select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })}>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </Select>
                </Field>
                <Field label="Department" icon={<Building2 className="h-4 w-4" />}>
                  <Input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} placeholder="Computer Science" />
                </Field>
              </div>

              <Field label="Title" icon={<Sparkles className="h-4 w-4" />}>
                <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Year 3 Student / Department Lead" />
              </Field>

              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-sm text-slate-500">
              Already have access?{' '}
              <Link className="font-medium text-slate-950 hover:underline" to="/login">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AuthLayout>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}
