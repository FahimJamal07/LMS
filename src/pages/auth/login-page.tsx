import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { authenticate } from '@/services/appApi';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { roleRoutes } from '@/utils/roles';

export function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const pushToast = useUiStore((state) => state.pushToast);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authenticate(email, password);
      setUser(user);
      pushToast({ title: 'Welcome back', description: `${user.name} signed in successfully.` });
      navigate(roleRoutes[user.role]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to sign in.');
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
                <CardTitle>Sign in to LeaveFlow</CardTitle>
                <CardDescription>Premium leave operations for every role.</CardDescription>
              </div>
              <Badge tone="info">Secure access</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field label="Email" icon={<Mail className="h-4 w-4" />}>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="your@university.edu" type="email" />
              </Field>
              <Field label="Password" icon={<Lock className="h-4 w-4" />}>
                <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" type="password" />
              </Field>

              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

              <Button className="w-full" size="lg" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Continue to dashboard'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center justify-between gap-4 text-sm text-slate-500">
              <Link className="font-medium text-slate-950 hover:underline" to="/signup">
                Create account
              </Link>
            </div>
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
