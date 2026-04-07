import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/store/uiStore';

export function ToastStack() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="pointer-events-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm leading-6 text-slate-500">{toast.description}</p> : null}
              </div>
              <Button variant="ghost" size="sm" onClick={() => dismissToast(toast.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
