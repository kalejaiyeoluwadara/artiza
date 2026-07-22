"use client";

import { useSyncExternalStore } from "react";

export type ConfirmTone = "accent" | "danger";

export interface ConfirmRequest {
  title: string;
  /** One or two plain sentences. Say what will happen, not that it can't be undone. */
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /**
   * Optional work to run while the dialog stays open, showing a pending state.
   * Use it when the action takes long enough that a customer would otherwise
   * tap twice — opening a Paystack checkout, for instance. Throwing keeps the
   * dialog open and surfaces the message inline.
   */
  onConfirm?: () => Promise<void>;
}

interface PendingConfirm extends ConfirmRequest {
  id: number;
  resolve: (confirmed: boolean) => void;
}

let current: PendingConfirm | null = null;
const listeners = new Set<() => void>();
let counter = 0;

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): PendingConfirm | null {
  return current;
}

function getServerSnapshot(): PendingConfirm | null {
  return null;
}

/**
 * Asks the question and resolves to the answer:
 *
 *     if (!(await confirm({ title: "Unlock contact?", confirmLabel: "Unlock" }))) return;
 *
 * A promise rather than a pile of `isOpen` state, so the decision reads in the
 * order it happens and the caller keeps its own control flow.
 *
 * A second call while one is open resolves the first as cancelled — two
 * stacked questions is never the intent.
 */
export function confirm(request: ConfirmRequest): Promise<boolean> {
  current?.resolve(false);

  counter += 1;

  return new Promise<boolean>((resolve) => {
    current = { ...request, id: counter, resolve };
    emit();
  });
}

/** Settles the open request and clears it. Only the host should call this. */
export function settleConfirm(confirmed: boolean): void {
  const pending = current;
  if (!pending) return;

  current = null;
  emit();
  pending.resolve(confirmed);
}

export function usePendingConfirm(): PendingConfirm | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
