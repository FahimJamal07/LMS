import { Bell, ChevronDown, LogOut, Menu, Settings, User2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/utils/cn';
import { roleLabels, roleRoutes } from '@/utils/roles';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { listNotifications, markNotificationsRead, logout } from '@/services/appApi';
import type { NotificationItem } from '@/types/notification';

type NavbarProps = {
  title: string;
  description: string;
};

export function Navbar({ title, description }: NavbarProps) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const pushToast = useUiStore((state) => state.pushToast);
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const notificationsOpen = useUiStore((state) => state.notificationsOpen);
  const setNotificationsOpen = useUiStore((state) => state.setNotificationsOpen);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [preferencesDialogOpen, setPreferencesDialogOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [department, setDepartment] = useState(user?.department ?? '');
  const [titleValue, setTitleValue] = useState(user?.title ?? '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      const items = await listNotifications();
      if (active) {
        setNotifications(items);
      }
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [user, notificationsOpen]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!profileRef.current) {
        return;
      }

      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setDisplayName(user?.name ?? '');
    setDepartment(user?.department ?? '');
    setTitleValue(user?.title ?? '');
  }, [user]);

  function handleSignOut() {
    setProfileOpen(false);
    setUser(null);
    logout();
    navigate('/login');
  }

  function handleSaveProfile() {
    pushToast({
      title: 'Profile updated',
      description: 'Your profile preferences were saved for this session.',
    });
    setProfileDialogOpen(false);
  }

  function handleSavePreferences() {
    pushToast({
      title: 'Preferences saved',
      description: 'Your dashboard preferences were updated.',
    });
    setPreferencesDialogOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)} aria-label="Open sidebar">
            <Menu className="h-4 w-4" />
          </Button>
          <div className="hidden sm:block">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">{roleLabels[user?.role ?? 'student']}</p>
            <h1 className="mt-1 text-lg font-semibold text-slate-950">{title}</h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn('relative', notificationsOpen && 'bg-slate-100')}
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              void markNotificationsRead(notifications.filter((notification) => !notification.read).map((notification) => notification.id));
              setNotifications((previous) => previous.map((notification) => ({ ...notification, read: true })));
            }}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-rose-500" /> : null}
          </Button>

          {notificationsOpen ? (
            <div className="absolute right-0 top-14 z-40 w-[340px] rounded-3xl border border-slate-200 bg-white p-3 shadow-soft">
              <div className="flex items-center justify-between px-2 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Notifications</p>
                  <p className="text-xs text-slate-500">Real-time mock feed</p>
                </div>
                <Badge tone="info">{unreadCount} new</Badge>
              </div>
              <div className="mt-2 space-y-2">
                {notifications.slice(0, 4).map((notification) => (
                  <div key={notification.id} className={cn('rounded-2xl p-3', notification.read ? 'bg-slate-50' : 'bg-indigo-50/70')}>
                    <p className="text-sm font-medium text-slate-950">{notification.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{notification.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="relative hidden sm:block" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className={cn(
                'flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition',
                profileOpen && 'border-slate-300',
              )}
            >
              <Avatar seed={user?.avatarSeed ?? 'LF'} className="h-9 w-9 rounded-xl text-xs" />
              <div className="pr-1 text-left">
                <p className="text-sm font-medium text-slate-950">{user?.name ?? 'Guest'}</p>
                <p className="text-xs text-slate-500">{user ? roleLabels[user.role] : 'Signed out'}</p>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-slate-400 transition', profileOpen && 'rotate-180')} />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 top-14 z-40 w-64 rounded-3xl border border-slate-200 bg-white p-2 shadow-soft">
                <div className="rounded-2xl px-3 py-2">
                  <p className="text-sm font-semibold text-slate-950">{user?.name ?? 'Guest'}</p>
                  <p className="text-xs text-slate-500">{user?.email ?? 'No email'}</p>
                </div>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    setProfileOpen(false);
                    setProfileDialogOpen(true);
                  }}
                >
                  <User2 className="h-4 w-4" />
                  Profile
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                  onClick={() => {
                    setProfileOpen(false);
                    setPreferencesDialogOpen(true);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Preferences
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>

      <Dialog
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        title="Profile"
        description="View and update your personal details."
        footer={
          <>
            <Button variant="ghost" onClick={() => setProfileDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile}>Save changes</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Display name">
            <Input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </Field>
          <Field label="Email">
            <Input value={user?.email ?? ''} readOnly className="bg-slate-50 text-slate-500" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Department">
              <Input value={department} onChange={(event) => setDepartment(event.target.value)} />
            </Field>
            <Field label="Title">
              <Input value={titleValue} onChange={(event) => setTitleValue(event.target.value)} />
            </Field>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={preferencesDialogOpen}
        onClose={() => setPreferencesDialogOpen(false)}
        title="Preferences"
        description="Customize how your workspace behaves."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPreferencesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences}>Save preferences</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Density">
            <Select
              value={sidebarCollapsed ? 'compact' : 'comfortable'}
              onChange={(event) => setSidebarCollapsed(event.target.value === 'compact')}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </Select>
          </Field>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
            <span className="text-sm font-medium text-slate-700">Weekly digest</span>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(event) => setWeeklyDigest(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
          </label>
        </div>
      </Dialog>
    </header>
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
