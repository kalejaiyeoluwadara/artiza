"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Sheet } from "../../Sheet";
import { StatusTag } from "./StatusControls";
import { useApi } from "../../../lib/api/useApi";
import { ApiError } from "../../../lib/api/error";
import { toast } from "../../../lib/toast";
import {
  displayPhone,
  parseOutreachCsv,
  type ParsedCsv,
} from "../../../lib/outreach";
import { tradeName } from "../../../lib/artisans";
import type { OutreachLead } from "../../../lib/api/types";

/** What the six columns are called when the preview reports what it found. */
const COLUMN_LABELS: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  trade: "Trade",
  outreach: "Outreach status",
  approval: "Approval status",
  notes: "Notes",
};

/**
 * Bringing the list in.
 *
 * The file is read and parsed in the browser, and nothing is sent until the
 * preview has been looked at. That ordering is the point: the numbers this
 * dashboard will message are the ones shown here, already normalised, so a
 * column mapped to the wrong field or a row that lost its digits is caught by
 * the person who owns the list rather than by a validation error afterwards.
 */
export function ImportSheet({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (leads: OutreachLead[]) => void;
}) {
  const { api } = useApi();
  const input = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>();
  const [parsed, setParsed] = useState<ParsedCsv>();
  const [importing, setImporting] = useState(false);

  function reset() {
    setFileName(undefined);
    setParsed(undefined);
    if (input.current) input.current.value = "";
  }

  function close() {
    reset();
    onClose();
  }

  async function read(file: File) {
    setFileName(file.name);
    setParsed(parseOutreachCsv(await file.text()));
  }

  async function send() {
    if (!parsed || parsed.rows.length === 0) return;

    setImporting(true);
    try {
      // `rawPhone` and `ready` are the preview's own workings — the API
      // re-normalises what it is given and decides for itself.
      const result = await api.admin.outreach.import(
        parsed.rows.map(({ rawPhone: _raw, ready: _ready, ...lead }) => lead),
      );

      onImported(result.leads);
      toast.success(
        result.created > 0
          ? `${result.created} ${result.created === 1 ? "artisan" : "artisans"} added`
          : "The list is already up to date",
        {
          description: [
            result.updated > 0 ? `${result.updated} already on the list` : null,
            result.skipped > 0 ? `${result.skipped} rows skipped` : null,
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
        },
      );
      close();
    } catch (cause) {
      toast.error("Couldn't import the list", {
        description:
          cause instanceof ApiError ? cause.message : "Try again in a moment.",
      });
    } finally {
      setImporting(false);
    }
  }

  const unreadable = parsed?.rows.filter((row) => !row.ready).length ?? 0;

  return (
    <Sheet open={open} onClose={close} label="Import the outreach list">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
          <header className="pt-1">
            <h2 className="title text-ink">Import the outreach list</h2>
            <p className="mt-1 text-[0.9375rem] text-sub">
              A CSV with the headers on the first row. Name and phone are the
              two it needs; trade, outreach status, approval status and notes
              come through if they are there.
            </p>
          </header>

          <div className="mt-5">
            <input
              ref={input}
              id="outreach-csv"
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void read(file);
              }}
            />
            <label
              htmlFor="outreach-csv"
              className="pressable hover-fill flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line px-4 py-5"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-fill">
                <FileUp size={17} strokeWidth={2} className="text-sub" />
              </span>
              <span className="min-w-0">
                <span className="headline block truncate text-ink">
                  {fileName ?? "Choose a CSV file"}
                </span>
                <span className="caption block">
                  {fileName ? "Pick another to replace it" : "Nothing is saved until you import"}
                </span>
              </span>
            </label>
          </div>

          {parsed?.problem ? (
            <p className="caption mt-4 rounded-2xl bg-danger/15 px-4 py-3 text-danger">
              {parsed.problem}
            </p>
          ) : null}

          {parsed && !parsed.problem ? (
            <div className="mt-5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="headline text-ink">
                  <span className="figure">{parsed.rows.length}</span>{" "}
                  {parsed.rows.length === 1 ? "artisan" : "artisans"} read
                </p>
                {parsed.skipped > 0 ? (
                  <p className="caption">
                    {parsed.skipped} rows had no name or number
                  </p>
                ) : null}
              </div>

              <p className="caption mt-1.5">
                Columns found: {parsed.columns.map((c) => COLUMN_LABELS[c]).join(", ")}
              </p>

              {unreadable > 0 ? (
                <p className="caption mt-3 rounded-2xl bg-danger/15 px-4 py-3 text-danger">
                  {unreadable} {unreadable === 1 ? "number" : "numbers"}{" "}
                  couldn&apos;t be read as a Nigerian mobile. They import as
                  they were written so nobody is lost — fix them from the list
                  and the message button turns on.
                </p>
              ) : null}

              {/* The first few rows, exactly as they will be saved. Ten is
                  enough to catch a column read into the wrong field, and short
                  enough that the import button stays on screen. */}
              <ul className="mt-4 overflow-hidden rounded-2xl bg-card">
                {parsed.rows.slice(0, 10).map((row, index) => (
                  <li
                    key={`${row.phone}-${index}`}
                    className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem] font-medium text-ink">
                        {row.name}
                      </span>
                      <span className="caption block truncate">
                        {tradeName({
                          trade: row.trade ?? "other",
                          customTrade: row.customTrade,
                        })}
                      </span>
                    </span>
                    {row.ready ? (
                      <span className="figure caption shrink-0 text-ink">
                        {displayPhone(row.phone)}
                      </span>
                    ) : (
                      <StatusTag label={row.rawPhone} tone="danger" />
                    )}
                  </li>
                ))}
              </ul>

              {parsed.rows.length > 10 ? (
                <p className="caption mt-2 px-1">
                  and {parsed.rows.length - 10} more
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="chrome flex shrink-0 items-center gap-3 border-t border-line px-5 py-3">
          <p className="caption min-w-0 flex-1">
            Anyone already on the list keeps their progress.
          </p>
          <button
            type="button"
            onClick={close}
            className="pressable rounded-full bg-fill px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void send()}
            disabled={importing || !parsed || parsed.rows.length === 0}
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {importing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Import"
            )}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
