"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdminHeader, AdminPage } from "../../../../components/admin/AdminShell";
import { ArtisanForm } from "../../../../components/admin/ArtisanForm";
import { ErrorState } from "../../../../components/admin/States";
import { Skeleton } from "../../../../components/Skeleton";
import { useAdminList } from "../../../../lib/admin/useAdminList";
import { draftFrom } from "../../../../lib/admin/artisan-draft";
import { TRADE_LABELS } from "../../../../lib/artisans";
import type { Api } from "../../../../lib/api";
import type { AdminArtisan } from "../../../../lib/api/types";

export default function EditArtisanPage() {
  const { id } = useParams<{ id: string }>();

  // `useAdminList` is a list hook and this is one record, so the record is
  // wrapped rather than a near-identical single-record hook written beside it.
  const load = useCallback(
    async (client: Api, signal: AbortSignal) => [
      await client.admin.artisans.get(id, signal),
    ],
    [id],
  );

  const { items, loading, error, message, retry } =
    useAdminList<AdminArtisan>(load);

  const artisan = items[0];
  const initial = useMemo(
    () => (artisan ? draftFrom(artisan) : undefined),
    [artisan],
  );

  return (
    <AdminPage>
      <Link
        href="/admin/artisans"
        className="pressable caption -ml-1 mb-3 inline-flex items-center gap-0.5 font-semibold text-sub"
      >
        <ChevronLeft size={14} strokeWidth={2.4} />
        Register
      </Link>

      {loading ? (
        <>
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="mt-3 h-4 w-80 rounded-md" />
          <div className="mt-6 space-y-5">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
        </>
      ) : error || !artisan || !initial ? (
        <ErrorState
          title="Couldn't load this artisan"
          message={message}
          onRetry={retry}
        />
      ) : (
        <>
          <AdminHeader
            title={artisan.name}
            lede={`${TRADE_LABELS[artisan.trade]} in ${artisan.location} · verified ${artisan.verifiedSince}${
              artisan.isActive ? "" : " · retired"
            }`}
          />

          <div className="mt-6">
            <ArtisanForm
              mode="edit"
              artisanId={artisan.id}
              initial={initial}
              actual={artisan}
            />
          </div>
        </>
      )}
    </AdminPage>
  );
}
