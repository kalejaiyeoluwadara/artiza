"use client";

import { useCallback, useState } from "react";
import { Check, ExternalLink, Trash2, X } from "lucide-react";
import Link from "next/link";
import { AdminHeader, AdminPage } from "../../../components/admin/AdminShell";
import {
  EmptyState,
  ErrorState,
  RowsSkeleton,
} from "../../../components/admin/States";
import { Avatar } from "../../../components/ArtisanCard";
import { useAdminList } from "../../../lib/admin/useAdminList";
import { useApi } from "../../../lib/api/useApi";
import { ApiError } from "../../../lib/api/error";
import { toast } from "../../../lib/toast";
import { confirm } from "../../../lib/confirm";
import { TRADE_LABELS, formatPhone } from "../../../lib/artisans";
import type {
  AdminApplication,
  ApplicationFilter,
} from "../../../lib/api/types";

const FILTERS: { value: ApplicationFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "all", label: "Everyone" },
];

/**
 * The application triage queue.
 *
 * A pending row is a decision waiting to be made, so the two decisions —
 * approve, which publishes a live artisan, and decline — are the row's loudest
 * controls. Approving and deleting both confirm first: one puts an unverified
 * listing in front of customers, the other throws the lead away for good.
 */
export default function ApplicationsPage() {
  const { api } = useApi();
  const [status, setStatus] = useState<ApplicationFilter>("pending");
  const [busyId, setBusyId] = useState<string>();

  const load = useCallback(
    (client: typeof api, signal: AbortSignal) =>
      client.admin.applications.list(status, signal),
    [status],
  );

  const { items, loading, error, message, retry, patch } =
    useAdminList<AdminApplication>(load);

  /** Drops a row that no longer belongs in the current filter. */
  const drop = (id: string) =>
    patch((current) => current.filter((row) => row.id !== id));

  /** Applies a confirmed change locally without a refetch. */
  const replace = (id: string, changes: Partial<AdminApplication>) =>
    patch((current) =>
      current.map((row) => (row.id === id ? { ...row, ...changes } : row)),
    );

  async function approve(application: AdminApplication) {
    const ok = await confirm({
      title: `Approve ${application.name}?`,
      body: "This lists them on the browse screen straight away, using what they submitted. Their portrait, reply window and working hours get sensible defaults — fix those from the register afterward.",
      confirmLabel: "Approve and list",
      cancelLabel: "Not yet",
    });
    if (!ok) return;

    setBusyId(application.id);
    try {
      const updated = await api.admin.applications.approve(application.id);
      if (status === "pending") drop(application.id);
      else replace(application.id, updated);
      toast.success(`${application.name} is on the register`, {
        description: "Add their portrait and contact details from the register.",
      });
    } catch (cause) {
      toast.error("Couldn't approve them", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  async function decline(application: AdminApplication) {
    setBusyId(application.id);
    try {
      const updated = await api.admin.applications.decline(application.id);
      if (status === "pending") drop(application.id);
      else replace(application.id, updated);
      toast.success(`${application.name}'s application was declined`);
    } catch (cause) {
      toast.error("Couldn't decline it", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  async function remove(application: AdminApplication) {
    const ok = await confirm({
      title: `Delete ${application.name}'s application?`,
      body: "The record is gone for good. If they were already approved, the artisan on the register stays — this only removes the application.",
      confirmLabel: "Delete",
      cancelLabel: "Keep it",
      tone: "danger",
    });
    if (!ok) return;

    setBusyId(application.id);
    try {
      await api.admin.applications.remove(application.id);
      drop(application.id);
      toast.success("Application deleted");
    } catch (cause) {
      toast.error("Couldn't delete it", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  return (
    <AdminPage>
      <AdminHeader
        title="Applications"
        lede="Artisans asking to be listed. Approving one publishes it to the browse screen."
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Application status" className="flex gap-1">
          {FILTERS.map((option) => {
            const active = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatus(option.value)}
                className={`pressable rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 ease-out ${
                  active ? "bg-ink text-canvas" : "bg-fill text-sub"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {!loading && !error ? (
          <p className="caption ml-auto">
            <span className="figure text-ink">{items.length}</span>{" "}
            {items.length === 1 ? "application" : "applications"}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        {loading ? (
          <RowsSkeleton />
        ) : error ? (
          <ErrorState
            title="Couldn't load the applications"
            message={message}
            onRetry={retry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={
              status === "pending"
                ? "Nothing waiting"
                : "Nothing here"
            }
            body={
              status === "pending"
                ? "New applications from the home screen land here for a decision."
                : "No applications match this filter yet."
            }
          />
        ) : (
          <ul className="space-y-3">
            {items.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                busy={busyId === application.id}
                onApprove={() => void approve(application)}
                onDecline={() => void decline(application)}
                onDelete={() => void remove(application)}
              />
            ))}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}

/**
 * One application. Everything the team needs to make the call is on the card —
 * who, what trade, where, how to reach them, and the pitch in their own words —
 * so a decision never needs a second screen.
 */
function ApplicationCard({
  application,
  busy,
  onApprove,
  onDecline,
  onDelete,
}: {
  application: AdminApplication;
  busy: boolean;
  onApprove: () => void;
  onDecline: () => void;
  onDelete: () => void;
}) {
  const decided = application.status !== "pending";

  return (
    <li
      className={`rounded-2xl bg-card p-4 sm:p-5 ${busy ? "opacity-60" : ""}`}
    >
      <div className="flex flex-wrap items-start gap-3">
        <Avatar
          name={application.name}
          src={application.work[0]}
          size="size-11 text-sm"
        />

        <div className="min-w-0 flex-1 basis-48">
          <p className="headline flex items-center gap-1.5 text-ink">
            <span className="truncate">{application.name}</span>
            {application.status === "approved" ? (
              <span className="caption shrink-0 rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">
                Approved
              </span>
            ) : application.status === "declined" ? (
              <span className="caption shrink-0 rounded-full bg-fill px-2 py-0.5 font-semibold text-sub">
                Declined
              </span>
            ) : null}
          </p>
          <p className="caption mt-0.5">
            {TRADE_LABELS[application.trade]} · {application.location} ·{" "}
            {application.yearsExperience} yrs
          </p>
          <p className="caption mt-0.5">
            <span className="figure">{formatPhone(application.phone)}</span>
            {application.whatsapp
              ? ` · WhatsApp ${formatPhone(application.whatsapp)}`
              : ""}
          </p>
        </div>

        {application.artisanId ? (
          <Link
            href={`/admin/artisans/${application.artisanId}`}
            className="pressable caption inline-flex shrink-0 items-center gap-1 font-semibold text-accent"
          >
            Open listing
            <ExternalLink size={12} strokeWidth={2.4} />
          </Link>
        ) : null}
      </div>

      <p className="mt-3 text-[0.9375rem] leading-relaxed text-sub">
        {application.note}
      </p>

      {application.services.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {application.services.map((service) => (
            <li
              key={service}
              className="rounded-full bg-fill px-3 py-1 text-sm text-ink"
            >
              {service}
            </li>
          ))}
        </ul>
      ) : null}

      {application.work.length > 0 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto">
          {application.work.map((url, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`Work by ${application.name}, photo ${index + 1}`}
              className="h-20 w-28 shrink-0 rounded-xl object-cover"
            />
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!decided ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Check size={15} strokeWidth={2.4} />
              Approve
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onDecline}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-fill px-4 py-2 text-sm font-semibold text-ink disabled:opacity-50"
            >
              <X size={15} strokeWidth={2.4} />
              Decline
            </button>
          </>
        ) : null}

        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          title="Delete application"
          className="pressable hover-fill ml-auto grid size-9 place-items-center rounded-full text-sub disabled:opacity-40"
        >
          <Trash2 size={15} strokeWidth={2.1} />
          <span className="sr-only">Delete {application.name}&apos;s application</span>
        </button>
      </div>
    </li>
  );
}
