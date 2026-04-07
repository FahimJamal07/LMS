import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-[0.32em] text-slate-400">404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-slate-300">The route does not exist. Return to the dashboard flow to continue.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
