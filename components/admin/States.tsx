"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Skeleton } from "../Skeleton";

/**
 * The three answers a console read can give, kept apart on purpose.
 *
 * A failed read is never an empty state. "No artisans yet" when the request
 * actually fell over is a lie that also hides the retry — and in a console it
 * is the kind of lie that gets an artisan listed twice.
 */

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl bg-card p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <span className="mx-auto grid size-10 place-items-center rounded-full bg-fill">
        <AlertTriangle size={18} strokeWidth={2} className="text-sub" />
      </span>
      <p className="headline mt-3 text-ink">{title}</p>
      <p className="caption mx-auto mt-1 max-w-sm">
        {message ?? "The request didn't get through."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="pressable mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-canvas"
      >
        <RotateCw size={14} strokeWidth={2.4} />
        Try again
      </button>
    </div>
  );
}

/** Says what to do next, never just that nothing is here. */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-card/60 p-10 text-center">
      <p className="headline text-ink">{title}</p>
      <p className="caption mx-auto mt-1 max-w-sm">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/**
 * Stands in for a register row. Same height, same portrait, same column stops,
 * so the swap to real rows is a fade rather than a jump.
 */
export function RowSkeleton() {
  return (
    <li className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 sm:px-5">
      <Skeleton className="size-11 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-40 rounded-md" />
        <Skeleton className="mt-1.5 h-3 w-28 rounded-md" />
      </div>
      <Skeleton className="hidden h-3.5 w-24 rounded-md sm:block" />
      <Skeleton className="h-7 w-20 rounded-full" />
    </li>
  );
}

export function RowsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul
      aria-hidden
      className="overflow-hidden rounded-2xl bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
    >
      {Array.from({ length: count }, (_, i) => (
        <RowSkeleton key={i} />
      ))}
    </ul>
  );
}
