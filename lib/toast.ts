"use client";

import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "info" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  /** ms. `null` pins it until dismissed — loading toasts default to this. */
  duration: number | null;
  action?: ToastAction;
}

export interface ToastOptions {
  description?: string;
  duration?: number | null;
  action?: ToastAction;
  /**
   * Reuse an existing toast instead of stacking a new one. How a "Verifying
   * payment…" becomes "Payment confirmed" in place rather than as a second
   * card that shoves the first one up.
   */
  id?: string;
}

/** Long enough to read a sentence, short enough not to sit in the way. */
const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

/** Above this, the oldest is dropped — a wall of toasts is noise, not feedback. */
const MAX_VISIBLE = 3;

/**
 * The store lives outside React on purpose: an API error handler, a payment
 * poller or a plain event listener can raise a toast without being a component
 * or having the provider threaded down to it.
 */
let toasts: Toast[] = [];
const listeners = new Set<() => void>();

interface Timer {
  handle: ReturnType<typeof setTimeout>;
  /** ms left when paused. */
  remaining: number;
  startedAt: number;
}

const timers = new Map<string, Timer>();

function emit(): void {
  // A new array identity every time, so useSyncExternalStore sees the change.
  toasts = [...toasts];
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Toast[] {
  return toasts;
}

/** Stable empty array — a new one each call would loop the server render. */
const SERVER_SNAPSHOT: Toast[] = [];
function getServerSnapshot(): Toast[] {
  return SERVER_SNAPSHOT;
}

function clearTimer(id: string): void {
  const timer = timers.get(id);
  if (!timer) return;
  clearTimeout(timer.handle);
  timers.delete(id);
}

function startTimer(id: string, duration: number): void {
  clearTimer(id);
  timers.set(id, {
    handle: setTimeout(() => dismiss(id), duration),
    remaining: duration,
    startedAt: Date.now(),
  });
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `toast_${counter}`;
}

function push(variant: ToastVariant, title: string, options: ToastOptions = {}): string {
  const id = options.id ?? nextId();

  const duration =
    options.duration !== undefined
      ? options.duration
      : variant === "loading"
        ? null
        : variant === "error"
          ? ERROR_DURATION
          : DEFAULT_DURATION;

  const next: Toast = {
    id,
    variant,
    title,
    description: options.description,
    duration,
    action: options.action,
  };

  const existing = toasts.findIndex((toast) => toast.id === id);

  if (existing >= 0) {
    // Same id — replace in place so the card morphs rather than restacking.
    toasts[existing] = next;
  } else {
    toasts.push(next);
    if (toasts.length > MAX_VISIBLE) {
      const dropped = toasts.shift();
      if (dropped) clearTimer(dropped.id);
    }
  }

  if (duration === null) clearTimer(id);
  else startTimer(id, duration);

  emit();
  return id;
}

export function dismiss(id: string): void {
  clearTimer(id);
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

export function dismissAll(): void {
  for (const id of timers.keys()) clearTimer(id);
  toasts = [];
  emit();
}

/**
 * Held while a pointer is over the stack. A toast that expires out from under
 * the finger reaching for its "Try again" button is a bug the user experiences
 * as their own mistake.
 */
export function pauseTimers(): void {
  const now = Date.now();
  for (const [id, timer] of timers) {
    clearTimeout(timer.handle);
    timers.set(id, {
      ...timer,
      remaining: Math.max(0, timer.remaining - (now - timer.startedAt)),
    });
  }
}

export function resumeTimers(): void {
  for (const [id, timer] of timers) {
    timers.set(id, {
      handle: setTimeout(() => dismiss(id), timer.remaining),
      remaining: timer.remaining,
      startedAt: Date.now(),
    });
  }
}

export const toast = {
  success: (title: string, options?: ToastOptions) => push("success", title, options),
  error: (title: string, options?: ToastOptions) => push("error", title, options),
  info: (title: string, options?: ToastOptions) => push("info", title, options),
  loading: (title: string, options?: ToastOptions) => push("loading", title, options),
  dismiss,
  dismissAll,
};

/** Subscribes a component to the stack. Only the Toaster should need this. */
export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
