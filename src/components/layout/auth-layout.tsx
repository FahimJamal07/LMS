import type { ReactNode } from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Users, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.92),_rgba(15,23,42,1)_42%),linear-gradient(135deg,#0f172a_0%,#111827_100%)] text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="absolute inset-0 opacity-80">
            <div className="absolute left-[-8%] top-[-10%] h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-4%] h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-200 backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Premium leave workflow for modern campuses
              </div>
              <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Leave Flow
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                Built for students, faculty, and admins who need fast approvals, clear status visibility, and polished workflows.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatPill icon={CalendarDays} title="Leave apply" description="Date-aware forms" />
                <StatPill icon={ShieldCheck} title="Approval flow" description="Faculty decisions" />
                <StatPill icon={Users} title="Org view" description="Admin analytics" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mt-12 rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/90">Live workflow snapshot</p>
                  <p className="mt-1 text-sm text-slate-300">Pending requests, approval trends, and team health in one view.</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {['Instant status', 'Smooth approvals', 'Analytics ready'].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[560px]">{children}</div>
        </section>
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, title, description }: { icon: typeof Sparkles; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-indigo-300" />
      <p className="mt-3 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-slate-300">{description}</p>
    </div>
  );
}
