"use client";

import { TRADE_LABELS, TRADE_SHORT_LABELS, Trade } from "../lib/artisans";
import {
  AllIllustration,
  TRADE_TINTS,
  TradeIllustration,
} from "./TradeIllustration";

const TRADES = Object.keys(TRADE_LABELS) as Trade[];

/**
 * The trade rail sits directly under the search bar as the fast lane: one
 * tap, no sheet. Illustrated tiles rather than line icons — seven grey
 * glyphs in a row read as a toolbar, seven drawings read as a market. The
 * colour lives entirely inside the art; the tile's own state is still told
 * in ink, so the rail never competes with the accent.
 */
export function TradeRail({
  trade,
  onChange,
}: {
  trade: Trade | null;
  onChange: (next: Trade | null) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Filter by trade"
      className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4 py-1 md:mx-0 md:px-0"
    >
      <div className="flex w-max gap-2.5">
        <RailItem
          label="All"
          tint="var(--fill)"
          active={trade === null}
          onClick={() => onChange(null)}
        >
          <AllIllustration />
        </RailItem>

        {TRADES.map((t) => (
          <RailItem
            key={t}
            label={TRADE_SHORT_LABELS[t]}
            tint={TRADE_TINTS[t]}
            active={trade === t}
            onClick={() => onChange(trade === t ? null : t)}
          >
            <TradeIllustration trade={t} />
          </RailItem>
        ))}
      </div>
    </div>
  );
}

function RailItem({
  label,
  tint,
  active,
  onClick,
  children,
}: {
  label: string;
  tint: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="pressable flex w-18 shrink-0 flex-col items-center gap-1.5"
    >
      {/* Selection is a ring, not a fill: the tint belongs to the trade, so
          the state has to be told in something the trade doesn't own. Only
          the ring colour transitions — never size or position. */}
      <span
        style={{ background: tint }}
        className={`flex size-14 items-center justify-center rounded-2xl ring-2 ring-offset-2 ring-offset-canvas transition-[box-shadow] duration-200 ${
          active ? "ring-ink" : "ring-transparent"
        }`}
      >
        {children}
      </span>
      <span
        className={`caption w-full text-center leading-tight transition-colors duration-200 ${
          active ? "font-semibold text-ink" : "text-sub"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
