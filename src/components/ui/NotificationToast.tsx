import React from 'react';
import { useUIStore } from '../../store/uiStore.ts';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NotificationToast: React.FC = () => {
  const { notification, clearNotification } = useUIStore();

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          id="notification-toast"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl bg-[#121424]/95 text-white"
          style={{
            borderColor:
              notification.type === 'success'
                ? '#00FF66'
                : notification.type === 'error'
                ? '#FF0055'
                : '#00F0FF',
          }}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#00FF66]" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-[#FF0055]" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-[#00F0FF]" />}

          <span className="text-sm font-medium tracking-wide">{notification.message}</span>

          <button
            id="btn-close-toast"
            onClick={clearNotification}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
