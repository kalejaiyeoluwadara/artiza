"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Loader2, Star, Trash2 } from "lucide-react";
import { useApi } from "../../lib/api/useApi";
import { ApiError } from "../../lib/api/error";
import type { UploadFolder } from "../../lib/api/types";

/** What the API accepts, said out loud so the picker and the copy agree. */
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";
const MAX_BYTES = 8 * 1024 * 1024;

/** The aspect each folder's crop produces, so the frame never lies about it. */
const FRAME: Record<UploadFolder, string> = {
  portraits: "aspect-square",
  work: "aspect-3/2",
  banners: "aspect-16/9",
};

function tooBig(file: File): boolean {
  return file.size > MAX_BYTES;
}

function useUploader(folder: UploadFolder) {
  const { api } = useApi();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  /** Resolves to the URLs that landed, or `null` if nothing did. */
  const send = async (files: File[]): Promise<string[] | null> => {
    setError(undefined);

    const oversized = files.find(tooBig);
    if (oversized) {
      // Caught here rather than at the API: an 8 MB round trip that was always
      // going to be rejected is a minute of someone's tethered connection.
      setError(`"${oversized.name}" is over 8 MB. Export it smaller and retry.`);
      return null;
    }

    setBusy(true);
    try {
      const results =
        files.length === 1
          ? [await api.admin.uploads.one(files[0], folder)]
          : await api.admin.uploads.many(files, folder);
      return results.map((result) => result.url);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "The upload didn't go through. Try again.",
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { send, busy, error };
}

/**
 * One image: the portrait, or a banner's art.
 *
 * The frame is the shape the API will crop to, not the shape of the file that
 * was picked — so what an editor approves here is what a customer sees. Photos
 * upload the moment they're chosen and the field holds the returned URL, which
 * is the order the API requires: upload first, save second.
 */
export function ImageField({
  label,
  hint,
  folder,
  value,
  onChange,
  error: externalError,
}: {
  label: string;
  hint?: string;
  folder: UploadFolder;
  value: string;
  onChange: (url: string) => void;
  error?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const { send, busy, error } = useUploader(folder);
  const shown = error ?? externalError;

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    const urls = await send([files[0]]);
    if (urls?.[0]) onChange(urls[0]);
  };

  return (
    <div>
      <div className="flex items-baseline gap-2 px-1">
        <span id={id} className="caption font-semibold text-ink">
          {label}
        </span>
      </div>

      <div
        className={`relative mt-1.5 w-full max-w-56 overflow-hidden rounded-2xl bg-fill ${FRAME[folder]} ${
          shown ? "ring-1 ring-danger" : ""
        }`}
      >
        {value ? (
          <Image
            src={value}
            alt=""
            fill
            sizes="224px"
            className="object-cover"
          />
        ) : null}

        <button
          type="button"
          aria-labelledby={id}
          disabled={busy}
          onClick={() => input.current?.click()}
          className={`pressable absolute inset-0 grid place-items-center text-center ${
            value ? "opacity-0 focus-visible:opacity-100" : ""
          }`}
        >
          <span className="flex flex-col items-center gap-1.5 text-sub">
            {busy ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ImageUp size={20} strokeWidth={1.8} />
            )}
            <span className="caption font-semibold">
              {busy ? "Uploading…" : value ? "Replace" : "Choose a photo"}
            </span>
          </span>
        </button>

        <input
          ref={input}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          onChange={(event) => {
            void pick(event.target.files);
            // Cleared so picking the same file twice still fires a change —
            // it does happen, after a failed upload.
            event.target.value = "";
          }}
        />
      </div>

      {shown ? (
        <p className="caption mt-1.5 px-1 text-danger">{shown}</p>
      ) : hint ? (
        <p className="caption mt-1.5 px-1">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * The portfolio. `work[0]` is the card cover everywhere in the app, so the
 * first tile is labelled as such and every other tile can claim the slot —
 * choosing the cover is a real editorial decision, not an upload accident.
 */
export function GalleryField({
  label,
  hint,
  values,
  onChange,
  max = 12,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { send, busy, error } = useUploader("work");
  const room = max - values.length;

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    // The API takes eight per request; the artisan takes twelve in total.
    const urls = await send(Array.from(files).slice(0, Math.min(room, 8)));
    if (urls) onChange([...values, ...urls].slice(0, max));
  };

  const makeCover = (url: string) => {
    onChange([url, ...values.filter((v) => v !== url)]);
  };

  return (
    <div>
      <div className="flex items-baseline gap-2 px-1">
        <span className="caption font-semibold text-ink">{label}</span>
        <span className="caption text-faint">Optional</span>
        <span className="figure ml-auto text-xs text-faint">
          {values.length}/{max}
        </span>
      </div>

      <ul className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {values.map((url, index) => (
          <li
            key={url}
            className="group relative aspect-3/2 overflow-hidden rounded-xl bg-fill"
          >
            <Image src={url} alt="" fill sizes="180px" className="object-cover" />

            {index === 0 ? (
              <span className="chrome absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold text-ink">
                Cover
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(url)}
                className="pressable chrome absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-full text-ink"
              >
                <Star size={12} strokeWidth={2.2} />
                <span className="sr-only">Make this the cover photo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== url))}
              className="pressable chrome absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full text-danger"
            >
              <Trash2 size={12} strokeWidth={2.2} />
              <span className="sr-only">Remove photo {index + 1}</span>
            </button>
          </li>
        ))}

        {room > 0 ? (
          <li>
            <button
              type="button"
              disabled={busy}
              onClick={() => input.current?.click()}
              className="pressable flex aspect-3/2 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-fill text-sub"
            >
              {busy ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ImageUp size={18} strokeWidth={1.8} />
              )}
              <span className="caption font-semibold">
                {busy ? "Uploading…" : "Add work"}
              </span>
            </button>
          </li>
        ) : null}
      </ul>

      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(event) => {
          void add(event.target.files);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="caption mt-2 px-1 text-danger">{error}</p>
      ) : hint ? (
        <p className="caption mt-2 px-1">{hint}</p>
      ) : null}
    </div>
  );
}
