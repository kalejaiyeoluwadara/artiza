"use client";

import {
  Grid2x2,
  Hammer,
  LayoutGrid,
  PaintRoller,
  Sun,
  WashingMachine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { TRADE_LABELS, Trade } from "../lib/artisans";

const TRADE_ICONS: Record<Trade, LucideIcon> = {
  plumber: Wrench,
  "solar-installer": Sun,
  tiler: Grid2x2,
  carpenter: Hammer,
  electrician: Zap,
  painter: PaintRoller,
  laundry: WashingMachine,
};

const TRADES = Object.keys(TRADE_LABELS) as Trade[];

/**
 * The trade rail sits directly under the search bar as the fast lane: one
 * tap, no sheet. Icons carry it, because at a glance a shape is quicker to
 * scan than seven words. Active is an underline rather than a filled pill —
 * a filled pill here would compete with the bar above it.
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
      className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      <div className="flex w-max gap-1">
        <RailItem
          icon={LayoutGrid}
          label="All"
          active={trade === null}
          onClick={() => onChange(null)}
        />
        {TRADES.map((t) => (
          <RailItem
            key={t}
            icon={TRADE_ICONS[t]}
            label={TRADE_LABELS[t]}
            active={trade === t}
            onClick={() => onChange(trade === t ? null : t)}
          />
        ))}
      </div>
    </div>
  );
}

function RailItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable relative flex shrink-0 flex-col items-center gap-1.5 px-3 pt-2 pb-2.5 ${
        active ? "text-ink" : "text-sub hover:text-ink"
      }`}
    >
      <Icon size={21} strokeWidth={active ? 2.2 : 1.8} />
      <span className="caption font-semibold text-current">{label}</span>
      {/* Underline, not a moving indicator: colour is the only thing the
          styleguide lets a filter toggle animate. */}
      <span
        aria-hidden
        className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors duration-200 ${
          active ? "bg-ink" : "bg-transparent"
        }`}
      />
    </button>
  );
}
