"use client";

import { useState } from "react";
import { Filters, NO_FILTERS, activeFilterCount } from "../lib/artisans";
import { BannerRail } from "./BannerRail";
import { BrowseScreen } from "./BrowseScreen";
import { SearchBar } from "./SearchBar";
import { TradeRail } from "./TradeRail";

/**
 * One query, three ways in: the bar's sheet, the trade rail, and the
 * empty state's clear button. They all write the same object, so the bar
 * always reads back exactly what the list is showing.
 */
export function HomeScreen() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const filtering = activeFilterCount(filters) > 0;

  return (
    <>
      <SearchBar filters={filters} onChange={setFilters} />
      <TradeRail
        trade={filters.trade}
        onChange={(trade) => setFilters({ ...filters, trade })}
      />

      {/* The promo rail is for an undecided visitor. Once the query has
          narrowed, results move up to meet the filters instead. */}
      {!filtering && <BannerRail />}

      <BrowseScreen filters={filters} onChange={setFilters} />
    </>
  );
}
