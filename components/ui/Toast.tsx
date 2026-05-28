"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useApp } from "../../context/AppContext";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-3 px-4 sm:left-auto sm:right-6 sm:translate-x-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let bgColor = "bg-white/95 border-blue-100 shadow-blue-50/50";
          let iconColor = "text-blue-500";
          let Icon = Info;

          if (toast.type === "success") {
            bgColor = "bg-white/95 border-emerald-100 shadow-emerald-50/50";
            iconColor = "text-emerald-500";
            Icon = CheckCircle2;
          } else if (toast.type === "error") {
            bgColor = "bg-white/95 border-rose-100 shadow-rose-50/50";
            iconColor = "text-rose-500";
            Icon = AlertCircle;
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.15 } }}
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all ${bgColor}`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 text-sm font-medium text-zinc-800">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-zinc-400 hover:text-zinc-600 transition-colors"
                aria-label="Dismiss toast"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
export default ToastContainer;
