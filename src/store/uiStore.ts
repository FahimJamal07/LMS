import { create } from 'zustand';

type Toast = {
  id: string;
  title: string;
  description?: string;
};

type UiState = {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  notificationsOpen: boolean;
  toasts: Toast[];
  setSidebarCollapsed: (value: boolean) => void;
  setMobileSidebarOpen: (value: boolean) => void;
  setNotificationsOpen: (value: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
};

const createToastId = () => crypto.randomUUID();

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  notificationsOpen: false,
  toasts: [],
  setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),
  setMobileSidebarOpen: (value) => set({ mobileSidebarOpen: value }),
  setNotificationsOpen: (value) => set({ notificationsOpen: value }),
  pushToast: (toast) => {
    const id = createToastId();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
    }, 3800);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));
