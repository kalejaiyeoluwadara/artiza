"use client";

import React, { use } from "react";
import { ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import WorkerDetails from "../../../components/profile/WorkerDetails";
import ReviewForm from "../../../components/profile/ReviewForm";
import ReviewList from "../../../components/profile/ReviewList";
import Button from "../../../components/ui/Button";
import { WorkerGridSkeleton } from "../../../components/ui/LoadingSkeleton";

interface ProfileProps {
  params: Promise<{ id: string }>;
}

export default function Profile({ params }: ProfileProps) {
  const { id } = use(params);
  const { workers, reviews, isLoaded } = useApp();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-8 w-32 rounded-lg bg-zinc-100 animate-pulse" />
        <WorkerGridSkeleton count={1} />
      </div>
    );
  }

  const worker = workers.find((w) => w.id === id);
  const workerReviews = reviews.filter((r) => r.workerId === id);

  if (!worker) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center flex flex-col items-center">
        <div className="h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-rose-500 shadow-inner mb-4">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-black text-zinc-800 tracking-tight">
          Worker Profile Not Found
        </h2>
        <p className="text-xs text-zinc-500 font-semibold max-w-xs mt-1.5 leading-relaxed">
          The worker profile you are trying to view does not exist or has been deleted by an administrator.
        </p>
        <Button
          href="/browse"
          variant="secondary"
          size="sm"
          className="mt-6 font-bold cursor-pointer"
        >
          Back to Browse Workers
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Button
          href="/browse"
          variant="ghost"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          className="cursor-pointer font-bold pl-1 text-zinc-500 hover:text-zinc-950 hover:bg-transparent"
        >
          Back to Browse
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <WorkerDetails worker={worker} />

          <div className="flex flex-col gap-5">
            <h2 className="text-lg font-black text-zinc-800 flex items-center gap-2 pl-1.5 tracking-tight border-b border-zinc-100 pb-3">
              <MessageSquare className="h-5 w-5 text-orange-500" />
              Community Reviews ({workerReviews.length})
            </h2>
            <ReviewList reviews={workerReviews} />
          </div>
        </div>

        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-zinc-100 p-5 rounded-2xl shadow-sm text-center lg:text-left flex flex-col gap-1.5">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest pl-0.5">
                Vetted Quality
              </h3>
              <p className="text-xs font-semibold leading-relaxed text-zinc-500">
                This worker has committed to delivering professional-grade services. If you hire them, please leave feedback to help other community members.
              </p>
            </div>
            <ReviewForm workerId={worker.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
