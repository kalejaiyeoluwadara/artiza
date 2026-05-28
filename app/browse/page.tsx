"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, UserX } from "lucide-react";
import { useApp } from "../../context/AppContext";
import WorkerCard from "../../components/browse/WorkerCard";
import WorkerFilter from "../../components/browse/WorkerFilter";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { WorkerGridSkeleton } from "../../components/ui/LoadingSkeleton";

const getStartingPrice = (priceRangeStr: string): number => {
  const clean = priceRangeStr.replace(/,/g, "");
  const match = clean.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { workers, isLoaded } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedRating, setSelectedRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Read filters from URL on mount / external navigation
  useEffect(() => {
    const categoryParam = searchParams.get("category") || "all";
    const queryParam = searchParams.get("q") || "";
    const locationParam = searchParams.get("location") || "All Locations";
    const ratingParam = parseInt(searchParams.get("rating") || "0", 10);
    const maxPriceParam = parseInt(searchParams.get("maxPrice") || "15000", 10);

    setSelectedCategory(categoryParam);
    setSearchQuery(queryParam);
    setSelectedLocation(locationParam);
    setSelectedRating(Number.isNaN(ratingParam) ? 0 : ratingParam);
    setMaxPrice(Number.isNaN(maxPriceParam) ? 15000 : maxPriceParam);
    setHasInitialized(true);
  }, [searchParams]);

  // Sync filter changes back to URL for shareable links
  useEffect(() => {
    if (!hasInitialized) return;

    const params = new URLSearchParams();
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedLocation !== "All Locations") params.set("location", selectedLocation);
    if (selectedRating > 0) params.set("rating", String(selectedRating));
    if (maxPrice < 15000) params.set("maxPrice", String(maxPrice));

    const query = params.toString();
    router.replace(query ? `/browse?${query}` : "/browse", { scroll: false });
  }, [
    hasInitialized,
    selectedCategory,
    searchQuery,
    selectedLocation,
    selectedRating,
    maxPrice,
    router,
  ]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("All Locations");
    setSelectedRating(0);
    setMaxPrice(15000);
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    if (!worker.active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = worker.name.toLowerCase().includes(q);
      const matchesBio = worker.bio.toLowerCase().includes(q);
      const matchesSkills = worker.skills.some((s) => s.toLowerCase().includes(q));
      const matchesCategory = worker.category.toLowerCase().includes(q);

      if (!matchesName && !matchesBio && !matchesSkills && !matchesCategory) {
        return false;
      }
    }

    if (selectedCategory !== "all" && worker.category !== selectedCategory) {
      return false;
    }

    if (selectedLocation !== "All Locations" && worker.location !== selectedLocation) {
      return false;
    }

    if (selectedRating > 0 && worker.rating < selectedRating) {
      return false;
    }

    const startPrice = getStartingPrice(worker.priceRange);
    if (maxPrice < 15000 && startPrice > maxPrice) {
      return false;
    }

    return true;
  });

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedLocation !== "All Locations" ||
    selectedRating > 0 ||
    maxPrice < 15000;

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 animate-pulse">
          <div className="h-8 w-64 rounded-lg bg-zinc-100" />
          <div className="mt-2 h-4 w-48 rounded bg-zinc-100" />
        </div>
        <WorkerGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            Browse Skilled Hands
          </h1>
          <p className="text-xs text-zinc-500 font-semibold mt-0.5">
            Showing {filteredWorkers.length} verified worker{filteredWorkers.length !== 1 ? "s" : ""} in Ilisan-Remo.
          </p>
        </div>

        <div className="flex gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="search"
              placeholder="Search by name or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search workers by name or skills"
              className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-xs text-zinc-800 placeholder-zinc-400 outline-none transition-all focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 font-semibold"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterModalOpen(true)}
            className="md:hidden flex-shrink-0 cursor-pointer font-bold"
            leftIcon={<SlidersHorizontal className="h-4 w-4" />}
            aria-label="Open filters"
          >
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="hidden md:block w-72 flex-shrink-0 sticky top-24">
          <WorkerFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            clearFilters={clearFilters}
          />
        </div>

        <Modal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          title="Filter Artisan Services"
        >
          <div className="pb-2">
            <WorkerFilter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              selectedRating={selectedRating}
              setSelectedRating={setSelectedRating}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              clearFilters={clearFilters}
            />
            <Button
              variant="primary"
              fullWidth
              className="mt-6 font-bold cursor-pointer"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </Modal>

        <div className="flex-1 w-full">
          {filteredWorkers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-zinc-200/80 rounded-3xl min-h-[300px]">
              <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 shadow-inner mb-4">
                <UserX className="h-6 w-6 text-zinc-400" />
              </div>
              <h3 className="text-base font-extrabold text-zinc-800 tracking-tight">
                {hasActiveFilters ? "No Workers Match Your Filters" : "No Workers Available Yet"}
              </h3>
              <p className="text-xs text-zinc-500 font-semibold max-w-xs mt-1.5 leading-relaxed">
                {hasActiveFilters
                  ? "Try widening your search keywords, raising your daily price range limit, or picking a different category."
                  : "Check back soon — new artisans are being added to IlisanHands regularly."}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-5 font-bold cursor-pointer"
                  onClick={clearFilters}
                >
                  Clear Active Filters
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredWorkers.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Browse() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8">
          <WorkerGridSkeleton count={6} />
        </div>
      }
    >
      <BrowseContent />
    </Suspense>
  );
}
