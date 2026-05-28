"use client";

import React from "react";

export const WorkerCardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="h-12 w-12 rounded-xl bg-zinc-100" />
      <div className="h-6 w-16 rounded-lg bg-zinc-100" />
    </div>
    <div className="mt-3 h-5 w-3/4 rounded-lg bg-zinc-100" />
    <div className="mt-2 h-4 w-1/3 rounded-lg bg-zinc-100" />
    <div className="mt-3 space-y-2">
      <div className="h-3 w-full rounded bg-zinc-100" />
      <div className="h-3 w-5/6 rounded bg-zinc-100" />
    </div>
    <div className="mt-4 flex gap-1">
      <div className="h-5 w-16 rounded bg-zinc-100" />
      <div className="h-5 w-14 rounded bg-zinc-100" />
    </div>
    <div className="mt-4 pt-4 border-t border-zinc-50">
      <div className="h-4 w-2/3 rounded bg-zinc-100" />
      <div className="mt-2 h-10 w-full rounded-lg bg-zinc-100" />
    </div>
    <div className="mt-4 h-9 w-full rounded-xl bg-zinc-100" />
  </div>
);

export const WorkerGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <WorkerCardSkeleton key={i} />
    ))}
  </div>
);

export const BannerSkeleton: React.FC = () => (
  <div className="w-full h-[220px] sm:h-[260px] rounded-3xl bg-zinc-100 animate-pulse border border-zinc-200/50" />
);

export const CategoryGridSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} className="rounded-2xl border border-zinc-100 bg-white p-5 animate-pulse">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-100" />
        <div className="mx-auto mt-4 h-4 w-16 rounded bg-zinc-100" />
      </div>
    ))}
  </div>
);

export default WorkerGridSkeleton;
