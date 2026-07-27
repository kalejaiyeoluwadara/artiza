"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { TRADE_LABELS, type Trade } from "../lib/artisans";

/**
 * The trade picker: type to search, or name a trade that isn't listed.
 *
 * A `<select>` was right at seven trades and is wrong at thirty-five. On a
 * phone it becomes a spinning wheel of nearly identical words, and there is no
 * way to type — a tiler has to scroll past twenty trades that are not theirs.
 * So this is a combobox: the field is a search box, the list narrows as you
 * type, and the answer is usually one or two letters away.
 *
 * The important part is the last row. Nobody's trade should be un-nameable, so
 * whatever has been typed is always offered as itself — that selects `other`
 * and carries the words through as `customTrade`, which is what the profile
 * then shows. The closed list survives (browse is built on it) without anyone
 * being told their life's work isn't on the menu.
 *
 * Built here rather than pulled in: every other control in this app is
 * hand-drawn to the style guide, and a library combobox would arrive with its
 * own opinions about focus rings, radii and motion.
 */

/** One row in the list: a real trade, or the free-text escape hatch. */
type Option =
  | { kind: "trade"; trade: Trade; label: string }
  | { kind: "custom"; label: string };

const TRADES = (Object.keys(TRADE_LABELS) as Trade[])
  // `other` is never offered as a word — it is what the custom row produces,
  // and a literal "Other" row alongside "Use …" would be the same choice twice.
  .filter((trade) => trade !== "other")
  .map((trade) => ({ trade, label: TRADE_LABELS[trade] }))
  .sort((a, b) => a.label.localeCompare(b.label));

/**
 * Ranks a trade against what has been typed.
 *
 * A prefix match outranks a match in the middle, so typing "car" puts
 * "Carpenter" above "AC technician" rather than sorting them alphabetically and
 * burying the obvious answer. Returns -1 for no match.
 */
function score(label: string, query: string): number {
  const haystack = label.toLowerCase();
  const index = haystack.indexOf(query);
  if (index === -1) return -1;
  return index === 0 ? 0 : 1;
}

export function TradeField({
  trade,
  customTrade,
  onChange,
  error,
  disabled,
  label = "Trade",
  hint,
}: {
  trade: Trade;
  customTrade: string;
  /** Both together — picking a listed trade clears the custom words. */
  onChange: (next: { trade: Trade; customTrade: string }) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  /** What the field reads when it is not being typed into. */
  const selectedLabel =
    trade === "other" ? customTrade : TRADE_LABELS[trade];

  const options = useMemo<Option[]>(() => {
    const q = query.trim().toLowerCase();

    const matches = q
      ? TRADES.map((t) => ({ t, rank: score(t.label, q) }))
          .filter(({ rank }) => rank !== -1)
          .sort((a, b) => a.rank - b.rank || a.t.label.localeCompare(b.t.label))
          .map(({ t }) => t)
      : TRADES;

    const rows: Option[] = matches.map(({ trade: value, label: text }) => ({
      kind: "trade",
      trade: value,
      label: text,
    }));

    // The escape hatch, offered whenever something has been typed that isn't
    // already an exact trade name. Last, so it never sits above the answer
    // someone was actually reaching for.
    const typed = query.trim();
    const exact = matches.some(
      ({ label: text }) => text.toLowerCase() === typed.toLowerCase(),
    );
    if (typed && !exact) rows.push({ kind: "custom", label: typed });

    return rows;
  }, [query]);

  // Clamped at render rather than corrected in an effect: the list reshapes on
  // every keystroke, and an index left pointing past the end would arrow into
  // nothing. Deriving it means there is never a frame where it is wrong.
  const activeIndex = Math.min(active, Math.max(0, options.length - 1));

  // Follow the highlight when it is driven by the keyboard, so arrowing down a
  // long list never walks it out of view.
  useEffect(() => {
    if (!open) return;
    list.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  // A click anywhere else is a dismissal. Pointerdown rather than click so it
  // lands before focus moves and the panel can't flicker.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function commit(option: Option) {
    if (option.kind === "trade") {
      onChange({ trade: option.trade, customTrade: "" });
    } else {
      onChange({ trade: "other", customTrade: option.label });
    }
    close();
    input.current?.blur();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive(() => {
        const next = activeIndex + step;
        // Wraps, because a list this long is worse to walk off the end of.
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter") {
      if (!open) return;
      // Only swallow Enter when it is actually choosing something — otherwise
      // it belongs to the form.
      const option = options[activeIndex];
      if (!option) return;
      event.preventDefault();
      commit(option);
      return;
    }

    if (event.key === "Escape") {
      if (!open) return;
      event.preventDefault();
      close();
      return;
    }

    if (event.key === "Tab" && open) close();
  }

  return (
    <div ref={root} className="relative">
      <div className="flex items-baseline gap-2 px-1">
        <label htmlFor={id} className="caption font-semibold text-ink">
          {label}
        </label>
      </div>

      <div className="relative mt-1.5">
        <input
          id={id}
          ref={input}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && options[activeIndex]
              ? `${id}-opt-${activeIndex}`
              : undefined
          }
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          autoComplete="off"
          disabled={disabled}
          // Two values in one box: what was chosen when at rest, what is being
          // searched for while open. Anything else means the chosen trade
          // vanishes the moment someone starts checking whether a better one
          // exists.
          value={open ? query : selectedLabel}
          placeholder="Search your trade"
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`w-full rounded-2xl bg-fill py-3 pl-11 pr-10 text-[1.0625rem] text-ink placeholder:text-faint disabled:opacity-60 ${
            error ? "ring-1 ring-danger" : ""
          }`}
        />

        <Search
          size={17}
          strokeWidth={2.1}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sub"
        />
        <ChevronDown
          size={16}
          strokeWidth={2.2}
          aria-hidden
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sub transition-transform duration-200 ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open ? (
        <ul
          id={listId}
          ref={list}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto overscroll-contain rounded-2xl bg-card p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] ring-1 ring-line"
        >
          {options.map((option, index) => {
            const chosen =
              option.kind === "trade"
                ? option.trade === trade
                : trade === "other" && customTrade === option.label;

            return (
              <li key={option.kind === "trade" ? option.trade : "__custom"}>
                <button
                  id={`${id}-opt-${index}`}
                  data-index={index}
                  type="button"
                  role="option"
                  aria-selected={chosen}
                  // Pointerdown, not click: the input would blur first and the
                  // panel would be gone before the click landed.
                  onPointerDown={(event) => {
                    event.preventDefault();
                    commit(option);
                  }}
                  onPointerEnter={() => setActive(index)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.9375rem] ${
                    index === activeIndex ? "bg-fill text-ink" : "text-sub"
                  }`}
                >
                  {option.kind === "custom" ? (
                    <span className="min-w-0 flex-1 truncate">
                      Use{" "}
                      <span className="font-semibold text-ink">
                        “{option.label}”
                      </span>
                    </span>
                  ) : (
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                  )}

                  {chosen ? (
                    <Check
                      size={15}
                      strokeWidth={2.6}
                      aria-hidden
                      className="shrink-0 text-accent"
                    />
                  ) : null}
                </button>
              </li>
            );
          })}

          {/* Only reachable with an empty query, since anything typed always
              produces the custom row. */}
          {options.length === 0 ? (
            <li className="caption px-3 py-2.5">No trades to show.</li>
          ) : null}
        </ul>
      ) : null}

      {error ? (
        <p id={`${id}-error`} className="caption mt-1.5 px-1 text-danger">
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className="caption mt-1.5 px-1">
          {hint ??
            (trade === "other"
              ? "Listed as your own words. Customers can still find you by search."
              : "Type to search. Not listed? Type it and pick “Use …”.")}
        </p>
      )}
    </div>
  );
}
