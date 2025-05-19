import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className={`p-4 rounded-md shadow-lg text-white flex items-start ${
              toast.type === 'success'
                ? 'bg-success'
                : toast.type === 'error'
                ? 'bg-error'
                : 'bg-secondary'
            }`}
          >
            <div className="flex-1">
              <h4 className="font-medium">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm mt-1">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 p-1 hover:bg-black/10 rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};