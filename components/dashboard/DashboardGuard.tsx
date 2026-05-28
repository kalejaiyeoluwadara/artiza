"use client";

import React from "react";
import { ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { useApp } from "../../context/AppContext";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface DashboardGuardProps {
  allowedRoles: ('seeker' | 'worker' | 'admin')[];
  children: React.ReactNode;
}

export const DashboardGuard: React.FC<DashboardGuardProps> = ({
  allowedRoles,
  children
}) => {
  const { currentRole, setRole } = useApp();

  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    const roleLabels = {
      seeker: "Seeker (Customer)",
      worker: "Worker (Artisan)",
      admin: "Administrator"
    };

    const allowedLabel = allowedRoles.map((r) => roleLabels[r]).join(" or ");

    return (
      <div className="mx-auto max-w-lg px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Card variant="glass" className="w-full p-8 border border-red-200/50 bg-red-50/10 shadow-xl text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shadow-sm mb-5">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-black text-zinc-800 tracking-tight">
            Role Authorization Required
          </h2>

          <p className="text-xs text-zinc-500 font-semibold mt-2 leading-relaxed">
            This dashboard is restricted to{" "}
            <span className="font-black text-zinc-700">{allowedLabel}</span>.
            Your current view is set to{" "}
            <span className="font-black text-zinc-700">{roleLabels[currentRole]}</span>.
          </p>

          <div className="mt-8 pt-6 border-t border-zinc-100 w-full flex flex-col gap-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Switch to an authorized role
            </p>
            {allowedRoles.map((role) => (
              <Button
                key={role}
                variant="primary"
                fullWidth
                onClick={() => setRole(role)}
                className="font-bold cursor-pointer"
                leftIcon={<LogIn className="h-4 w-4" />}
              >
                Switch to {roleLabels[role]}
              </Button>
            ))}
          </div>

          <div className="mt-4 w-full">
            <Button
              href="/"
              variant="outline"
              size="sm"
              fullWidth
              className="font-bold cursor-pointer"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              Go Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
export default DashboardGuard;
