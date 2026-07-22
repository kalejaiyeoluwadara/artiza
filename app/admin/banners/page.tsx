"use client";

import { useCallback, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminHeader, AdminPage } from "../../../components/admin/AdminShell";
import { EmptyState, ErrorState } from "../../../components/admin/States";
import {
  BannerEditor,
  BannerPreview,
  bannerDraftFrom,
} from "../../../components/admin/BannerEditor";
import { Skeleton } from "../../../components/Skeleton";
import { useAdminList } from "../../../lib/admin/useAdminList";
import { useApi } from "../../../lib/api/useApi";
import { ApiError } from "../../../lib/api/error";
import { toast } from "../../../lib/toast";
import { confirm } from "../../../lib/confirm";
import type { Api } from "../../../lib/api";
import type { AdminBannerItem } from "../../../lib/api/types";

const byPosition = (a: AdminBannerItem, b: AdminBannerItem) =>
  a.position - b.position;

/**
 * The promo rail.
 *
 * List on the left, editor on the right — a banner is judged against the ones
 * either side of it, so hiding the rail behind a modal to edit one of them
 * would remove the only context that matters. Order here is the order
 * customers scroll through, top to bottom.
 */
export default function BannersPage() {
  const { api } = useApi();
  const [editing, setEditing] = useState<AdminBannerItem>();
  const [composing, setComposing] = useState(false);
  const [busyId, setBusyId] = useState<string>();

  const load = useCallback(
    (client: Api, signal: AbortSignal) => client.admin.banners.list(signal),
    [],
  );

  const { items, loading, error, message, retry, patch } =
    useAdminList<AdminBannerItem>(load);

  const banners = useMemo(() => [...items].sort(byPosition), [items]);
  const live = banners.filter((banner) => banner.isActive).length;

  function saved(banner: AdminBannerItem, created: boolean) {
    patch((current) =>
      created
        ? [...current, banner]
        : current.map((row) => (row.id === banner.id ? banner : row)),
    );
    setComposing(false);
    setEditing(undefined);
  }

  async function remove(banner: AdminBannerItem) {
    const ok = await confirm({
      title: `Delete "${banner.title}"?`,
      body: "Banners carry no history, so this one goes for good. To take it out of the rail without losing the copy, switch it off instead.",
      confirmLabel: "Delete",
      cancelLabel: "Keep it",
      tone: "danger",
    });
    if (!ok) return;

    setBusyId(banner.id);
    try {
      await api.admin.banners.remove(banner.id);
      patch((current) => current.filter((row) => row.id !== banner.id));
      if (editing?.id === banner.id) setEditing(undefined);
      toast.success("Banner deleted");
    } catch (cause) {
      toast.error("Couldn't delete it", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  /**
   * Moving one banner means moving two: position is an absolute sort key, so
   * a swap is the only edit that leaves every other banner where it was.
   */
  async function move(banner: AdminBannerItem, direction: -1 | 1) {
    const index = banners.findIndex((row) => row.id === banner.id);
    const neighbour = banners[index + direction];
    if (!neighbour) return;

    setBusyId(banner.id);
    try {
      await Promise.all([
        api.admin.banners.update(banner.id, { position: neighbour.position }),
        api.admin.banners.update(neighbour.id, { position: banner.position }),
      ]);

      patch((current) =>
        current.map((row) => {
          if (row.id === banner.id) return { ...row, position: neighbour.position };
          if (row.id === neighbour.id) return { ...row, position: banner.position };
          return row;
        }),
      );
    } catch (cause) {
      toast.error("Couldn't reorder the rail", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setBusyId(undefined);
    }
  }

  const showEditor = composing || Boolean(editing);

  return (
    <AdminPage>
      <AdminHeader
        title="Promotions"
        lede={
          loading
            ? "The banner rail on the home screen."
            : `${live} of ${banners.length} showing in the rail.`
        }
        action={
          <button
            type="button"
            onClick={() => {
              setEditing(undefined);
              setComposing(true);
            }}
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white"
          >
            <Plus size={16} strokeWidth={2.4} />
            New banner
          </button>
        }
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div>
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="aspect-2/1 w-full rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              title="Couldn't load the banners"
              message={message}
              onRetry={retry}
            />
          ) : banners.length === 0 ? (
            <EmptyState
              title="No banners yet"
              body="The rail hides itself when it's empty, so the home screen is fine without one. Add a banner when there's an offer worth the space."
              action={
                <button
                  type="button"
                  onClick={() => setComposing(true)}
                  className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  <Plus size={15} strokeWidth={2.4} />
                  New banner
                </button>
              }
            />
          ) : (
            <ol className="space-y-3">
              {banners.map((banner, index) => (
                <li
                  key={banner.id}
                  className={`overflow-hidden rounded-2xl bg-card p-3 ${
                    busyId === banner.id ? "opacity-60" : ""
                  } ${editing?.id === banner.id ? "ring-2 ring-accent" : ""}`}
                >
                  <div className="flex gap-3">
                    <div className="w-40 shrink-0 sm:w-56">
                      <BannerPreview
                        draft={bannerDraftFrom(banner)}
                        className={banner.isActive ? "" : "grayscale"}
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="headline flex items-center gap-1.5 text-ink">
                        <span className="truncate">{banner.title}</span>
                        {banner.isActive ? null : (
                          <span className="caption shrink-0 rounded-full bg-fill px-2 py-0.5 font-semibold text-sub">
                            Off
                          </span>
                        )}
                      </p>
                      <p className="caption mt-0.5 line-clamp-2">{banner.body}</p>
                      <p className="caption mt-1.5 truncate text-faint">
                        {banner.cta} → {banner.href}
                      </p>

                      <div className="mt-auto flex items-center gap-1 pt-2">
                        <button
                          type="button"
                          disabled={index === 0 || Boolean(busyId)}
                          onClick={() => void move(banner, -1)}
                          className="pressable hover-fill grid size-8 place-items-center rounded-full text-sub disabled:opacity-30"
                        >
                          <ArrowUp size={15} strokeWidth={2.2} />
                          <span className="sr-only">Move {banner.title} earlier</span>
                        </button>
                        <button
                          type="button"
                          disabled={index === banners.length - 1 || Boolean(busyId)}
                          onClick={() => void move(banner, 1)}
                          className="pressable hover-fill grid size-8 place-items-center rounded-full text-sub disabled:opacity-30"
                        >
                          <ArrowDown size={15} strokeWidth={2.2} />
                          <span className="sr-only">Move {banner.title} later</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setComposing(false);
                            setEditing(banner);
                          }}
                          className="pressable ml-auto inline-flex items-center gap-1.5 rounded-full bg-fill px-3 py-1.5 text-sm font-semibold text-ink"
                        >
                          <Pencil size={13} strokeWidth={2.2} />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyId)}
                          onClick={() => void remove(banner)}
                          className="pressable hover-fill grid size-8 place-items-center rounded-full text-sub disabled:opacity-30"
                        >
                          <Trash2 size={15} strokeWidth={2.2} />
                          <span className="sr-only">Delete {banner.title}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <aside className="xl:sticky xl:top-10 xl:self-start">
          {showEditor ? (
            <BannerEditor
              key={editing?.id ?? "new"}
              banner={editing}
              onSaved={saved}
              onCancel={() => {
                setComposing(false);
                setEditing(undefined);
              }}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center">
              <p className="headline text-ink">Nothing selected</p>
              <p className="caption mx-auto mt-1 max-w-xs">
                Pick a banner to edit it, or start a new one. The rail only
                shows on an unfiltered home screen — once someone searches, it
                gets out of the way.
              </p>
            </div>
          )}
        </aside>
      </div>
    </AdminPage>
  );
}
