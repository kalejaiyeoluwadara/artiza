"use client";

import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";
import WorkerCard from "../browse/WorkerCard";
import Button from "../ui/Button";
import { WorkerGridSkeleton } from "../ui/LoadingSkeleton";

export const FeaturedWorkers: React.FC = () => {
  const { workers, isLoaded } = useApp();
  const featuredWorkers = workers.filter((w) => w.featured && w.active).slice(0, 3);

  if (!isLoaded) {
    return (
      <section className="py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="mb-8 animate-pulse">
          <div className="h-4 w-24 rounded-full bg-zinc-100 mb-2" />
          <div className="h-8 w-64 rounded-lg bg-zinc-100" />
        </div>
        <WorkerGridSkeleton count={3} />
      </section>
    );
  }

  if (featuredWorkers.length === 0) return null;

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto w-full bg-white rounded-3xl border border-zinc-100 shadow-sm shadow-zinc-100/50">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full mb-2">
            <Sparkles className="h-3 w-3" />
            Top Choice
          </span>
          <h2 className="text-2xl font-black text-zinc-800 tracking-tight">
            Highly Rated Workers
          </h2>
          <p className="text-sm text-zinc-500 font-medium mt-0.5">
            Artisans and helpers with top reviews from fellow Ilisan community residents.
          </p>
        </div>

        <Button
          href="/browse"
          variant="outline"
          size="sm"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          className="cursor-pointer font-bold"
        >
          See All Workers
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredWorkers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </section>
  );
};
export default FeaturedWorkers;
